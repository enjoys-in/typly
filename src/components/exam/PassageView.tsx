import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
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
//
// `settle` marks the character the caret has just left. It animates a text
// shadow and nothing else — a transform would need `display: inline-block`,
// which is a line-break opportunity, and the passage would re-wrap on every
// keystroke. That bug is the reason the caret left the text flow at all.
const Char = memo(function Char({
  ch,
  state,
  settle = false,
}: {
  ch: string;
  state: CharState;
  settle?: boolean;
}) {
  return <span className={`${STATE_CLASS[state]} ${settle ? 'char-settle' : ''}`}>{ch}</span>;
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
  // Three roles, deliberately separate: `anchorRef` is a zero-width probe
  // sitting in the text flow that reports where the cursor *is*; `barRef` is
  // the visible caret, positioned out of flow so it can be animated at all;
  // `proseRef` is the box both are measured against.
  const anchorRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const proseRef = useRef<HTMLParagraphElement>(null);
  const lastLineTop = useRef<number | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    anchorRef.current?.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' });
  }, [caret, cursor]);

  /**
   * Move the caret to the anchor.
   *
   * Written straight to the element's style rather than through state: this
   * runs on every keystroke, and re-rendering the whole passage to move a 2px
   * bar would be the most expensive thing on the screen. One rect read per
   * keystroke, which `scrollIntoView` above already forces anyway.
   *
   * Along the row the move is eased, which is the whole point — but a *wrap*
   * is not eased. Animating that would drag the caret diagonally back across
   * the full width of the panel, over the text being read, every time a line
   * ends. So a change of line is applied instantly and only horizontal travel
   * glides.
   */
  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const bar = barRef.current;
    const prose = proseRef.current;
    if (!anchor || !bar || !prose) return;
    const a = anchor.getBoundingClientRect();
    const box = prose.getBoundingClientRect();
    const x = a.left - box.left;
    const y = a.top - box.top;
    const sameLine = lastLineTop.current !== null && Math.abs(y - lastLineTop.current) < 1;
    bar.style.transitionDuration = sameLine ? '' : '0s';
    bar.style.transform = `translate(${x}px, ${y}px)`;
    bar.style.height = `${a.height}px`;
    lastLineTop.current = y;
  }, []);

  useLayoutEffect(() => {
    if (!caret) return;
    const bar = barRef.current;
    if (!bar) return;

    place();

    // Solid while typing, blinking once you stop. A caret that blinks *through*
    // a burst of typing is the thing that reads as cheap.
    bar.dataset.moving = '1';
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => delete bar.dataset.moving, 640);
  }, [caret, cursor, fontScale, fontFamily, passage, place]);

  // The passage re-wraps when the panel changes width, which moves the anchor
  // without changing the cursor — so the caret has to be told. Kept in its own
  // effect deliberately: folded into the one above it would allocate and tear
  // down an observer on every single keystroke.
  useEffect(() => {
    if (!caret) return;
    const prose = proseRef.current;
    if (!prose) return;
    const observer = new ResizeObserver(place);
    observer.observe(prose);
    return () => observer.disconnect();
  }, [caret, place]);

  // A pending idle timer must not fire into an unmounted node.
  useEffect(
    () => () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    },
    [],
  );

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
          ref={proseRef}
          // The passage runs the full width of the panel. A capped measure left
          // wide empty gutters either side of the text, and every wrap the cap
          // forced was a wrap the panel itself did not need.
          //
          // `leading-[1.85]` is looser than prose would want. Copy-typing is
          // read one line at a time and returned to, over and over, and the
          // open rhythm is what stops the eye landing on the wrong line.
          //
          // `relative` is what makes it the caret's containing block, so the
          // bar can be positioned in the paragraph's own coordinates.
          className="relative flex-1 px-6 py-6 font-mono leading-[1.85] whitespace-pre-wrap select-none"
          style={{ fontSize: `${fontScale * 1.125}rem`, fontFamily }}
        >
          {chars.slice(0, cursor).map((ch, i) => (
            <Char
              key={i}
              ch={ch}
              state={states[i] ?? 'untyped'}
              settle={caret && i === cursor - 1}
            />
          ))}
          {caret && <span ref={anchorRef} aria-hidden className="caret-anchor" />}
          {chars.slice(cursor, spanEnd).map((ch, i) => (
            <Char key={cursor + i} ch={ch} state={states[cursor + i] ?? 'untyped'} />
          ))}
          {tail && <span className={STATE_CLASS.untyped}>{tail}</span>}
          {caret && <span ref={barRef} aria-hidden className="type-caret" />}
        </p>
      </div>
      {/* Sits over the scroller, inside the panel's border. */}
      <div aria-hidden className="passage-fade" />
    </div>
  );
}
