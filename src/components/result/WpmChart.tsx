import type { TimelinePoint } from '@/core/types';

const W = 640;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 26, left: 32 };

// Per-minute WPM (green) + accuracy (orange) drawn as a lightweight inline SVG — no chart dep.
export function WpmChart({ timeline }: { timeline: TimelinePoint[] }) {
  if (timeline.length === 0) {
    return <p className="text-sm text-fg-muted">No timeline data for this test.</p>;
  }

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const n = timeline.length;
  const maxWpm = Math.max(10, ...timeline.map((p) => p.wpm));

  const x = (i: number) => PAD.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yWpm = (v: number) => PAD.top + innerH - (v / maxWpm) * innerH;
  const yAcc = (v: number) => PAD.top + innerH - (v / 100) * innerH;

  const wpmPath = timeline.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yWpm(p.wpm)}`).join(' ');
  const accPath = timeline
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yAcc(p.accuracy)}`)
    .join(' ');

  const gridY = [0, 0.5, 1];
  const labelStep = Math.max(1, Math.ceil(n / 8));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs font-medium">
        <span className="flex items-center gap-1.5 text-accent-text">
          <span className="bg-accent h-2 w-2 rounded-full" /> WPM
        </span>
        <span className="flex items-center gap-1.5 text-[var(--brand-accent-from)]">
          <span className="brand-accent-gradient h-2 w-2 rounded-full" /> Accuracy %
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Per-minute WPM and accuracy"
      >
        {gridY.map((g) => {
          const y = PAD.top + innerH - g * innerH;
          return (
            <g key={g}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y}
                y2={y}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text x={4} y={y + 3} className="fill-fg-subtle text-[9px]">
                {Math.round(g * maxWpm)}
              </text>
            </g>
          );
        })}

        {timeline.map((_, i) =>
          i % labelStep === 0 ? (
            <text
              key={i}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-fg-subtle text-[9px]"
            >
              {i + 1}m
            </text>
          ) : null,
        )}

        <path d={accPath} fill="none" stroke="var(--brand-accent-from)" strokeWidth={2} />
        <path d={wpmPath} fill="none" stroke="var(--accent)" strokeWidth={2} />

        {timeline.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={yAcc(p.accuracy)} r={2.5} fill="var(--brand-accent-from)" />
            <circle cx={x(i)} cy={yWpm(p.wpm)} r={2.5} fill="var(--accent)" />
          </g>
        ))}
      </svg>
    </div>
  );
}
