import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { TextCursorInput } from 'lucide-react';
import { toDevanagari } from '@/core/text/hindiPhonetic';
import { isWordBoundary, wordComplete } from '@/core/typing/strict';
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
  /**
   * Strict mode: nothing advances past a word until that word is correct. The
   * standard cure for typing fast and fixing later — a habit that passes a
   * practice app and fails an accuracy-gated exam like DEST at 90%.
   */
  strict?: boolean;
  /** The passage, needed by strict mode to know what the current word should be. */
  passage?: string;
  expectedChar?: string;
  /** Phonetic input: type Roman, compare Devanagari against the passage. */
  phonetic?: boolean;
  /** Key remapping (InScript, Remington) applied as you type. */
  keymap?: Keymap | null;
  /** Font family override (Hindi fonts like Mangal / Kruti Dev). */
  fontFamily?: string;
  /** Text scale, kept in step with the passage. */
  fontScale?: number;
  /**
   * Take the field off the screen and type straight into the passage.
   *
   * It is hidden, never unmounted: it is still the element every keystroke
   * arrives at, so it has to stay in the document and keep the focus. The
   * passage's own caret and colouring are what the typist reads instead.
   */
  hidden?: boolean;
  onChange: (next: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  /** A keystroke the exam rules refused, so the run can report it. */
  onBlocked?: (key: string) => void;
}

/**
 * Editing chords that can undo a whole run in one keypress.
 *
 * Select-all is the dangerous one. ⌘A leaves the entire transcript selected and
 * the very next character replaces it, so a candidate eight minutes into a
 * paper run — where there is no passage to retype from, only what they have
 * typed — can lose all of it to one mistimed chord. Undo does the same in a
 * single step, redo undoes the recovery, and cut is a delete that also walks
 * off with a copy.
 *
 * None of the four is typing, which is the only thing this field exists to
 * accept, so all four are refused down the same path as a disabled Backspace:
 * the field flashes, the run counts a blocked keystroke, and the text does not
 * move. Paste is deliberately absent — it has its own rule (`pasteAllowed`),
 * because some boards do allow it.
 */
const WRECKING_CHORDS = new Set(['a', 'z', 'y', 'x']);

export function TypingInput({
  typed,
  disabled,
  pasteAllowed,
  backspaceEnabled,
  spaceEnabled,
  enterEnabled,
  enforceCorrect = false,
  strict = false,
  passage = '',
  expectedChar,
  phonetic = false,
  keymap = null,
  fontFamily,
  fontScale = 1,
  hidden = false,
  onChange,
  onKeyDown,
  onBlocked,
}: Props) {
  const t = useT();
  const ref = useRef<HTMLTextAreaElement>(null);
  // In phonetic mode the textarea holds Roman text; `typed` (Devanagari) is derived.
  const [roman, setRoman] = useState('');
  // Only consulted while hidden: a field nobody can see is also a field nobody
  // can click, so losing the focus has to be recoverable.
  const [focused, setFocused] = useState(false);
  // A refused key is invisible without this: the field flashes so a blocked
  // keystroke reads as "not allowed" instead of "the app is broken".
  const [rejected, flashRejected] = useFlash();

  /**
   * Take the focus back whenever the field is live again.
   *
   * A disabled textarea loses focus to the document, and nothing gives it back:
   * pausing disables the field, and the Resume button that re-enables it is
   * itself the focused element afterwards. So the run would restart with the
   * clock ticking and every keystroke going nowhere — the field looked ready
   * and was not. The same effect covers the first mount, which is what
   * `autoFocus` used to do on its own.
   *
   * The caret goes to the end of the text rather than wherever it was, because
   * the only place typing can sensibly continue is where it stopped.
   */
  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const end = el.value.length;
    el.setSelectionRange(end, end);
    // `hidden` is a dependency because hiding the field re-parents it into a
    // clipped wrapper, and `preventScroll` matters most there: without it the
    // browser scrolls a 1px box into view and takes the passage with it.
  }, [disabled, hidden]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (phonetic) {
      setRoman(e.target.value);
      onChange(toDevanagari(e.target.value));
    } else {
      onChange(e.target.value);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Before anything else, including the layout remapping below: a chord is
    // never a character, and this one must not reach the value at all.
    if ((e.ctrlKey || e.metaKey) && !e.altKey && WRECKING_CHORDS.has(e.key.toLowerCase())) {
      e.preventDefault();
      flashRejected();
      // Reported as the chord it was. Handing the chip a bare "a" would show
      // the candidate a letter they never typed, on a finger they never used.
      onBlocked?.(`${e.metaKey ? '⌘' : 'Ctrl+'}${e.key.toUpperCase()}`);
      return;
    }
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
    // Strict mode gates only the word *boundary*: inside a word you may make
    // and fix a mistake, but you cannot carry it into the next word. Blocking
    // every wrong key would be error-free mode, which is a different exercise.
    const strictBlocked =
      strict && !remapped && isWordBoundary(e.key) && !wordComplete(passage, typed);
    const blocked =
      (!backspaceEnabled && (e.key === 'Backspace' || e.key === 'Delete')) ||
      (!spaceEnabled && e.key === ' ') ||
      (!enterEnabled && e.key === 'Enter') ||
      strictBlocked ||
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

  const field = (
    <textarea
      ref={ref}
      aria-label={label}
      disabled={disabled}
      value={phonetic ? roman : typed}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={(e) => !pasteAllowed && e.preventDefault()}
      // A drop is a paste that came in by mouse, so it answers to the same
      // rule; a drag *out* of the field moves the transcript around, which is
      // not typing however it is done. Cut is refused even from a menu, where
      // no keystroke exists for the chord guard above to catch.
      onDrop={(e) => !pasteAllowed && e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      spellCheck={false}
      aria-invalid={rejected || undefined}
      style={{ fontSize: `${fontScale * 1.125}rem`, fontFamily }}
      // A recessed well rather than a raised box: the passage above is the
      // panel you read, this is the slot you type into, and the two should not
      // look like siblings. The rejection state is a ring and a tint, never a
      // size change — the field must not resize under the hands mid-word.
      //
      // The focus ring is deliberately a single pixel. This field holds focus
      // for the entire run, so its "focused" look is really its normal look,
      // and a 4px accent glow around it outshouted the passage above — the one
      // thing on the screen that has to be read. The loud ring is spent on
      // rejection instead, where it fires for a moment and means something.
      // Fills the pane it is given rather than standing at a fixed height: the
      // splitter above it owns that now (and in paper mode the pane is the
      // whole page). The floor is what stops a hard drag squeezing the field
      // down to a line and a half.
      className={`min-h-16 w-full flex-1 resize-none rounded-panel border p-4 font-mono leading-[1.6] shadow-e1 outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-fg-subtle disabled:opacity-55 ${
        rejected
          ? 'border-danger bg-danger-soft ring-4 ring-danger-ring'
          : 'border-edge bg-inset focus:border-accent-border focus:bg-field focus:ring-1 focus:ring-accent-ring'
      }`}
      placeholder={
        phonetic
          ? t('exam.typeHereRoman')
          : keymap
            ? t('exam.typeHereLayout', { layout: keymap.label })
            : t('exam.typeHere')
      }
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );

  if (!hidden) return field;

  /*
   * Hidden, but present and focused.
   *
   * `sr-only` rather than `display: none` or unmounting: this element is where
   * every keystroke in the run arrives, and a field that is not in the layout
   * cannot hold the focus. Clipped to a pixel it still does, and the passage's
   * caret and colouring — which are a better read of the same information —
   * take over the whole column.
   *
   * The catch is the one thing a hidden control cannot do: be clicked. If the
   * focus does go elsewhere (a toolbar chip, a stray click on the canvas) the
   * run would look live and swallow every key, which is exactly the failure
   * pausing used to cause. So the wrapper shows a way back the moment focus is
   * lost, and nothing at all while it is held.
   */
  return (
    <div className="shrink-0">
      <span className="sr-only">{field}</span>
      {!focused && !disabled && (
        <button
          type="button"
          onClick={() => ref.current?.focus({ preventScroll: true })}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-dashed border-edge bg-surface-2 px-3 py-2 text-xs font-semibold text-fg-muted outline-none transition-colors duration-150 hover:border-accent-border hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-ring"
        >
          <TextCursorInput size={14} className="shrink-0" />
          {t('exam.inputHiddenResume')}
        </button>
      )}
    </div>
  );
}
