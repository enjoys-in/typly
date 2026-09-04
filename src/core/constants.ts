// Central enums + tunables. No magic strings/numbers anywhere else in the app.

// Values are Tesseract language codes, so OCR can pass them straight through.
export enum Lang {
  En = 'eng',
  Hi = 'hin',
  Mr = 'mar',
  Bn = 'ben',
  Ta = 'tam',
  Gu = 'guj',
}

/** Guards a language read back from storage. */
export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (Object.values(Lang) as string[]).includes(value);
}

// Writing system a language uses. Input methods, legacy fonts and punctuation
// cleanup are script-level concerns, not language-level ones.
export enum Script {
  Latin = 'latin',
  Devanagari = 'devanagari',
  Bengali = 'bengali',
  Tamil = 'tamil',
  Gujarati = 'gujarati',
}

export enum SourceType {
  Image = 'image',
  Pdf = 'pdf',
  Docx = 'docx',
  Text = 'text',
}

export enum ErrorCategory {
  MissingChar = 'missing_char',
  ExtraChar = 'extra_char',
  WrongChar = 'wrong_char',
  WrongWord = 'wrong_word',
  MissingWord = 'missing_word',
  ExtraWord = 'extra_word',
  Capitalization = 'capitalization',
  Punctuation = 'punctuation',
}

/**
 * How a run is graded. Typing tests are scored in words per minute; data-entry
 * recruitment (DEST, DEO) is officially scored in *key depressions per hour*,
 * which counts every keystroke — corrections included — rather than words.
 */
export enum ScoringMode {
  Wpm = 'wpm',
  Kdph = 'kdph',
}

/**
 * *How* a mistake was made, as opposed to what was wrong with it
 * (`ErrorCategory`). Each kind implies a different fix — a transposition is a
 * rhythm problem, a shift error is a finger-coordination one — so the coach can
 * be specific instead of saying "practice more".
 */
export enum MistakeKind {
  /** Two adjacent characters swapped: "teh" for "the". */
  Transposition = 'transposition',
  /** A character typed twice: "thhe". */
  Doubling = 'doubling',
  /** A character left out: "th". */
  Omission = 'omission',
  /** A character replaced by another: "tge". */
  Substitution = 'substitution',
  /** Right letter, wrong case — Shift held, missed, or stuck. */
  Shift = 'shift',
  /** A space or line break in the wrong place, or missing. */
  Spacing = 'spacing',
  /** Anything the rules above cannot explain. */
  Other = 'other',
}

/** Every kind, in the order the report lists them. */
export const MISTAKE_KINDS: readonly MistakeKind[] = [
  MistakeKind.Transposition,
  MistakeKind.Doubling,
  MistakeKind.Omission,
  MistakeKind.Substitution,
  MistakeKind.Shift,
  MistakeKind.Spacing,
  MistakeKind.Other,
];

/**
 * How hard a passage is to type, as a band over the computed score. Bands
 * rather than a bare number, because "hard for you" is the useful reading.
 */
export enum PassageBand {
  VeryEasy = 'veryEasy',
  Easy = 'easy',
  Moderate = 'moderate',
  Hard = 'hard',
  VeryHard = 'veryHard',
}

export const PASSAGE_BANDS: readonly PassageBand[] = [
  PassageBand.VeryEasy,
  PassageBand.Easy,
  PassageBand.Moderate,
  PassageBand.Hard,
  PassageBand.VeryHard,
];

export enum ExamBoard {
  SscChsl = 'ssc_chsl',
  SscCgl = 'ssc_cgl',
  SscSteno = 'ssc_steno',
  SscStenoC = 'ssc_steno_c',
  SscDeoDest = 'ssc_deo_dest',
  DeoGradeA = 'deo_grade_a',
  SscMts = 'ssc_mts',
  RrbNtpc = 'rrb_ntpc',
  BankClerk = 'bank_clerk',
  Cpct = 'cpct',
  SupremeCourt = 'supreme_court',
  HighCourt = 'high_court',
  DistrictCourt = 'district_court',
  LdcUdc = 'ldc_udc',
  Upsssc = 'upsssc',
  Custom = 'custom',
}

/** Guards a board read back from storage, which may predate a rename. */
export function isExamBoard(value: unknown): value is ExamBoard {
  return typeof value === 'string' && (Object.values(ExamBoard) as string[]).includes(value);
}

export enum TestStatus {
  Passed = 'passed',
  Failed = 'failed',
}

export enum TimingMode {
  Countdown = 'countdown',
  Stopwatch = 'stopwatch',
}

export enum Difficulty {
  Easy = 'easy',
  Normal = 'normal',
  Hard = 'hard',
}

export enum PracticeKind {
  Words = 'words',
  Bigrams = 'bigrams',
  Alternating = 'alternating',
  SameFinger = 'same_finger',
  LongWords = 'long_words',
  Mixed = 'mixed',
  Capitals = 'capitals',
  Numbers = 'numbers',
  Symbols = 'symbols',
  Punctuation = 'punctuation',
  HomeRow = 'home_row',
  TopRow = 'top_row',
  BottomRow = 'bottom_row',
  AllRows = 'all_rows',
  Numpad = 'numpad',
  Shortcuts = 'shortcuts',
  Sentences = 'sentences',
  DataEntry = 'data_entry',
}

export enum ExamMode {
  Standard = 'standard',
  Blind = 'blind',
  ErrorFree = 'error_free',
  Accuracy = 'accuracy',
  Speed = 'speed',
  /** Nothing advances until the current word is right — the fix-later cure. */
  Strict = 'strict',
}

/**
 * How the exam screen is dressed. `Modern` is Typly's own layout; `ExamClient`
 * imitates the government test software — candidate header, passage above a
 * plain input, the countdown where it really sits — so the mock feels like the
 * exam rather than like a nice app.
 */
export enum ExamSkin {
  Modern = 'modern',
  ExamClient = 'exam_client',
}

export enum InputMethod {
  Qwerty = 'qwerty',
  Phonetic = 'phonetic',
  InScript = 'inscript',
  Remington = 'remington',
}

export enum HindiFont {
  System = 'system',
  Mangal = 'mangal',
  KrutiDev = 'krutidev',
  Custom = 'custom',
}

export enum ErrorPenalty {
  None = 'none',
  PerError = 'per_error',
  PerWord = 'per_word',
}

// Grammar engine choice — Mode 1 runs on-device, Mode 2 uses the AI provider.
export enum GrammarMode {
  Off = 'off',
  Offline = 'offline',
  Ai = 'ai',
}

// Which spell checker flags misspelled words in the passage (separate from typing accuracy).
export enum SpellEngine {
  Off = 'off',
  Builtin = 'builtin',
  SymSpell = 'symspell',
}

// Tunables — imported everywhere, never re-typed inline.
export const CHARS_PER_WORD = 5;

// --- Key depressions per hour (DEST / DEO) --------------------------------
// The official measure for data-entry recruitment: every key depression counts,
// corrections included, over an hour. 8,000 KDPH is the DEST bar; 15,000 is
// Data Entry Operator Grade 'A'.
export const KDPH_DEST = 8_000;
export const KDPH_DEO_GRADE_A = 15_000;
/** Minutes in an hour — the unit conversion KDPH is defined in. */
export const MINUTES_PER_HOUR = 60;

// --- Dictation (Stenographer skill test) ----------------------------------
/**
 * Words per minute a browser speech voice reads at when its rate is left at 1.
 * Measured across the common system voices; the dictation clock corrects for
 * any drift by pacing the gaps between chunks, so this only has to be close.
 */
export const TTS_BASE_WPM = 150;
/** Rate bounds the Web Speech API accepts, narrowed to what stays intelligible. */
export const TTS_RATE_MIN = 0.4;
export const TTS_RATE_MAX = 2.5;
/** Words per chunk the dictation reads before pausing to re-sync its pace. */
export const DICTATION_CHUNK_WORDS = 12;

// --- Breaks (RSI) ----------------------------------------------------------
/** 20-20-20: every 20 minutes, look 20 feet away for 20 seconds. */
export const BREAK_EYE_MINUTES = 20;
export const BREAK_EYE_REST_SEC = 20;
/** Wrist and posture prompt, offset from the eye break so they don't collide. */
export const BREAK_POSTURE_MINUTES = 30;

// --- Adaptive / endless runs ----------------------------------------------
/** Consecutive passages below the cut-off that end an endless run. */
export const ENDLESS_FAIL_STREAK = 3;
/** Difficulty step an endless run takes when the target is held (or missed). */
export const ENDLESS_STEP = 1;

// --- Challenge files -------------------------------------------------------
export const CHALLENGE_EXT = '.typly';
export const CHALLENGE_VERSION = 1;
// Passage/input text scale bounds for the in-exam zoom control.
export const EXAM_ZOOM_MIN = 0.75;
export const EXAM_ZOOM_MAX = 2;
export const EXAM_ZOOM_DEFAULT = 1;

// Mock exam: cap on the reading window offered before the clock starts. The
// default is 0 — a plain test must never gain a wait the user did not ask for.
export const MAX_READING_SEC = 600;
// How often an in-progress attempt is checkpointed so a reload can resume it.
export const SNAPSHOT_SAVE_MS = 5_000;
// Recent tests scanned when aggregating keystroke timing (whole-history would
// mean parsing every stored run).
export const KEYSTROKE_SCAN_TESTS = 20;

// The tray/hotkey drill: short enough that starting one is never a decision.
export const QUICK_DRILL_SECONDS = 60;
export const WARNING_SECONDS = 60; // T-1 min warning
export const IDLE_SECONDS = 20; // no-typing gap that triggers an idle notification
export const SERIES_ADVANCE_SECONDS = 4; // countdown before auto-starting the next test in a series
export const DEFAULT_DURATIONS_MIN = [5, 10, 15, 30] as const;
export const GUEST_MAX_DURATION_MIN = 30; // guest cap
export const MAX_DURATION_MIN = 180; // absolute cap for signed-in users

// Keys used with Repository.getSetting / setSetting — never a bare string.
export const SETTING_KEY = {
  CompletedLessons: 'completedLessons',
  CustomLessons: 'customLessons',
  NotifiedBadges: 'notifiedBadges',
  ExamSnapshot: 'exam:snapshot',
  /** Where you left off in every split document, as one JSON map. */
  LibraryProgress: 'library:progress',
  SampleSeeded: 'sample:seeded',
  SampleDocId: 'sample:documentId',
  ReminderFired: 'reminderLastFired',
  ReminderNudged: 'reminderNudgedFor',
  /** Day the user chose to skip the reminder for, from the tray. */
  ReminderDismissed: 'reminderDismissedFor',
  TourDone: 'tour:done',
  /** Newest release whose changes have been shown, or 'off' to stop asking. */
  ChangelogSeen: 'changelog:seen',
  /** The exam being prepared for: board and date, as JSON. */
  ExamTarget: 'exam:target',
  /** Institute name, logo and signatory for batch certificates, as JSON. */
  InstituteBrand: 'institute:brand',
  /** Bundled passage packs already imported into the library. */
  PacksSeeded: 'packs:seeded',
  /** Newest month whose recap has been shown, as `YYYY-MM`. */
  RecapSeen: 'recap:seen',
  /** Last keyboard health check, as JSON. */
  KeyboardHealth: 'keyboard:health',
} as const;

export const LANG_LABEL: Record<Lang, string> = {
  [Lang.En]: 'English',
  [Lang.Hi]: 'Hindi',
  [Lang.Mr]: 'Marathi',
  [Lang.Bn]: 'Bengali',
  [Lang.Ta]: 'Tamil',
  [Lang.Gu]: 'Gujarati',
};

export const LANG_SCRIPT: Record<Lang, Script> = {
  [Lang.En]: Script.Latin,
  [Lang.Hi]: Script.Devanagari,
  [Lang.Mr]: Script.Devanagari,
  [Lang.Bn]: Script.Bengali,
  [Lang.Ta]: Script.Tamil,
  [Lang.Gu]: Script.Gujarati,
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  [Difficulty.Easy]: 'Easy',
  [Difficulty.Normal]: 'Normal',
  [Difficulty.Hard]: 'Hard',
};

/**
 * How demanding a drill is. Shown as a quiet chip on the card rather than used
 * to group them — the list stays one flat set the user can pick from.
 */
export enum DrillDifficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  VeryHard = 'veryHard',
}

/** Ordering weight, easiest first. */
export const DRILL_DIFFICULTY_ORDER: Record<DrillDifficulty, number> = {
  [DrillDifficulty.Easy]: 0,
  [DrillDifficulty.Medium]: 1,
  [DrillDifficulty.Hard]: 2,
  [DrillDifficulty.VeryHard]: 3,
};

export const PRACTICE_DIFFICULTY: Record<PracticeKind, DrillDifficulty> = {
  [PracticeKind.HomeRow]: DrillDifficulty.Easy,
  [PracticeKind.Words]: DrillDifficulty.Easy,
  [PracticeKind.TopRow]: DrillDifficulty.Medium,
  [PracticeKind.BottomRow]: DrillDifficulty.Medium,
  [PracticeKind.Capitals]: DrillDifficulty.Medium,
  [PracticeKind.Punctuation]: DrillDifficulty.Medium,
  [PracticeKind.Numbers]: DrillDifficulty.Medium,
  [PracticeKind.Sentences]: DrillDifficulty.Medium,
  [PracticeKind.DataEntry]: DrillDifficulty.Hard,
  [PracticeKind.AllRows]: DrillDifficulty.Hard,
  [PracticeKind.Bigrams]: DrillDifficulty.Hard,
  [PracticeKind.Alternating]: DrillDifficulty.Hard,
  [PracticeKind.Numpad]: DrillDifficulty.Hard,
  [PracticeKind.Symbols]: DrillDifficulty.Hard,
  [PracticeKind.LongWords]: DrillDifficulty.Hard,
  [PracticeKind.SameFinger]: DrillDifficulty.VeryHard,
  [PracticeKind.Shortcuts]: DrillDifficulty.VeryHard,
  [PracticeKind.Mixed]: DrillDifficulty.VeryHard,
};

export const PRACTICE_LABEL: Record<PracticeKind, string> = {
  [PracticeKind.Words]: 'Common words',
  [PracticeKind.Bigrams]: 'Tricky letter pairs',
  [PracticeKind.Alternating]: 'Alternating hands',
  [PracticeKind.SameFinger]: 'Same-finger jumps',
  [PracticeKind.LongWords]: 'Long words',
  [PracticeKind.Mixed]: 'Everything at once',
  [PracticeKind.Capitals]: 'Capital letters',
  [PracticeKind.Numbers]: 'Numbers',
  [PracticeKind.TopRow]: 'Top row',
  [PracticeKind.BottomRow]: 'Bottom row',
  [PracticeKind.AllRows]: 'All rows',
  [PracticeKind.Symbols]: 'Special characters',
  [PracticeKind.Punctuation]: 'Punctuation',
  [PracticeKind.HomeRow]: 'Home row',
  [PracticeKind.Numpad]: 'Numpad',
  [PracticeKind.Shortcuts]: 'Keyboard shortcuts',
  [PracticeKind.Sentences]: 'Sentences',
  [PracticeKind.DataEntry]: 'Data entry (tables)',
};

export const EXAM_MODE_LABEL: Record<ExamMode, string> = {
  [ExamMode.Standard]: 'Standard',
  [ExamMode.Blind]: 'Blind',
  [ExamMode.ErrorFree]: 'Error-free',
  [ExamMode.Accuracy]: 'Accuracy',
  [ExamMode.Speed]: 'Speed',
  [ExamMode.Strict]: 'Strict',
};

export const EXAM_SKIN_LABEL: Record<ExamSkin, string> = {
  [ExamSkin.Modern]: 'Typly',
  [ExamSkin.ExamClient]: 'Exam software',
};

export const SCORING_MODE_LABEL: Record<ScoringMode, string> = {
  [ScoringMode.Wpm]: 'Words per minute',
  [ScoringMode.Kdph]: 'Key depressions per hour',
};

export const INPUT_METHOD_LABEL: Record<InputMethod, string> = {
  [InputMethod.Qwerty]: 'Standard (QWERTY)',
  [InputMethod.Phonetic]: 'Phonetic (type in Roman)',
  [InputMethod.InScript]: 'InScript (BIS / Unicode)',
  [InputMethod.Remington]: 'Remington GAIL (typewriter)',
};

export const HINDI_FONT_LABEL: Record<HindiFont, string> = {
  [HindiFont.System]: 'System default',
  [HindiFont.Mangal]: 'Mangal (Unicode)',
  [HindiFont.KrutiDev]: 'Kruti Dev (legacy)',
  [HindiFont.Custom]: 'Custom (uploaded)',
};

export const CATEGORY_LABEL: Record<ErrorCategory, string> = {
  [ErrorCategory.MissingChar]: 'Missing character',
  [ErrorCategory.ExtraChar]: 'Extra character',
  [ErrorCategory.WrongChar]: 'Wrong character',
  [ErrorCategory.WrongWord]: 'Wrong word',
  [ErrorCategory.MissingWord]: 'Missing word',
  [ErrorCategory.ExtraWord]: 'Extra word',
  [ErrorCategory.Capitalization]: 'Capitalization',
  [ErrorCategory.Punctuation]: 'Punctuation',
};

export const GRAMMAR_MODE_LABEL: Record<GrammarMode, string> = {
  [GrammarMode.Off]: 'Off',
  [GrammarMode.Offline]: 'Mode 1 · On-device (offline)',
  [GrammarMode.Ai]: 'Mode 2 · AI-powered (cloud)',
};

export const SPELL_ENGINE_LABEL: Record<SpellEngine, string> = {
  [SpellEngine.Off]: 'Off',
  [SpellEngine.Builtin]: 'Built-in (nspell) · recommended',
  [SpellEngine.SymSpell]: 'Fuzzy match (low-memory)',
};
