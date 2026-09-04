import { create } from 'zustand';
import type {
  Draft,
  ExamConfig,
  ExamSnapshot,
  FinishedExam,
  Series,
  SeriesBase,
  SeriesItem,
} from '@/core/types';
import type { AdaptiveRun } from '@/core/exam/adaptive';

export type { Draft, ExamConfig, FinishedExam, Series, SeriesBase, SeriesItem };

/**
 * One series item resolved against its base.
 *
 * A section may override the language, clock or profile (a multi-section paper
 * does exactly that), but an *absent* override must not blank out the base — a
 * plain object spread would, because `{ lang: undefined }` still overwrites.
 */
function configFrom(base: SeriesBase, item: SeriesItem): ExamConfig {
  const overrides = Object.fromEntries(
    Object.entries(item).filter(([, value]) => value !== undefined),
  ) as Partial<ExamConfig>;
  return { ...base, ...overrides } as ExamConfig;
}

interface ExamState {
  draft: Draft | null;
  config: ExamConfig | null;
  finished: FinishedExam | null;
  series: Series | null;
  /** Text and elapsed time an interrupted run resumes from, consumed once. */
  resume: ExamSnapshot | null;
  /**
   * An endless run in progress: passages keep coming, difficulty follows how
   * the last one went, and the run ends when the cut-off has been missed for a
   * sustained stretch. Null for every ordinary attempt.
   */
  adaptive: AdaptiveRun | null;
  /** Documents already used in this endless run, so passages do not repeat. */
  adaptiveUsed: number[];
  startAdaptive: (run: AdaptiveRun, config: ExamConfig, documentId: number | null) => void;
  /** Fold a finished lap in, and queue the next passage if the run continues. */
  continueAdaptive: (run: AdaptiveRun, config: ExamConfig, documentId: number | null) => void;
  endAdaptive: () => void;
  setDraft: (draft: Draft) => void;
  setConfig: (config: ExamConfig) => void;
  setFinished: (finished: FinishedExam) => void;
  startSeries: (items: SeriesItem[], base: SeriesBase) => void;
  advanceSeries: () => boolean;
  clearSeries: () => void;
  resumeFrom: (snapshot: ExamSnapshot) => void;
  clearResume: () => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  draft: null,
  config: null,
  finished: null,
  series: null,
  resume: null,
  adaptive: null,
  adaptiveUsed: [],
  setDraft: (draft) => set({ draft }),
  // A single test cancels any running series or endless run, and starts from a
  // clean slate.
  setConfig: (config) =>
    set({ config, finished: null, series: null, resume: null, adaptive: null, adaptiveUsed: [] }),
  setFinished: (finished) => set({ finished }),
  startSeries: (items, base) => {
    const first = items[0];
    if (!first) return;
    set({
      series: { items, index: 0, base },
      config: configFrom(base, first),
      finished: null,
      resume: null,
    });
  },
  advanceSeries: () => {
    const s = get().series;
    if (!s) return false;
    const next = s.index + 1;
    const item = s.items[next];
    if (!item) {
      set({ series: null });
      return false;
    }
    set({
      series: { ...s, index: next },
      config: configFrom(s.base, item),
      finished: null,
      resume: null,
    });
    return true;
  },
  clearSeries: () => set({ series: null }),
  startAdaptive: (adaptive, config, documentId) =>
    set({
      adaptive,
      adaptiveUsed: documentId == null ? [] : [documentId],
      config,
      finished: null,
      series: null,
      resume: null,
    }),
  continueAdaptive: (adaptive, config, documentId) =>
    set((state) => ({
      adaptive,
      adaptiveUsed:
        documentId == null ? state.adaptiveUsed : [...state.adaptiveUsed, documentId],
      config,
      finished: null,
      resume: null,
    })),
  endAdaptive: () => set({ adaptive: null, adaptiveUsed: [] }),
  // Restoring a checkpoint installs its config and hands the run its progress.
  resumeFrom: (snapshot) =>
    set({ config: snapshot.config, resume: snapshot, finished: null, series: null }),
  clearResume: () => set({ resume: null }),
  reset: () =>
    set({
      draft: null,
      config: null,
      finished: null,
      series: null,
      resume: null,
      adaptive: null,
      adaptiveUsed: [],
    }),
}));
