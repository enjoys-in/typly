import { memo, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { evaluate, type CharState } from '@/core/typing/typingEngine';
import { useT } from '@/i18n';

const STATE_CLASS: Record<CharState, string> = {
  // Upcoming text is what the eye is actually reading, so it stays high
  // contrast; already-typed text recedes hard, which is what makes the caret
  // findable without hunting for it.
  untyped: 'text-fg',
  correct: 'text-fg-subtle',
  // A mistake is underlined as well as filled. Colour alone is not a signal
  // everyone receives, and a red block on a red-blind screen is just a block.
  incorrect: 'bg-danger/15 text-danger-text rounded-[3px] underline decoration-danger decoration-2 underline-offset-2',
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
  const t = useT();
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
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    caretRef.current?.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' });
  }, [caret, cursor]);

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      role="region"
      aria-label={t('exam.passageRegion')}
      // A flex column that clips, holding a scroller that shrinks. Callers size
      // this panel two different ways — `flex-1` inside the exam's column, and a
      // bare `max-h-72` in the replay — and only `min-h-0 flex-1` on the inner
      // scroller makes both of them scroll instead of one of them overflowing.
      className={`panel-lit relative flex flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-e1 ${className}`}
    >
      {/* The scroller is an inner element now, not the panel. A panel that is
          itself the scroll container puts its scrollbar over its own rounded
          corners, and any header inside it has to be sticky to survive. */}
      <div className="scroll-area flex min-h-0 flex-1 scroll-pb-16 flex-col">
        {toolbar && (
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface/80 px-4 py-2 backdrop-blur-md">
            <span className="text-[10.5px] font-semibold tracking-[0.11em] text-fg-subtle uppercase">
              {t('exam.passageRegion')}
            </span>
            {toolbar}
          </div>
        )}
        <p
          // The passage runs the full width of the panel. A capped measure left
          // wide empty gutters either side of the text, and every wrap the cap
          // forced was a wrap the panel itself did not need.
          //
          // `leading-[1.85]` is looser than prose would want. Copy-typing is
          // read one line at a time and returned to, over and over, and the
          // open rhythm is what stops the eye landing on the wrong line.
          className="flex-1 px-6 py-6 font-mono leading-[1.85] whitespace-pre-wrap select-none"
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
      {/* Sits over the scroller, inside the panel's border. */}
      <div aria-hidden className="passage-fade" />
    </div>
  );
}
