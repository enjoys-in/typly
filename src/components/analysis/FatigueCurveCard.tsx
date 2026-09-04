import { Battery, BatteryLow } from 'lucide-react';
import type { FatigueCurve } from '@/core/analysis/longitudinal';
import { Card } from '@/ui/Card';
import { Stat } from '@/ui/Stat';
import { useT } from '@/i18n';

interface Props {
  curve: FatigueCurve;
}

/** A fade worse than this many WPM is the thing that fails a long test. */
const SERIOUS_DROP = 3;

/**
 * First-minute against last-minute speed, averaged across runs.
 *
 * Most aspirants do not fail a ten-minute DEST on peak speed. They fail it
 * because minute ten is six words a minute slower than minute one, and no
 * single-run chart shows that — the per-minute data was already stored, it had
 * simply never been read across attempts.
 */
export function FatigueCurveCard({ curve }: Props) {
  const t = useT();

  if (curve.runs === 0) {
    return (
      <Card className="space-y-1">
        <h2 className="font-semibold">{t('fatigue.title')}</h2>
        <p className="text-sm text-fg-muted">{t('fatigue.empty')}</p>
      </Card>
    );
  }

  const fading = curve.drop <= -SERIOUS_DROP;
  const peak = Math.max(...curve.points.map((p) => p.wpm), 1);

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          {fading ? (
            <BatteryLow size={16} className="shrink-0 text-danger-text" />
          ) : (
            <Battery size={16} className="shrink-0 text-accent-text" />
          )}
          {t('fatigue.title')}
        </h2>
        <p className="mt-0.5 text-sm text-fg-muted">
          {t(fading ? 'fatigue.verdictFading' : 'fatigue.verdictSteady', {
            drop: Math.abs(curve.drop),
            pct: Math.abs(curve.dropPct),
            runs: curve.runs,
          })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label={t('fatigue.firstMinute')} value={String(curve.firstMinute)} hint="WPM" />
        <Stat
          label={t('fatigue.lastMinute')}
          value={String(curve.lastMinute)}
          hint="WPM"
          accent={!fading}
        />
        <Stat
          label={t('fatigue.change')}
          value={`${curve.drop > 0 ? '+' : ''}${curve.drop}`}
          hint={`${curve.dropPct > 0 ? '+' : ''}${curve.dropPct}%`}
        />
      </div>

      {/* One bar per minute of a run: the shape is the message, so the bars are
          labelled by minute rather than dressed up as a line chart. */}
      <div className="space-y-1.5 border-t border-line pt-4">
        {curve.points.map((point) => (
          <div key={point.minute} className="flex items-center gap-3 text-[11px]">
            <span className="w-14 shrink-0 text-right tabular-nums text-fg-muted">
              {t('fatigue.minute', { minute: point.minute + 1 })}
            </span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-3">
              <span
                className="block h-full rounded-full bg-accent"
                style={{ width: `${(point.wpm / peak) * 100}%` }}
              />
            </span>
            <span className="w-20 shrink-0 tabular-nums text-fg-subtle">
              {point.wpm} · {t('fatigue.samples', { count: point.samples })}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-fg-muted">{t('fatigue.advice')}</p>
    </Card>
  );
}
