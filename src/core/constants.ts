// Central enums + tunables. No magic strings/numbers anywhere else in the app.

export enum Lang {
  En = 'eng',
  Hi = 'hin',
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

export enum ExamBoard {
  SscChsl = 'ssc_chsl',
  SscCgl = 'ssc_cgl',
  SscSteno = 'ssc_steno',
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
}

export enum ExamMode {
  Standard = 'standard',
  Blind = 'blind',
  ErrorFree = 'error_free',
  Accuracy = 'accuracy',
  Speed = 'speed',
}

export enum InputMethod {
  Qwerty = 'qwerty',
  Phonetic = 'phonetic',
  InScript = 'inscript',
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
// Passage/input text scale bounds for the in-exam zoom control.
export const EXAM_ZOOM_MIN = 0.75;
export const EXAM_ZOOM_MAX = 2;
export const EXAM_ZOOM_DEFAULT = 1;

export const WARNING_SECONDS = 60; // T-1 min warning
export const IDLE_SECONDS = 20; // no-typing gap that triggers an idle notification
export const SERIES_ADVANCE_SECONDS = 4; // countdown before auto-starting the next test in a series
export const DEFAULT_DURATIONS_MIN = [5, 10, 15, 30] as const;
export const GUEST_MAX_DURATION_MIN = 30; // guest cap
export const MAX_DURATION_MIN = 180; // absolute cap for signed-in users

export const LANG_LABEL: Record<Lang, string> = {
  [Lang.En]: 'English',
  [Lang.Hi]: 'Hindi',
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  [Difficulty.Easy]: 'Easy',
  [Difficulty.Normal]: 'Normal',
  [Difficulty.Hard]: 'Hard',
};

export const PRACTICE_LABEL: Record<PracticeKind, string> = {
  [PracticeKind.Words]: 'Common words',
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
};

export const EXAM_MODE_LABEL: Record<ExamMode, string> = {
  [ExamMode.Standard]: 'Standard',
  [ExamMode.Blind]: 'Blind',
  [ExamMode.ErrorFree]: 'Error-free',
  [ExamMode.Accuracy]: 'Accuracy',
  [ExamMode.Speed]: 'Speed',
};

export const INPUT_METHOD_LABEL: Record<InputMethod, string> = {
  [InputMethod.Qwerty]: 'Standard (QWERTY)',
  [InputMethod.Phonetic]: 'Hindi phonetic',
  [InputMethod.InScript]: 'Hindi InScript',
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
