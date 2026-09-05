import { useMemo } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import type { Repository } from '@/platform/ports';
import type { Mistake } from '@/core/types';
import { SETTING_KEY } from '@/core/constants';
import { weakKeys, weakWords } from '@/core/analysis/analysis';
import {
  deckStats,
  dueItems,
  gradeRun,
  syncFromWeaknesses,
  type ReviewDeck,
  type ReviewItem,
} from '@/core/review/review';
import { readDeck, writeDeck } from '@/core/review/store';
import { useAsync } from './useAsync';

/** How many weaknesses are enrolled at a time. */
const ENROL_KEYS = 12;
const ENROL_WORDS = 12;
/** Cards offered in one sitting. A queue nobody can finish is a queue nobody starts. */
export const REVIEW_BATCH = 10;

/**
 * Grade a finished run against the deck, once.
 *
 * Called with the test's own id and guarded by the last id graded, because the
 * results screen it runs from can be re-opened, re-rendered, or reached twice
 * by a back button — and each of those would otherwise promote the whole deck
 * again for one run's work.
 *
 * Newly-enrolled cards are folded in *before* grading, so the very first run
 * after a weakness appears can already begin clearing it.
 */
export async function gradeRunAgainstDeck(
  repo: Repository,
  testId: number,
  run: { passage: string; mistakes: Mistake[] },
  now = new Date(),
): Promise<void> {
  const last = Number((await repo.getSetting(SETTING_KEY.ReviewGraded)) ?? 0);
  if (Number.isFinite(last) && last >= testId) return;

  const stored = await readDeck((key) => repo.getSetting(key));
  const all = await repo.aggregateMistakes();
  const enrolled = syncFromWeaknesses(
    stored,
    {
      keys: weakKeys(all, ENROL_KEYS).map((k) => k.key),
      words: weakWords(all, ENROL_WORDS).map((w) => w.expected),
    },
    now,
  );
  // Whatever this pass enrolled is exempt from it: those cards exist because of
  // these mistakes, and marking them wrong for the run that revealed them
  // counts the same evidence twice.
  const fresh = new Set(Object.keys(enrolled).filter((id) => !stored[id]));
  await writeDeck(
    (key, value) => repo.setSetting(key, value),
    gradeRun(enrolled, run, now, fresh),
  );
  await repo.setSetting(SETTING_KEY.ReviewGraded, String(testId));
}

export interface ReviewState {
  deck: ReviewDeck;
  due: ReviewItem[];
  stats: ReturnType<typeof deckStats>;
  loading: boolean;
  reload: () => void;
}

/**
 * The deck, enrolled and read.
 *
 * Enrolment happens on read rather than on write because the weakness lists are
 * derived: whatever the user has typed since the last visit is already in the
 * stored mistakes, and this is the first moment anything asks about it.
 */
export function useReviewDeck(): ReviewState {
  const platform = usePlatform();
  const state = useAsync(async () => {
    const stored = await readDeck((key) => platform.repo.getSetting(key));
    const all = await platform.repo.aggregateMistakes();
    const next = syncFromWeaknesses(
      stored,
      {
        keys: weakKeys(all, ENROL_KEYS).map((k) => k.key),
        words: weakWords(all, ENROL_WORDS).map((w) => w.expected),
      },
      new Date(),
    );
    // Only pay for a write when enrolment actually added something.
    if (Object.keys(next).length !== Object.keys(stored).length) {
      await writeDeck((key, value) => platform.repo.setSetting(key, value), next);
    }
    return next;
  }, [platform]);

  const deck = state.data ?? {};
  // A single `now` for the whole derivation, so the count and the list cannot
  // disagree about what is due.
  const { due, stats } = useMemo(() => {
    const now = new Date();
    return { due: dueItems(deck, now, REVIEW_BATCH), stats: deckStats(deck, now) };
  }, [deck]);

  return { deck, due, stats, loading: state.loading, reload: state.reload };
}
