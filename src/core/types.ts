// Shared, framework-free types used across core, ports, and UI.

import type {
  ErrorCategory,
  ExamBoard,
  Lang,
  SourceType,
  TestStatus,
  TimingMode,
  ErrorPenalty,
} from './constants';

export interface Keystroke {
  t: number; // ms since test start
  key: string; // character or 'Backspace'
  expected: string; // char the cursor was on
  correct: boolean;
  index: number; // position in passage
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
