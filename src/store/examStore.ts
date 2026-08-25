import { create } from 'zustand';
import type { Mistake, SaveTestPayload, TestResult } from '@/core/types';
import { Difficulty, ExamBoard, ExamMode, Lang, SourceType, TimingMode } from '@/core/constants';

export interface ExamConfig {
  passage: string;
  title: string;
  documentId: number | null;
  lang: Lang;
  board: ExamBoard;
  timing: TimingMode;
  durationSec: number;
  sourceType: SourceType;
  difficulty: Difficulty;
  examMode: ExamMode;
  backspaceEnabled: boolean;
  spaceEnabled: boolean;
  enterEnabled: boolean;
  examLock: boolean;
  /** Set when this run is a curriculum lesson, so completion can be recorded. */
  lessonId?: string | null;
}

// Passage-specific fields for one item in a test series.
export type SeriesItem = Pick<ExamConfig, 'passage' | 'title' | 'documentId' | 'sourceType'>;
// Shared config applied to every item in a series.
export type SeriesBase = Omit<ExamConfig, 'passage' | 'title' | 'documentId' | 'sourceType'>;

export interface Series {
  items: SeriesItem[];
  index: number;
  base: SeriesBase;
}

export interface FinishedExam {
  payload: SaveTestPayload;
  result: TestResult;
  mistakes: Mistake[];
  savedId: number | null;
}

export interface Draft {
  passage: string;
  title: string;
  documentId: number | null;
  sourceType: SourceType;
}

interface ExamState {
  draft: Draft | null;
  config: ExamConfig | null;
  finished: FinishedExam | null;
  series: Series | null;
  setDraft: (draft: Draft) => void;
  setConfig: (config: ExamConfig) => void;
  setFinished: (finished: FinishedExam) => void;
  startSeries: (items: SeriesItem[], base: SeriesBase) => void;
  advanceSeries: () => boolean;
  clearSeries: () => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  draft: null,
  config: null,
  finished: null,
  series: null,
  setDraft: (draft) => set({ draft }),
  // A single test cancels any running series.
  setConfig: (config) => set({ config, finished: null, series: null }),
  setFinished: (finished) => set({ finished }),
  startSeries: (items, base) => {
    const first = items[0];
    if (!first) return;
    set({ series: { items, index: 0, base }, config: { ...base, ...first }, finished: null });
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
    });
    return true;
  },
  clearSeries: () => set({ series: null }),
  reset: () => set({ draft: null, config: null, finished: null, series: null }),
}));
