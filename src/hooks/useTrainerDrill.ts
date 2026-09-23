import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/platform/PlatformContext';
import type { Repository } from '@/platform/ports';
import { useExamStore } from '@/store/examStore';
import { drillBase, useSettingsStore } from '@/store/settingsStore';
import { DrillKind, KEYSTROKE_SCAN_TESTS, SourceType } from '@/core/constants';
import { weakKeys, weakWords } from '@/core/analysis/analysis';
import { slowDigraphs, slowKeys } from '@/core/analysis/speed';
import { generateSpeedDrill, generateWeaknessDrill } from '@/core/practice/generators';
import { drillSeed, dueItems } from '@/core/review/review';
import { readDeck } from '@/core/review/store';
import { REVIEW_BATCH } from './useReviewDeck';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n/en';

const TITLE: Record<DrillKind, TKey> = {
  [DrillKind.Review]: 'review.drillTitle',
  [DrillKind.Errors]: 'trainer.targetedTitle',
  [DrillKind.Speed]: 'trainer.rhythmTitle',
};

/** The weaknesses an error drill is built from, newest history included. */
async function weaknesses(repo: Repository): Promise<{ keys: string[]; words: string[] }> {
  const mistakes = await repo.aggregateMistakes();
  return {
    keys: weakKeys(mistakes).map((k) => k.key),
    words: weakWords(mistakes, 12).map((w) => w.expected),
  };
}

async function buildPassage(repo: Repository, kind: DrillKind): Promise<string> {
  if (kind === DrillKind.Speed) {
    const keystrokes = await repo.recentKeystrokes(KEYSTROKE_SCAN_TESTS);
    return generateSpeedDrill(
      slowDigraphs(keystrokes).map((d) => `${d.from}${d.to}`),
      slowKeys(keystrokes).map((k) => k.key),
    );
  }
  if (kind === DrillKind.Review) {
    const deck = await readDeck((key) => repo.getSetting(key));
    const seed = drillSeed(dueItems(deck, new Date(), REVIEW_BATCH));
    // An empty queue means everything scheduled is cleared for today, not that
    // there is nothing to work on — so the drill falls back to whatever is
    // currently worst rather than to a blank passage.
    if (seed.keys.length > 0 || seed.words.length > 0) {
      return generateWeaknessDrill(seed.keys, seed.words);
    }
  }
  const weak = await weaknesses(repo);
  return generateWeaknessDrill(weak.keys, weak.words);
}

/**
 * Start a trainer drill, from anywhere.
 *
 * The passage is built at the moment the drill starts rather than when the
 * screen that offered it was rendered, which is what lets a finished drill hand
 * back the next one: the run that just ended is already in the stored mistakes
 * and in the review deck, so the material moves on with the typist instead of
 * repeating the passage they have just cleared.
 */
export function useTrainerDrill(): {
  start: (kind: DrillKind) => Promise<void>;
  starting: boolean;
} {
  const platform = usePlatform();
  const navigate = useNavigate();
  const setConfig = useExamStore((s) => s.setConfig);
  const t = useT();
  const [starting, setStarting] = useState(false);

  const start = useCallback(
    async (kind: DrillKind) => {
      setStarting(true);
      try {
        const passage = await buildPassage(platform.repo, kind);
        setConfig({
          // Read at click time rather than subscribed to: nothing on the page
          // has to re-render because a setting three screens away changed.
          ...drillBase(useSettingsStore.getState()),
          passage,
          title: t(TITLE[kind]),
          documentId: null,
          sourceType: SourceType.Text,
          drill: kind,
        });
        navigate('/app/exam');
      } finally {
        setStarting(false);
      }
    },
    [platform, setConfig, navigate, t],
  );

  return { start, starting };
}
