import { Info } from 'lucide-react';
import type { ScoringRules } from '@/core/types';
import { ErrorPenalty, ExamMode } from '@/core/constants';
import { applyMode } from '@/core/scoring/scoring';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n/en';

const BLURB: Record<ExamMode, TKey> = {
  [ExamMode.Standard]: 'modeInfo.standard',
  [ExamMode.Blind]: 'modeInfo.blind',
  [ExamMode.ErrorFree]: 'modeInfo.error_free',
  [ExamMode.Accuracy]: 'modeInfo.accuracy',
  [ExamMode.Speed]: 'modeInfo.speed',
  [ExamMode.Strict]: 'modeInfo.strict',
};

interface Props {
  mode: ExamMode;
  /** The board's rules with the chosen difficulty already applied. */
  rules: ScoringRules;
  /** Data-entry boards pass on depressions per hour, not words per minute. */
  kdph: boolean;
}

/**
 * What the selected mode actually does.
 *
 * The thresholds are not written into the copy — they are computed by running
 * the same `applyMode` the graded run uses and diffing it against the rules
 * going in. So the figures shown here cannot drift from the figures you are
 * marked against: change the scoring and this panel changes with it, or it
 * stops compiling.
 */
export function ModeInfo({ mode, rules, kdph }: Props) {
  const t = useT();
  const after = applyMode(rules, mode);

  const rows: { label: string; from: string; to: string }[] = [];
  const add = (label: TKey, from: number, to: number, fmt = (n: number) => String(n)) => {
    if (from !== to) rows.push({ label: t(label), from: fmt(from), to: fmt(to) });
  };

  if (kdph) {
    add('modeInfo.kdphToPass', rules.minKdph, after.minKdph, (n) => n.toLocaleString());
  } else {
    add('modeInfo.wpmToPass', rules.minWpm, after.minWpm);
  }
  add('modeInfo.accuracyToPass', rules.minAccuracy, after.minAccuracy, (n) => `${n}%`);
  // A penalty figure is meaningless on a board that does not deduct for errors.
  if (rules.errorPenalty !== ErrorPenalty.None) {
    add('modeInfo.penalty', rules.penaltyValue, after.penaltyValue, (n) =>
      String(Math.round(n * 100) / 100),
    );
  }

  return (
    <div className="mt-2.5 rounded-panel border border-line bg-surface-2 p-3.5">
      <p className="flex gap-2.5 text-[13px] leading-relaxed text-fg-muted">
        <Info size={15} className="mt-px shrink-0 text-accent-text" />
        <span>{t(BLURB[mode])}</span>
      </p>

      {rows.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-subtle uppercase">
            {t('modeInfo.changes')}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {rows.map((row) => (
              <li
                key={row.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold ring-1 ring-line ring-inset"
              >
                <span className="text-fg-muted">{row.label}</span>
                {/* The old figure stays visible and struck through: "95%" alone
                    does not tell you the mode moved it, which is the one thing
                    this row exists to say. */}
                <span className="text-fg-subtle line-through tabular-nums">{row.from}</span>
                <span aria-hidden className="text-fg-subtle">
                  →
                </span>
                <span className="text-accent-text tabular-nums">{row.to}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
