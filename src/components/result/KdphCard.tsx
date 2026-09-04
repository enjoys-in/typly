import { Gauge, Keyboard, Target } from 'lucide-react';
import type { ScoringRules, TestResult } from '@/core/types';
import { depressionsOf, kdph, kdphToWpm } from '@/core/scoring/kdph';
import { Card } from '@/ui/Card';
import { Stat } from '@/ui/Stat';
import { useT } from '@/i18n';

interface Props {
  result: TestResult;
  durationSec: number;
  rules: ScoringRules;
}

/**
 * The score in the unit the notification actually uses.
 *
 * DEST and Data Entry Operator posts state their requirement as key
 * depressions per hour — 8,000 or 15,000 — and nothing else in the app speaks
 * that language. A candidate who only ever sees WPM cannot tell whether they
 * are near the bar, so this shows both and the conversion between them.
 */
export function KdphCard({ result, durationSec, rules }: Props) {
  const t = useT();
  const depressions = depressionsOf(result);
  const achieved = kdph(depressions, durationSec * 1000);
  const gap = achieved - rules.minKdph;
  const met = gap >= 0;

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <Keyboard size={16} className="shrink-0 text-fg-subtle" />
          {t('kdph.title')}
        </h2>
        <p className="mt-0.5 text-sm text-fg-muted">
          {t(met ? 'kdph.verdictMet' : 'kdph.verdictShort', {
            value: Math.abs(gap).toLocaleString(),
            target: rules.minKdph.toLocaleString(),
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label={t('kdph.achieved')}
          value={achieved.toLocaleString()}
          hint={t('kdph.perHour')}
          accent={met}
        />
        <Stat
          label={t('kdph.required')}
          value={rules.minKdph.toLocaleString()}
          hint={t('kdph.perHour')}
        />
        <Stat
          label={t('kdph.depressions')}
          value={depressions.toLocaleString()}
          hint={t('kdph.depressionsHint')}
        />
        <Stat
          label={t('kdph.asWpm')}
          value={String(kdphToWpm(achieved))}
          hint={t('kdph.asWpmHint', { value: kdphToWpm(rules.minKdph) })}
        />
      </div>

      <div className="flex flex-wrap gap-4 border-t border-line pt-4 text-xs text-fg-muted">
        <span className="flex items-center gap-1.5">
          <Gauge size={13} className="shrink-0" /> {t('kdph.explainCounted')}
        </span>
        <span className="flex items-center gap-1.5">
          <Target size={13} className="shrink-0" />
          {t('kdph.explainAccuracy', { accuracy: rules.minAccuracy })}
        </span>
      </div>
    </Card>
  );
}
