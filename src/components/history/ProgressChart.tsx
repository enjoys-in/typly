import { useMemo } from 'react';
import { format } from 'date-fns';
import { ArrowRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { TestRow } from '@/core/types';
import { Stat } from '@/ui/Stat';

const W = 640;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 34 };

interface Point {
  netWpm: number;
  accuracy: number;
  date: string;
}

// Net WPM (accent) + accuracy (brand-accent) across the whole test history, so a
// user can compare test-to-test and see how much they improved. Inline SVG, no dep.
export function ProgressChart({ rows }: { rows: TestRow[] }) {
  // History comes newest-first; compare chronologically (oldest → newest).
  const points = useMemo<Point[]>(
    () =>
      [...rows]
        .reverse()
        .map((r) => ({ netWpm: r.netWpm, accuracy: r.accuracy, date: r.createdAt })),
    [rows],
  );

  if (points.length < 2) {
    return <p className="text-sm text-fg-muted">Take at least two tests to compare your progress.</p>;
  }

  const first = points[0]!;
  const last = points[points.length - 1]!;
  const wpmDelta = round1(last.netWpm - first.netWpm);
  const accDelta = round1(last.accuracy - first.accuracy);
  const bestWpm = round1(Math.max(...points.map((p) => p.netWpm)));
  const avgWpm = round1(points.reduce((s, p) => s + p.netWpm, 0) / points.length);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const n = points.length;
  const maxWpm = Math.max(10, ...points.map((p) => p.netWpm));

  const x = (i: number) => PAD.left + (i / (n - 1)) * innerW;
  const yWpm = (v: number) => PAD.top + innerH - (v / maxWpm) * innerH;
  const yAcc = (v: number) => PAD.top + innerH - (v / 100) * innerH;

  const wpmPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yWpm(p.netWpm)}`).join(' ');
  const accPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yAcc(p.accuracy)}`).join(' ');

  const gridY = [0, 0.5, 1];
  const labelStep = Math.max(1, Math.ceil(n / 8));

  return (
    <div className="space-y-5">
      {/* Before → after: first recorded test vs the latest one. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-panel bg-surface-2 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-fg-muted">First test</p>
          <p className="text-3xl font-bold tabular-nums">
            {first.netWpm} <span className="text-base font-normal text-fg-subtle">WPM</span>
          </p>
          <p className="text-xs text-fg-subtle">{format(new Date(first.date), 'dd MMM')}</p>
        </div>
        <ArrowRight className="text-fg-subtle" />
        <div>
          <p className="text-xs uppercase tracking-wide text-fg-muted">Latest test</p>
          <p className="text-accent-text text-3xl font-bold tabular-nums">
            {last.netWpm} <span className="text-base font-normal text-fg-subtle">WPM</span>
          </p>
          <p className="text-xs text-fg-subtle">{format(new Date(last.date), 'dd MMM')}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Delta value={wpmDelta} unit=" WPM" label="speed" />
          <Delta value={accDelta} unit="% accuracy" label="" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label="Tests taken" value={String(n)} />
        <Stat label="Best WPM" value={String(bestWpm)} accent />
        <Stat label="Average WPM" value={String(avgWpm)} />
        <Stat label="Latest accuracy" value={`${last.accuracy}%`} />
      </div>

      <div className="flex items-center gap-4 text-xs font-medium">
        <span className="text-accent-text flex items-center gap-1.5">
          <span className="bg-accent h-2 w-2 rounded-full" /> Net WPM
        </span>
        <span className="flex items-center gap-1.5 text-(--brand-accent-from)">
          <span className="brand-accent-gradient h-2 w-2 rounded-full" /> Accuracy %
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Net WPM and accuracy across tests"
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

        {points.map((_, i) =>
          i % labelStep === 0 || i === n - 1 ? (
            <text
              key={i}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-fg-subtle text-[9px]"
            >
              {i + 1}
            </text>
          ) : null,
        )}

        <path d={accPath} fill="none" stroke="var(--brand-accent-from)" strokeWidth={2} />
        <path d={wpmPath} fill="none" stroke="var(--accent)" strokeWidth={2} />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={yAcc(p.accuracy)} r={2.5} fill="var(--brand-accent-from)" />
            <circle cx={x(i)} cy={yWpm(p.netWpm)} r={2.5} fill="var(--accent)">
              <title>{`Test ${i + 1} · ${p.netWpm} WPM · ${p.accuracy}%`}</title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Delta({ value, unit, label }: { value: number; unit: string; label: string }) {
  const tone =
    value === 0 ? 'text-fg-muted' : value > 0 ? 'text-accent-text' : 'text-danger-text';
  const Icon = value === 0 ? Minus : value > 0 ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-1.5 text-sm font-semibold ${tone}`}>
      <Icon size={16} />
      <span>
        {value > 0 ? '+' : ''}
        {value}
        {unit}
        {label ? ` ${label}` : ''}
      </span>
    </span>
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
