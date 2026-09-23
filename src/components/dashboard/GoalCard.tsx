import { Clock, Flame, Target } from 'lucide-react';
import { formatDuration } from '@/core/analysis/practiceTime';
import { Card } from '@/ui/Card';
import { ProgressBar } from '@/ui/ProgressBar';
import { useT } from '@/i18n';

interface Props {
  today: number;
  goal: number;
  streak: number;
  /**
   * Seconds actually typed today. A count of tests answers how many times
   * someone sat down; this answers how long they stayed, which is the half a
   * three-test day of two-minute drills hides.
   */
  todaySeconds?: number;
}

/** Today against the daily goal, plus the streak it is protecting. */
export function GoalCard({ today, goal, streak, todaySeconds = 0 }: Props) {
  const t = useT();
  const pct = goal > 0 ? (today / goal) * 100 : 0;
  const left = Math.max(0, goal - today);

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-fg-muted uppercase">
            <Target size={13} /> {t('dashboard.today')}
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {today}
            <span className="text-base font-semibold text-fg-muted"> / {goal}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1.5 text-[11px] font-medium tracking-wide text-fg-muted uppercase">
            <Flame size={13} /> {t('dashboard.streak')}
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {streak}
            <span className="text-base font-semibold text-fg-muted">d</span>
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        <ProgressBar value={pct} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-fg-muted">
            {left === 0
              ? t('dashboard.goalReached')
              : t('dashboard.goalRemaining', { count: left })}
          </p>
          {todaySeconds > 0 && (
            <p className="flex items-center gap-1 text-xs tabular-nums text-fg-muted">
              <Clock size={12} className="shrink-0" />
              {t('practice.todayTime', { time: formatDuration(todaySeconds) })}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
