import { memo, useMemo, type ReactNode } from 'react';
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
}: Props) {
  const chars = useMemo(() => passage.split(''), [passage]);
  const states = useMemo(() => (blind ? [] : evaluate(passage, typed).states), [passage, typed, blind]);

  const spanEnd = blind ? 0 : Math.min(passage.length, typed.length + TAIL_LOOKAHEAD);
  const tail = passage.slice(spanEnd);

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
        // the cap scales with the font, so it never runs past ~70 characters.
        className="max-w-[70ch] px-5 py-5 font-mono leading-relaxed whitespace-pre-wrap select-none"
        style={{ fontSize: `${fontScale * 1.125}rem`, fontFamily }}
      >
        {chars.slice(0, spanEnd).map((ch, i) => (
          <Char key={i} ch={ch} state={states[i] ?? 'untyped'} />
        ))}
        {tail && <span className={STATE_CLASS.untyped}>{tail}</span>}
      </p>
    </div>
  );
}
