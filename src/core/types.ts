// Shared, framework-free types used across core, ports, and UI.

import type {
  Difficulty,
  ErrorCategory,
  ExamBoard,
  ExamMode,
  Lang,
  SourceType,
  TestStatus,
  TimingMode,
  ErrorPenalty,
} from './constants';

export interface Keystroke {
  t: number; // ms since test start
  key: string; // character(s) produced, or 'Backspace'
  expected: string; // char the cursor was on
  correct: boolean;
  index: number; // position in passage
  /** Characters this key replaced behind the cursor (typewriter layouts only). */
  replaced?: number;
}

export interface LiveCounters {
  correctChars: number;
  incorrectChars: number;
  backspaces: number;
  index: number;
  elapsedMs: number;
}

export interface Mistake {
  category: ErrorCategory;
  expected: string;
  typed: string;
  index: number;
}

export interface ScoringRules {
  charsPerWord: number;
  errorPenalty: ErrorPenalty;
  penaltyValue: number;
  backspaceAllowed: boolean;
  pasteAllowed: boolean;
  minWpm: number;
  minAccuracy: number;
}

export interface ExamProfile {
  board: ExamBoard;
  name: string;
  category: string;
  source: string;
  lang: Lang;
  durationSec: number;
  timing: TimingMode;
  rules: ScoringRules;
}

export interface TimelinePoint {
  bucket: number; // minute index
  wpm: number;
  accuracy: number;
}

export interface TestResult {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  charsTyped: number;
  correctChars: number;
  incorrectChars: number;
  correctWords: number;
  wrongWords: number;
  backspaces: number;
  deletes: number;
  errors: number;
  status: TestStatus;
}

export interface SaveTestPayload {
  createdAt: string;
  documentId: number | null;
  lang: Lang;
  sourceType: SourceType;
  examBoard: ExamBoard;
  durationSec: number;
  passageLen: number;
  result: TestResult;
  mistakes: Mistake[];
  timeline: TimelinePoint[];
  /** Full keystroke log — powers replay, the ghost race and timing analysis. */
  keystrokes: Keystroke[];
}

export interface TestRow {
  id: number;
  createdAt: string;
  documentId: number | null;
  lang: Lang;
  examBoard: ExamBoard;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  errors: number;
  durationSec: number;
  status: TestStatus;
}

export interface DocumentInput {
  title: string;
  lang: Lang;
  sourceType: SourceType;
  content: string;
}

export interface DocumentRow extends DocumentInput {
  id: number;
  charCount: number;
  createdAt: string;
}

export interface GrammarIssue {
  offset: number;
  length: number;
  message: string;
  replacements: string[];
}

// ---------------------------------------------------------------------------
// Exam session
// ---------------------------------------------------------------------------

/** Everything a single run needs, fixed at the moment the exam starts. */
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
  /** Mock exam: seconds to read the passage before the clock starts. 0 = straight in. */
  readingSec: number;
  /** Mock exam: show the rules briefing and require an explicit start. */
  briefing: boolean;
  /** Race a past run of the same passage, shown as a live progress ghost. */
  ghostTestId: number | null;
  /** Set when this run is a curriculum lesson, so completion can be recorded. */
  lessonId?: string | null;
}

/** Passage-specific fields for one item in a test series. */
export type SeriesItem = Pick<ExamConfig, 'passage' | 'title' | 'documentId' | 'sourceType'>;
/** Shared config applied to every item in a series. */
export type SeriesBase = Omit<ExamConfig, 'passage' | 'title' | 'documentId' | 'sourceType'>;

export interface Series {
  items: SeriesItem[];
  index: number;
  base: SeriesBase;
}

/** A passage waiting for its exam settings to be chosen. */
export interface Draft {
  passage: string;
  title: string;
  documentId: number | null;
  sourceType: SourceType;
  /** Language the passage was saved in; Setup adopts it as the exam language. */
  lang: Lang;
}

export interface FinishedExam {
  payload: SaveTestPayload;
  result: TestResult;
  mistakes: Mistake[];
  savedId: number | null;
}

/** A checkpoint of an attempt in progress, so a reload can pick it back up. */
export interface ExamSnapshot {
  config: ExamConfig;
  typed: string;
  elapsedMs: number;
  keystrokes: Keystroke[];
  savedAt: string;
}
