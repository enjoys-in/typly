// Shared, framework-free types used across core, ports, and UI.

import type {
  Difficulty,
  ErrorCategory,
  ExamBoard,
  ExamMode,
  ExamSkin,
  Lang,
  ScoringMode,
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
  /** Which measure decides the pass: words per minute, or key depressions. */
  scoringMode: ScoringMode;
  /** Key depressions per hour required to pass; only read in Kdph mode. */
  minKdph: number;
}

/**
 * A Stenographer skill test: the passage is *dictated* at a fixed speed, then
 * transcribed against the clock. Nothing is on screen while it is read.
 */
export interface DictationSpec {
  /** Words per minute the passage is read at. */
  wpm: number;
  /** Minutes of dictation in the real skill test. */
  minutes: number;
  /** Minutes allowed to transcribe it afterwards. */
  transcriptionMinutes: number;
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
  /** Set on Stenographer posts, whose skill test is dictation + transcription. */
  dictation?: DictationSpec;
  /** Set on data-entry posts, where the work is tabular rather than prose. */
  dataEntry?: boolean;
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
  /**
   * Exam-day mode: the app's furniture goes away, notifications are held, and
   * the run cannot be paused — as close to a real test centre as a desktop
   * app gets.
   */
  examDay: boolean;
  /**
   * Paper mode: the passage is on paper in front of the typist, not on screen.
   * `passage` is empty, so nothing can be diffed — the run is scored on words,
   * spelling, grammar and corrections instead.
   */
  paper: boolean;
  /** Race a past run of the same passage, shown as a live progress ghost. */
  ghostTestId: number | null;
  /**
   * Pace against the exam's own cut-off rather than a past attempt: a marker
   * advancing at exactly `minWpm`, so falling behind it means failing.
   */
  pacer: boolean;
  /** How the exam screen is dressed — Typly's layout, or the exam client's. */
  skin: ExamSkin;
  /**
   * Exam-hall nerves, on purpose: a flashing clock near the end, hall noise and
   * a rank ticker. People lose real WPM to pressure and cannot otherwise
   * rehearse it.
   */
  pressure: boolean;
  /**
   * Stenographer mode: the passage is dictated before it is typed. Null for
   * every ordinary run.
   */
  dictation: DictationSpec | null;
  /** Set when this run is a curriculum lesson, so completion can be recorded. */
  lessonId?: string | null;
  /** Position in a split document, so finishing marks that part done. */
  partIndex?: number | null;
  /** How many parts the document was split into. */
  partCount?: number | null;
}

/**
 * Passage-specific fields for one item in a test series.
 *
 * The optional half is what makes a *multi-section paper* possible: CPCT and
 * several state exams test English and Hindi in one sitting, so a section has
 * to be able to override the language, the clock and even the profile that
 * grades it. Left undefined, each falls back to the series' shared base.
 */
export type SeriesItem = Pick<
  ExamConfig,
  'passage' | 'title' | 'documentId' | 'sourceType' | 'partIndex' | 'partCount'
> &
  Partial<Pick<ExamConfig, 'lang' | 'board' | 'durationSec' | 'dictation' | 'paper'>>;
/** Shared config applied to every item in a series. */
export type SeriesBase = Omit<
  ExamConfig,
  'passage' | 'title' | 'documentId' | 'sourceType' | 'partIndex' | 'partCount'
>;

export interface Series {
  items: SeriesItem[];
  index: number;
  base: SeriesBase;
}

/**
 * A long text cut into exam-sized passages. Only the chunk size and the part
 * texts travel with the draft — the split itself is reproducible from the
 * stored document, so nothing here has to be persisted.
 */
export interface DraftSplit {
  chunkChars: number;
  /** Part texts, in order, as produced by the passage splitter. */
  parts: string[];
  /** The part this run begins at — where the user left off. */
  startIndex: number;
}

/** A passage waiting for its exam settings to be chosen. */
export interface Draft {
  passage: string;
  title: string;
  documentId: number | null;
  sourceType: SourceType;
  /** Language the passage was saved in; Setup adopts it as the exam language. */
  lang: Lang;
  /** Set when the passage is one part of a split document. */
  split?: DraftSplit | null;
  /** Paper mode: there is no passage to carry. */
  paper?: boolean;
}

export interface FinishedExam {
  payload: SaveTestPayload;
  result: TestResult;
  mistakes: Mistake[];
  savedId: number | null;
  /** Paper mode only: what the typist wrote, and what was wrong with it. */
  paper?: PaperResult;
}

/** The paper-mode findings, for the result page. */
export interface PaperResult {
  typed: string;
  words: number;
  misspelled: string[];
  grammar: GrammarIssue[];
  spellChecked: boolean;
}

/** One section of a multi-section paper (CPCT and several state exams). */
export interface PaperSection {
  /** Section name shown in the briefing and the combined report. */
  title: string;
  passage: string;
  lang: Lang;
  durationSec: number;
  board: ExamBoard;
}

/** A checkpoint of an attempt in progress, so a reload can pick it back up. */
export interface ExamSnapshot {
  config: ExamConfig;
  typed: string;
  elapsedMs: number;
  keystrokes: Keystroke[];
  savedAt: string;
}

/**
 * Everything the app holds, in one portable file: what "Export" writes, what
 * "Restore" reads, and what travels between two of your own devices over the
 * local network. Table names are the store's own, so a bundle can be restored
 * into either the IndexedDB or the SQLite implementation.
 */
export interface BackupBundle {
  app: string;
  version: number;
  exportedAt: string;
  counts: { tests: number; documents: number };
  tables: Record<string, unknown[]>;
}
