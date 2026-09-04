import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { drillBase, useSettingsStore } from '@/store/settingsStore';
import { advanceAdaptive, startAdaptive, type AdaptiveRun } from '@/core/exam/adaptive';
import { pickForBand } from '@/core/exam/endlessPool';
import type { ScoringRules, TestResult } from '@/core/types';
import { PassageBand, SourceType, TimingMode } from '@/core/constants';

/**
 * Starting and continuing an endless run.
 *
 * The controller (`adaptive.ts`) is pure and the passage pool
 * (`endlessPool.ts`) is pure; this is the small amount of glue that reads the
 * library, builds the next config and moves the router — kept in one hook so
 * the Practice page and the result page drive the run identically.
 */
export function useEndlessRun(): {
  start: () => Promise<boolean>;
  /** Fold in a finished lap; returns the run, and whether it continues. */
  next: (
    run: AdaptiveRun,
    result: TestResult,
    elapsedMs: number,
    rules: ScoringRules,
  ) => Promise<{ run: AdaptiveRun; continued: boolean }>;
} {
  const platform = usePlatform();
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const startRun = useExamStore((s) => s.startAdaptive);
  const continueRun = useExamStore((s) => s.continueAdaptive);
  const endRun = useExamStore((s) => s.endAdaptive);
  const used = useExamStore((s) => s.adaptiveUsed);

  /** The config for one lap at `band`, or null when the library cannot fill it. */
  const configFor = useCallback(
    async (band: PassageBand, usedIds: number[]) => {
      const documents = await platform.repo.listDocuments();
      const pick = pickForBand(documents, band, usedIds);
      if (!pick) return null;
      return {
        config: {
          ...drillBase(settings),
          // An endless run is measured in minutes held at pace, so every lap
          // must be a fixed length regardless of the stopwatch preference.
          timing: TimingMode.Countdown,
          passage: pick.document.content,
          title: pick.document.title,
          documentId: pick.document.id,
          sourceType: SourceType.Text,
          lang: pick.document.lang,
          partIndex: null,
          partCount: null,
        },
        documentId: pick.document.id,
      };
    },
    [platform, settings],
  );

  const start = useCallback(async () => {
    const run = startAdaptive();
    const lap = await configFor(run.band, []);
    if (!lap) return false;
    startRun(run, lap.config, lap.documentId);
    navigate('/app/exam');
    return true;
  }, [configFor, startRun, navigate]);

  const next = useCallback(
    async (run: AdaptiveRun, result: TestResult, elapsedMs: number, rules: ScoringRules) => {
      const advanced = advanceAdaptive(run, result, elapsedMs, rules);
      if (advanced.finished) {
        endRun();
        return { run: advanced, continued: false };
      }
      const lap = await configFor(advanced.band, used);
      if (!lap) {
        // Nothing left to run: the library, not the typist, ended this.
        endRun();
        return { run: advanced, continued: false };
      }
      continueRun(advanced, lap.config, lap.documentId);
      navigate('/app/exam');
      return { run: advanced, continued: true };
    },
    [configFor, continueRun, endRun, navigate, used],
  );

  return { start, next };
}
