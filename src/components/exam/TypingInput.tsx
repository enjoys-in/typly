import { useState, type KeyboardEvent } from 'react';
import { toDevanagari } from '@/core/text/hindiPhonetic';
import type { Keymap } from '@/core/text/keymap';
import { useFlash } from '@/hooks/useFlash';
import { useT } from '@/i18n';

interface Props {
  typed: string;
  disabled: boolean;
  pasteAllowed: boolean;
  backspaceEnabled: boolean;
  spaceEnabled: boolean;
  enterEnabled: boolean;
  /** Error-free mode: reject any printable key that isn't the next expected character. */
  enforceCorrect?: boolean;
  expectedChar?: string;
  /** Phonetic input: type Roman, compare Devanagari against the passage. */
  phonetic?: boolean;
  /** Key remapping (InScript, Remington) applied as you type. */
  keymap?: Keymap | null;
  /** Font family override (Hindi fonts like Mangal / Kruti Dev). */
  fontFamily?: string;
  /** Text scale, kept in step with the passage. */
  fontScale?: number;
  onChange: (next: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  /** A keystroke the exam rules refused, so the run can report it. */
  onBlocked?: (key: string) => void;
}

export function TypingInput({
  typed,
  disabled,
  pasteAllowed,
  backspaceEnabled,
  spaceEnabled,
  enterEnabled,
  enforceCorrect = false,
  expectedChar,
  phonetic = false,
  keymap = null,
  fontFamily,
  fontScale = 1,
  onChange,
  onKeyDown,
  onBlocked,
}: Props) {
  const t = useT();
  // In phonetic mode the textarea holds Roman text; `typed` (Devanagari) is derived.
  const [roman, setRoman] = useState('');
  // A refused key is invisible without this: the field flashes so a blocked
  // keystroke reads as "not allowed" instead of "the app is broken".
  const [rejected, flashRejected] = useFlash();

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (phonetic) {
      setRoman(e.target.value);
      onChange(toDevanagari(e.target.value));
    } else {
      onChange(e.target.value);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Remapped layouts translate the physical key and insert it themselves.
    if (keymap && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
      const el = e.currentTarget;
      const start = el.selectionStart ?? typed.length;
      const end = el.selectionEnd ?? typed.length;
      const output = keymap.resolve(e.key, typed.slice(0, start));
      if (output) {
        e.preventDefault();
        // A typewriter layout can fold the key into what precedes it (a half
        // consonant becoming whole), so the output replaces that much text.
        const from = Math.max(0, start - output.replace);
        onKeyDown(e); // log the keystroke before the value changes
        onChange(typed.slice(0, from) + output.text + typed.slice(end));
        return;
      }
    }
    const remapped = phonetic || keymap !== null;
    const blocked =
      (!backspaceEnabled && (e.key === 'Backspace' || e.key === 'Delete')) ||
      (!spaceEnabled && e.key === ' ') ||
      (!enterEnabled && e.key === 'Enter') ||
      (!remapped && enforceCorrect && e.key.length === 1 && e.key !== expectedChar);
    if (blocked) {
      e.preventDefault();
      flashRejected();
      onBlocked?.(e.key);
      return;
    }
    onKeyDown(e);
  }

  const label = keymap ? t('exam.typeHereLayout', { layout: keymap.label }) : t('exam.inputLabel');

  return (
    <textarea
      autoFocus
      aria-label={label}
      disabled={disabled}
      value={phonetic ? roman : typed}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={(e) => !pasteAllowed && e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      spellCheck={false}
      aria-invalid={rejected || undefined}
      style={{ fontSize: `${fontScale * 1.125}rem`, fontFamily }}
      className={`h-28 w-full resize-none rounded-control border bg-field p-4 font-mono outline-none transition-colors disabled:opacity-60 ${
        rejected
          ? 'border-danger bg-danger-soft ring-4 ring-danger-ring'
          : 'border-edge focus:border-accent focus:ring-4 focus:ring-accent-ring'
      }`}
      placeholder={
        phonetic
          ? t('exam.typeHereRoman')
          : keymap
            ? t('exam.typeHereLayout', { layout: keymap.label })
            : t('exam.typeHere')
      }
    />
  );
}
