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

export type { Draft, ExamConfig, FinishedExam, Series, SeriesBase, SeriesItem };

interface ExamState {
  draft: Draft | null;
  config: ExamConfig | null;
  finished: FinishedExam | null;
  series: Series | null;
  /** Text and elapsed time an interrupted run resumes from, consumed once. */
  resume: ExamSnapshot | null;
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
  setDraft: (draft) => set({ draft }),
  // A single test cancels any running series, and starts from a clean slate.
  setConfig: (config) => set({ config, finished: null, series: null, resume: null }),
  setFinished: (finished) => set({ finished }),
  startSeries: (items, base) => {
    const first = items[0];
    if (!first) return;
    set({
      series: { items, index: 0, base },
      config: { ...base, ...first },
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
      config: { ...s.base, ...item },
      finished: null,
      resume: null,
    });
    return true;
  },
  clearSeries: () => set({ series: null }),
  // Restoring a checkpoint installs its config and hands the run its progress.
  resumeFrom: (snapshot) =>
    set({ config: snapshot.config, resume: snapshot, finished: null, series: null }),
  clearResume: () => set({ resume: null }),
  reset: () => set({ draft: null, config: null, finished: null, series: null, resume: null }),
}));
