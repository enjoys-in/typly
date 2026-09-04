import { Infinity as InfinityIcon, Flag } from 'lucide-react';
import type { AdaptiveRun } from '@/core/exam/adaptive';
import { Card } from '@/ui/Card';
import { Stat } from '@/ui/Stat';
import { Button } from '@/ui/Button';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n/en';

interface Props {
  run: AdaptiveRun;
  /** True while the run continues, so the card can say what happens next. */
  continuing: boolean;
  onStop: () => void;
}

/**
 * The endless run's own report.
 *
 * The output is deliberately one number — minutes held at exam pace — because
 * that is the honest answer to "can I sustain this", and every other mode
 * measures a fixed length instead. The lap list underneath is the evidence for
 * it, including where the difficulty climbed and where it eased off.
 */
export function EndlessReport({ run, continuing, onStop }: Props) {
  const t = useT();

  return (
    <Card className="space-y-4 border-accent-border bg-accent-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <InfinityIcon size={17} className="shrink-0 text-accent-soft-fg" />
            {t('endless.title')}
          </h2>
          <p className="mt-0.5 text-sm text-fg-muted">
            {t(continuing ? 'endless.continuing' : 'endless.finished', {
              minutes: run.minutesAtPace,
              laps: run.laps.length,
            })}
          </p>
        </div>
        {continuing && (
          <Button variant="secondary" size="sm" onClick={onStop}>
            <Flag size={14} /> {t('endless.stop')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label={t('endless.atPace')}
          value={`${run.minutesAtPace}m`}
          hint={t('endless.atPaceHint')}
          accent
        />
        <Stat label={t('endless.laps')} value={String(run.laps.length)} hint={t('endless.lapsHint')} />
        <Stat
          label={t('endless.peak')}
          value={t(`passageBand.${run.peakBand}` as TKey)}
          hint={t('endless.peakHint')}
        />
        <Stat
          label={t('endless.misses')}
          value={String(run.failStreak)}
          hint={t('endless.missesHint')}
        />
      </div>

      <ol className="space-y-1 border-t border-line pt-4 text-xs">
        {run.laps.map((lap) => (
          <li key={lap.lap} className="flex items-center gap-3 tabular-nums">
            <span className="w-6 shrink-0 text-right text-fg-subtle">{lap.lap}</span>
            <span className="w-24 shrink-0 truncate text-fg-muted">
              {t(`passageBand.${lap.band}` as TKey)}
            </span>
            <span className="w-16 shrink-0 font-semibold">{lap.netWpm}</span>
            <span className="w-14 shrink-0 text-fg-muted">{lap.accuracy}%</span>
            <span
              className={`shrink-0 font-semibold ${
                lap.held ? 'text-accent-text' : 'text-danger-text'
              }`}
            >
              {t(lap.held ? 'endless.held' : 'endless.missed')}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
