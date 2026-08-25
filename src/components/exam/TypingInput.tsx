import { useState, type KeyboardEvent } from 'react';
import { toDevanagari } from '@/core/text/hindiPhonetic';
import { inscriptChar } from '@/core/text/inscript';

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
  /** Hindi phonetic input: type Roman, compare Devanagari against the passage. */
  phonetic?: boolean;
  /** Hindi InScript input: remap physical keys to Devanagari as you type. */
  inscript?: boolean;
  /** Font family override (Hindi fonts like Mangal / Kruti Dev). */
  fontFamily?: string;
  /** Text scale, kept in step with the passage. */
  fontScale?: number;
  onChange: (next: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
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
  inscript = false,
  fontFamily,
  fontScale = 1,
  onChange,
  onKeyDown,
}: Props) {
  // In phonetic mode the textarea holds Roman text; `typed` (Devanagari) is derived.
  const [roman, setRoman] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (phonetic) {
      setRoman(e.target.value);
      onChange(toDevanagari(e.target.value));
    } else {
      onChange(e.target.value);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // InScript: remap the physical key to Devanagari and insert it ourselves.
    if (inscript && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
      const mapped = inscriptChar(e.key);
      if (mapped !== null) {
        e.preventDefault();
        const el = e.currentTarget;
        const start = el.selectionStart ?? typed.length;
        const end = el.selectionEnd ?? typed.length;
        onKeyDown(e); // log the keystroke before the value grows
        onChange(typed.slice(0, start) + mapped + typed.slice(end));
        return;
      }
    }
    const blocked =
      (!backspaceEnabled && (e.key === 'Backspace' || e.key === 'Delete')) ||
      (!spaceEnabled && e.key === ' ') ||
      (!enterEnabled && e.key === 'Enter') ||
      (!phonetic && !inscript && enforceCorrect && e.key.length === 1 && e.key !== expectedChar);
    if (blocked) {
      e.preventDefault();
      return;
    }
    onKeyDown(e);
  }

  return (
    <textarea
      autoFocus
      disabled={disabled}
      value={phonetic ? roman : typed}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={(e) => !pasteAllowed && e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      spellCheck={false}
      style={{ fontSize: `${fontScale * 1.125}rem`, fontFamily }}
      className="h-28 w-full resize-none rounded-control border border-edge bg-field p-4 font-mono outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent-ring disabled:opacity-60"
      placeholder={
        phonetic
          ? 'Type in Roman — e.g. namaste'
          : inscript
            ? 'Type using the InScript layout'
            : 'Start typing here…'
      }
    />
  );
}
