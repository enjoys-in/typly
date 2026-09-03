import { Gauge, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { WpmAverages } from '@/core/stats';
import { Card } from '@/ui/Card';

interface Props {
  averages: WpmAverages;
}

/**
 * Every WPM average side by side. A single "best" number flatters; the lifetime
 * average next to current form is what actually says whether you are improving.
 */
export function WpmAveragesCard({ averages }: Props) {
  const { netAll, grossAll, recentNet, recentCount, trend, todayNet, bestNet } = averages;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Gauge size={16} className="text-fg-subtle" /> WPM averages
        </h2>
        <Trend value={trend} count={recentCount} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Value label="Average net" value={netAll} accent />
        <Value label={`Last ${recentCount}`} value={recentNet} />
        <Value label="Average gross" value={grossAll} />
        <Value label="Today" value={todayNet} />
      </div>

      <p className="border-t border-line pt-3 text-xs text-fg-muted">
        Net is after error penalties, gross is raw speed — the gap between them is what accuracy
        costs you. Personal best {bestNet} WPM.
      </p>
    </Card>
  );
}

function Value({
  label,
  value,
  accent = false,
}: {
  label: string;
  /** null renders as an em dash — no attempts to average yet. */
  value: number | null;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] font-medium tracking-wide text-fg-muted uppercase">
        {label}
      </p>
      <p className={`text-2xl font-bold tabular-nums ${accent ? 'text-accent-text' : 'text-fg'}`}>
        {value === null ? '—' : value}
      </p>
    </div>
  );
}

/** Current form against the lifetime average, as a direction rather than a number alone. */
function Trend({ value, count }: { value: number; count: number }) {
  if (count === 0) return null;
  const rising = value > 0.5;
  const falling = value < -0.5;
  const Icon = rising ? TrendingUp : falling ? TrendingDown : Minus;
  const tone = rising ? 'text-accent-text' : falling ? 'text-danger-text' : 'text-fg-muted';
  const sign = value > 0 ? '+' : '';

  return (
    <span className={`flex items-center gap-1.5 text-xs font-semibold tabular-nums ${tone}`}>
      <Icon size={14} />
      {sign}
      {value} vs. average
    </span>
  );
}
