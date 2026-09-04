import { useMemo } from 'react';
import { Delete } from 'lucide-react';
import type { Keystroke, ScoringRules } from '@/core/types';
import { backspaceCost } from '@/core/analysis/backspaceCost';
import { Card } from '@/ui/Card';
import { Stat } from '@/ui/Stat';
import { useT } from '@/i18n';

interface Props {
  keystrokes: Keystroke[];
  elapsedMs: number;
  rules: ScoringRules;
}

/** Corrections above this share of all keystrokes are worth calling a habit. */
const HABIT_SHARE = 5;

/**
 * What corrections cost, in seconds and in WPM.
 *
 * The counts were already stored and never priced. "63 backspaces" means
 * nothing to anybody; "corrections cost you 47 seconds — about 4 WPM" is the
 * single most fixable habit at 30–40 WPM, and it only becomes visible once
 * somebody does the arithmetic.
 */
export function BackspaceCostCard({ keystrokes, elapsedMs, rules }: Props) {
  const t = useT();
  const cost = useMemo(
    () => backspaceCost(keystrokes, elapsedMs, rules),
    [keystrokes, elapsedMs, rules],
  );

  if (cost.corrections === 0) {
    return (
      <Card className="space-y-1">
        <h2 className="flex items-center gap-2 font-semibold">
          <Delete size={16} className="shrink-0 text-accent-text" />
          {t('backspace.title')}
        </h2>
        <p className="text-sm text-fg-muted">{t('backspace.none')}</p>
      </Card>
    );
  }

  const habit = cost.share >= HABIT_SHARE;

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <Delete size={16} className="shrink-0 text-fg-subtle" />
          {t('backspace.title')}
        </h2>
        <p className="mt-0.5 text-sm text-fg-muted">
          {t('backspace.verdict', { seconds: cost.seconds, wpm: cost.wpmCost })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label={t('backspace.corrections')}
          value={String(cost.corrections)}
          hint={t('backspace.share', { share: cost.share })}
        />
        <Stat
          label={t('backspace.timeLost')}
          value={`${cost.seconds}s`}
          hint={t('backspace.each', { ms: cost.meanMs })}
        />
        <Stat
          label={t('backspace.wpmCost')}
          value={`${cost.wpmCost}`}
          hint={t('backspace.wpmHint')}
          accent
        />
        <Stat
          label={t('backspace.retyped')}
          value={String(cost.retyped)}
          hint={t('backspace.retypedHint')}
        />
      </div>

      <p className="text-xs text-fg-muted">
        {t(habit ? 'backspace.adviceHabit' : 'backspace.adviceFine')}
      </p>
    </Card>
  );
}
