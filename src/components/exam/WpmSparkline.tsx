import { memo, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  /** Current gross speed, as the panel already computes it. */
  wpm: number;
  elapsedMs: number;
  /** The board's cut-off, drawn as the line to stay above. Zero to omit. */
  targetWpm?: number;
}

/** Samples kept — at one a second, a rolling forty-second window. */
const WINDOW = 40;
const EVERY_MS = 1_000;
/** Drawn in a unit box and stretched, so it fits whatever column it lands in. */
const VIEW = 100;

/**
 * The last forty seconds of speed, under the number it belongs to.
 *
 * A live WPM figure tells you where you are and nothing about where you are
 * going: 38 climbing and 38 sinking are the same digits and completely
 * different runs. The shape is the part a candidate can act on, and the cut-off
 * line turns it into the only question the exam asks — am I above it.
 *
 * Samples on the clock rather than on keystrokes, so the trace advances at a
 * constant rate and a fast burst does not compress the horizontal axis.
 */
export const WpmSparkline = memo(function WpmSparkline({ wpm, elapsedMs, targetWpm = 0 }: Props) {
  const samples = useRef<number[]>([]);
  const nextAt = useRef(0);
  const lastElapsed = useRef(0);
  // Re-render only when a sample actually lands. The exam re-renders on every
  // keystroke; the trace changes once a second.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // A run restarting inside the same mount winds the clock back, and the old
    // run's trace is not this run's history.
    if (elapsedMs < lastElapsed.current) {
      samples.current = [];
      nextAt.current = 0;
    }
    lastElapsed.current = elapsedMs;
    if (elapsedMs < nextAt.current) return;
    nextAt.current = elapsedMs + EVERY_MS;
    samples.current = [...samples.current, wpm].slice(-WINDOW);
    setVersion((v) => v + 1);
  }, [elapsedMs, wpm]);

  const shape = useMemo(() => {
    const points = samples.current;
    // One point is not a trend, and a single dot reads as a rendering fault.
    if (points.length < 2) return null;

    // Scaled to the *data*, not to the cut-off.
    //
    // Fitting the target into the same axis looks reasonable until you are a
    // long way off it: at 9 WPM against a cut-off of 35, a shared axis flattens
    // the whole trace onto the floor and the one thing the trace is for — the
    // shape, whether you are climbing or sinking — disappears. The gap to the
    // cut-off is already stated twice in words directly above, as the figure
    // and its target. The shape is stated nowhere else, so the axis is its.
    const lo = Math.min(...points);
    const hi = Math.max(...points);
    // A flat run would otherwise divide by zero; a floor on the span also stops
    // a half-WPM wobble being drawn as a mountain range.
    const span = Math.max(hi - lo, 4);
    const pad = span * 0.18;
    const top = hi + pad;
    const bottom = Math.max(lo - pad, 0);
    const x = (i: number) => (i / (points.length - 1)) * VIEW;
    const y = (v: number) => VIEW - ((v - bottom) / (top - bottom)) * VIEW;

    const line = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
    // The cut-off still shows even when it is off the axis: pinned to whichever
    // edge it is beyond, so "the bar is above everything here" stays readable.
    const targetY =
      targetWpm > 0 ? Math.max(0, Math.min(VIEW, y(targetWpm))) : null;
    return {
      line,
      // The same path closed along the baseline, for the wash underneath.
      area: `${line} L${VIEW},${VIEW} L0,${VIEW} Z`,
      targetY,
      last: { x: x(points.length - 1), y: y(points[points.length - 1]!) },
      // Above the line or below it decides the colour of the whole trace.
      passing: targetWpm > 0 ? points[points.length - 1]! >= targetWpm : true,
    };
  }, [version, targetWpm]);

  // Holds the row's height from the first render, so the panel does not jolt
  // when the second sample arrives and the trace appears.
  if (!shape) return <div aria-hidden className="h-9" />;

  const stroke = shape.passing ? 'var(--accent)' : 'var(--danger)';

  return (
    <div aria-hidden className="relative h-9 w-full">
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="spark-wash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Wash first, cut-off line over it, trace on top. Drawn the other way
            round the wash washes out the very line the trace is measured
            against. */}
        <path d={shape.area} fill="url(#spark-wash)" />

        {shape.targetY !== null && (
          <line
            x1="0"
            x2={VIEW}
            y1={shape.targetY}
            y2={shape.targetY}
            stroke="var(--fg-subtle)"
            strokeWidth="1"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* `non-scaling-stroke` is what keeps the line 1.5px thick after the
            unit box has been stretched to the column's width. */}
        <path
          d={shape.line}
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* The head is a DOM element, not an SVG circle.
          `preserveAspectRatio="none"` stretches the unit box unevenly — about
          7:1 in this column — and it stretches shapes with it, so a circle in
          there renders as a flat dash. `non-scaling-stroke` rescues the strokes
          but there is no equivalent for a radius. Positioned in percentages,
          which map linearly onto the same viewBox the trace uses. */}
      <span
        className="absolute h-1.5 w-1.5 rounded-full"
        style={{
          right: '-1px',
          top: `calc(${(shape.last.y / VIEW) * 100}% - 3px)`,
          background: stroke,
          boxShadow: `0 0 6px ${stroke}`,
        }}
      />
    </div>
  );
});
