import { PassageBand } from '@/core/constants';
import type { PassageDifficulty, PassageFit } from '@/core/text/difficulty';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n/en';

/**
 * Bands are a scale, not a status, so they get their own fixed ramp rather than
 * the semantic accent/danger roles — "very hard" is not an error, and the five
 * steps have to stay distinguishable under every accent preset.
 */
const BAND_TONE: Record<PassageBand, string> = {
  [PassageBand.VeryEasy]: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
  [PassageBand.Easy]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  [PassageBand.Moderate]: 'bg-slate-100 text-slate-700 dark:bg-slate-600/40 dark:text-slate-200',
  [PassageBand.Hard]: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
  [PassageBand.VeryHard]: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
};

/** The band as a quiet chip. */
export function DifficultyBadge({ difficulty }: { difficulty: PassageDifficulty }) {
  const t = useT();
  return (
    <span
      title={t('difficultyRating.tooltip', {
        score: difficulty.score,
        wpm: difficulty.suitedForWpm,
      })}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${BAND_TONE[difficulty.band]}`}
    >
      {t(`passageBand.${difficulty.band}` as TKey)}
      <span className="opacity-70 tabular-nums">{difficulty.score}</span>
    </span>
  );
}

/**
 * Whether a passage suits the typist reading it.
 *
 * The rating alone is only half the feature: imported text is unranked, so
 * people practise on material that is wrong for them without knowing. Saying
 * *too easy* or *too hard for now* is the part that changes what they open.
 */
export function FitNote({ fit }: { fit: PassageFit }) {
  const t = useT();
  if (fit.fit === 'matched') {
    return (
      <p className="text-xs text-fg-muted">
        {t('difficultyRating.matched', { wpm: fit.difficulty.suitedForWpm })}
      </p>
    );
  }
  return (
    <p className={`text-xs ${fit.fit === 'tooHard' ? 'text-danger-text' : 'text-fg-muted'}`}>
      {t(fit.fit === 'tooHard' ? 'difficultyRating.tooHard' : 'difficultyRating.tooEasy', {
        wpm: fit.difficulty.suitedForWpm,
        current: fit.currentWpm,
        gap: Math.abs(fit.gap),
      })}
    </p>
  );
}
