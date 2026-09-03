import { Check, Trophy, X } from 'lucide-react';
import type { ScoringRules, TestResult } from '@/core/types';
import { cutoffCheck, percentileOf } from '@/core/scoring/cutoff';
import { Card } from '@/ui/Card';

interface Props {
  result: TestResult;
  /** Rules the run was graded against (difficulty and mode already applied). */
  rules: ScoringRules;
  examName: string;
  /** Net WPM of every earlier attempt, for the rank line. */
  history: number[];
}

function signed(n: number): string {
  return n >= 0 ? `+${n}` : String(n);
}

/** Did this run clear the cut-off, and how does it rank against your own runs? */
export function CutoffCard({ result, rules, examName, history }: Props) {
  const check = cutoffCheck(result, rules);
  const rank = percentileOf(result.netWpm, history);

  if (!check.graded) {
    return (
      <Card className="space-y-2">
        <h2 className="font-semibold">Cut-off</h2>
        <p className="text-sm text-fg-muted">
          {examName} sets no pass mark, so this run is not graded. Pick an exam profile in Setup to
          score against a real cut-off.
        </p>
        {rank !== null && <RankLine rank={rank} count={history.length} />}
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <h2 className="font-semibold">Cut-off — {examName}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Row
          label="Speed"
          met={check.wpmMet}
          actual={`${result.netWpm} net WPM`}
          required={`needs ${check.requiredWpm}`}
          gap={`${signed(check.wpmGap)} WPM`}
        />
        <Row
          label="Accuracy"
          met={check.accuracyMet}
          actual={`${result.accuracy}%`}
          required={`needs ${check.requiredAccuracy}%`}
          gap={`${signed(check.accuracyGap)} pts`}
        />
      </div>
      {rank !== null && <RankLine rank={rank} count={history.length} />}
    </Card>
  );
}

function Row({
  label,
  met,
  actual,
  required,
  gap,
}: {
  label: string;
  met: boolean;
  actual: string;
  required: string;
  gap: string;
}) {
  return (
    <div
      className={`space-y-1 rounded-panel border p-4 ${
        met ? 'border-accent-border bg-accent-soft' : 'border-danger-border bg-danger-soft'
      }`}
    >
      <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
        {met ? <Check size={14} /> : <X size={14} />} {label}
      </p>
      <p className="text-xl font-bold tabular-nums">{actual}</p>
      <p className="text-xs opacity-80">
        {required} · {gap}
      </p>
    </div>
  );
}

function RankLine({ rank, count }: { rank: number; count: number }) {
  return (
    <p className="flex items-center gap-2 border-t border-line pt-4 text-sm text-fg-muted">
      <Trophy size={14} className="shrink-0 text-fg-subtle" />
      Faster than <strong className="font-semibold text-fg">{rank}%</strong> of your{' '}
      {count} earlier {count === 1 ? 'attempt' : 'attempts'}.
    </p>
  );
}
