import { Flame, Target } from 'lucide-react';
import { Card } from '@/ui/Card';
import { ProgressBar } from '@/ui/ProgressBar';

interface Props {
  today: number;
  goal: number;
  streak: number;
}

/** Today against the daily goal, plus the streak it is protecting. */
export function GoalCard({ today, goal, streak }: Props) {
  const pct = goal > 0 ? (today / goal) * 100 : 0;
  const left = Math.max(0, goal - today);

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-fg-muted uppercase">
            <Target size={13} /> Today
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {today}
            <span className="text-base font-semibold text-fg-muted"> / {goal}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1.5 text-[11px] font-medium tracking-wide text-fg-muted uppercase">
            <Flame size={13} /> Streak
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {streak}
            <span className="text-base font-semibold text-fg-muted">d</span>
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        <ProgressBar value={pct} />
        <p className="text-xs text-fg-muted">
          {left === 0
            ? 'Daily goal reached — the streak is safe.'
            : `${left} more ${left === 1 ? 'test' : 'tests'} to hit today's goal.`}
        </p>
      </div>
    </Card>
  );
}
