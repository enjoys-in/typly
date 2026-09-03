import { memo, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { evaluate, type CharState } from '@/core/typing/typingEngine';

const STATE_CLASS: Record<CharState, string> = {
  // Upcoming text is what the eye is actually reading, so it stays high
  // contrast; already-typed text recedes.
  untyped: 'text-fg',
  correct: 'text-fg-subtle',
  incorrect: 'bg-danger text-danger-fg rounded-[2px]',
};

// Memoized per-character span: only re-renders when its own state changes.
const Char = memo(function Char({ ch, state }: { ch: string; state: CharState }) {
  return <span className={STATE_CLASS[state]}>{ch}</span>;
});

interface Props {
  passage: string;
  typed: string;
  className?: string;
  /** Text scale multiplier from the zoom control. */
  fontScale?: number;
  /** Controls pinned to the top-right of the panel (zoom, etc.). */
  toolbar?: ReactNode;
  /** Blind mode: show the passage without live correct/incorrect colouring. */
  blind?: boolean;
  /** Font family override (Hindi fonts like Mangal / Kruti Dev). */
  fontFamily?: string;
  /** Mark the typing position and keep it in view. Off for static previews. */
  caret?: boolean;
}

// Characters typed + this many look-ahead chars render as individual spans; the far
// untyped tail is uniformly styled, so it collapses to one node to keep the DOM light.
const TAIL_LOOKAHEAD = 300;

// Scrollable, color-coded passage. Prevents stealing focus from the input on click.
export function PassageView({
  passage,
  typed,
  className = '',
  fontScale = 1,
  toolbar,
  blind = false,
  fontFamily,
  caret = false,
}: Props) {
  const chars = useMemo(() => passage.split(''), [passage]);
  const states = useMemo(() => (blind ? [] : evaluate(passage, typed).states), [passage, typed, blind]);
  const caretRef = useRef<HTMLSpanElement>(null);

  // Blind mode reveals no progress at all, so it renders the passage as one
  // uniform tail with no cursor split.
  const cursor = blind ? 0 : Math.min(typed.length, passage.length);
  const spanEnd = blind ? 0 : Math.min(passage.length, typed.length + TAIL_LOOKAHEAD);
  const tail = passage.slice(spanEnd);

  // Follow the typing position. Without this the passage scrolls out from under
  // the typist on any passage taller than the panel.
  useEffect(() => {
    if (!caret) return;
    caretRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [caret, cursor]);

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className={`scroll-area relative rounded-panel border border-line bg-surface ${className}`}
    >
      {toolbar && (
        <div className="sticky top-0 z-10 flex justify-end border-b border-line bg-surface/95 px-3 py-2 backdrop-blur-sm">
          {toolbar}
        </div>
      )}
      <p
        // `ch`-based measure keeps the line length readable at every zoom step:
        // the cap scales with the font, so it never runs past ~90 characters.
        // Centred, so a panel wider than the measure gutters evenly instead of
        // leaving all the empty space on the right.
        className="mx-auto max-w-[90ch] px-5 py-5 font-mono leading-relaxed whitespace-pre-wrap select-none"
        style={{ fontSize: `${fontScale * 1.125}rem`, fontFamily }}
      >
        {chars.slice(0, cursor).map((ch, i) => (
          <Char key={i} ch={ch} state={states[i] ?? 'untyped'} />
        ))}
        {caret && <span ref={caretRef} aria-hidden className="type-caret" />}
        {chars.slice(cursor, spanEnd).map((ch, i) => (
          <Char key={cursor + i} ch={ch} state={states[cursor + i] ?? 'untyped'} />
        ))}
        {tail && <span className={STATE_CLASS.untyped}>{tail}</span>}
      </p>
    </div>
  );
}
