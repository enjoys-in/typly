import type { DictationSpec, ExamProfile } from '../types';
import {
  CHARS_PER_WORD,
  ErrorPenalty,
  ExamBoard,
  KDPH_DEO_GRADE_A,
  KDPH_DEST,
  Lang,
  ScoringMode,
  TimingMode,
} from '../constants';

const baseRules = {
  charsPerWord: CHARS_PER_WORD,
  errorPenalty: ErrorPenalty.PerWord,
  penaltyValue: 1,
  backspaceAllowed: true,
  pasteAllowed: false,
  scoringMode: ScoringMode.Wpm,
  // Only read in Kdph mode; kept on every profile so the shape is uniform.
  minKdph: 0,
};

/** A data-entry post: graded on depressions per hour, not on words. */
const kdphRules = (minKdph: number) => ({
  ...baseRules,
  scoringMode: ScoringMode.Kdph,
  minKdph,
  // Corrections are depressions too, so there is nothing to gain from
  // penalising them a second time — accuracy is the other half of the bar.
  errorPenalty: ErrorPenalty.None,
  penaltyValue: 0,
  minWpm: 0,
});

const SSC = 'SSC · ssc.gov.in';

/** A Stenographer skill test, spelled out so the numbers read as the rules. */
function steno(wpm: number, minutes: number, transcriptionMinutes: number): DictationSpec {
  return { wpm, minutes, transcriptionMinutes };
}

export const EXAM_PROFILES: Record<ExamBoard, ExamProfile> = {
  [ExamBoard.SscChsl]: {
    board: ExamBoard.SscChsl,
    name: 'SSC CHSL — DEST (LDC/DEO)',
    category: 'SSC',
    source: SSC,
    lang: Lang.En,
    durationSec: 10 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 35, minAccuracy: 90 },
  },
  [ExamBoard.SscCgl]: {
    board: ExamBoard.SscCgl,
    name: 'SSC CGL — DEST (Tax Assistant)',
    category: 'SSC',
    source: SSC,
    lang: Lang.En,
    durationSec: 15 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 30, minAccuracy: 90 },
  },
  // The Stenographer skill test is not a typing test: the passage is dictated
  // at a fixed speed and then transcribed against the clock. `durationSec` is
  // the transcription window, which is what the app actually times.
  [ExamBoard.SscSteno]: {
    board: ExamBoard.SscSteno,
    name: "SSC Stenographer Grade 'D' — Dictation & Transcription",
    category: 'Stenography',
    source: SSC,
    lang: Lang.En,
    durationSec: 50 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 40, minAccuracy: 92 },
    dictation: steno(80, 10, 50),
  },
  [ExamBoard.SscStenoC]: {
    board: ExamBoard.SscStenoC,
    name: "SSC Stenographer Grade 'C' — Dictation & Transcription",
    category: 'Stenography',
    source: SSC,
    lang: Lang.En,
    durationSec: 40 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 45, minAccuracy: 95 },
    dictation: steno(100, 10, 40),
  },
  [ExamBoard.SscDeoDest]: {
    board: ExamBoard.SscDeoDest,
    name: 'SSC DEST — Data Entry (8,000 key depressions/hour)',
    category: 'Data entry',
    source: SSC,
    lang: Lang.En,
    durationSec: 15 * 60,
    timing: TimingMode.Countdown,
    rules: { ...kdphRules(KDPH_DEST), minAccuracy: 90 },
    dataEntry: true,
  },
  [ExamBoard.DeoGradeA]: {
    board: ExamBoard.DeoGradeA,
    name: "Data Entry Operator Grade 'A' — 15,000 key depressions/hour",
    category: 'Data entry',
    source: SSC,
    lang: Lang.En,
    durationSec: 15 * 60,
    timing: TimingMode.Countdown,
    rules: { ...kdphRules(KDPH_DEO_GRADE_A), minAccuracy: 90 },
    dataEntry: true,
  },
  [ExamBoard.SscMts]: {
    board: ExamBoard.SscMts,
    name: 'SSC MTS — Typing Practice',
    category: 'SSC',
    source: SSC,
    lang: Lang.En,
    durationSec: 10 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 30, minAccuracy: 90 },
  },
  [ExamBoard.RrbNtpc]: {
    board: ExamBoard.RrbNtpc,
    name: 'RRB NTPC — Typing Skill Test',
    category: 'Railway',
    source: 'Railway Recruitment Board · rrbcdg.gov.in',
    lang: Lang.En,
    durationSec: 10 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 30, minAccuracy: 90 },
  },
  [ExamBoard.BankClerk]: {
    board: ExamBoard.BankClerk,
    name: 'Bank Clerk (IBPS / SBI)',
    category: 'Banking',
    source: 'IBPS · ibps.in  /  SBI · sbi.co.in',
    lang: Lang.En,
    durationSec: 10 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 30, minAccuracy: 90 },
  },
  [ExamBoard.Cpct]: {
    board: ExamBoard.Cpct,
    name: 'CPCT (Madhya Pradesh)',
    category: 'State / Other',
    source: 'CPCT, MP · cpct.mp.gov.in',
    lang: Lang.En,
    durationSec: 15 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 30, minAccuracy: 90 },
  },
  [ExamBoard.SupremeCourt]: {
    board: ExamBoard.SupremeCourt,
    name: 'Supreme Court — Junior Court Assistant',
    category: 'Court',
    source: 'Supreme Court of India · sci.gov.in',
    lang: Lang.En,
    durationSec: 10 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 35, minAccuracy: 92 },
  },
  [ExamBoard.HighCourt]: {
    board: ExamBoard.HighCourt,
    name: 'High Court — LDC / Clerk / Typist',
    category: 'Court',
    source: 'Respective State High Court',
    lang: Lang.En,
    durationSec: 10 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 35, minAccuracy: 92 },
  },
  [ExamBoard.DistrictCourt]: {
    board: ExamBoard.DistrictCourt,
    name: 'District Court — Junior Clerk / Typist',
    category: 'Court',
    source: 'District & Sessions Court (State)',
    lang: Lang.En,
    durationSec: 10 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 30, minAccuracy: 90 },
  },
  [ExamBoard.LdcUdc]: {
    board: ExamBoard.LdcUdc,
    name: 'LDC / UDC (Central & State)',
    category: 'State / Other',
    source: 'Respective recruiting board',
    lang: Lang.En,
    durationSec: 10 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 35, minAccuracy: 90 },
  },
  [ExamBoard.Upsssc]: {
    board: ExamBoard.Upsssc,
    name: 'UPSSSC — Typing Test',
    category: 'State / Other',
    source: 'UPSSSC · upsssc.gov.in',
    lang: Lang.En,
    durationSec: 10 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 30, minAccuracy: 90 },
  },
  [ExamBoard.Custom]: {
    board: ExamBoard.Custom,
    name: 'Custom',
    category: 'Custom',
    source: 'Your own paragraph & rules',
    lang: Lang.En,
    durationSec: 10 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, errorPenalty: ErrorPenalty.None, minWpm: 0, minAccuracy: 0 },
  },
};

export function profileFor(board: ExamBoard): ExamProfile {
  // Fall back to Custom for unknown/retired board keys from older saved tests.
  return EXAM_PROFILES[board] ?? EXAM_PROFILES[ExamBoard.Custom];
}

/**
 * The exam's name with its paper dropped — "SSC CHSL — DEST (LDC/DEO)" becomes
 * "SSC CHSL". Full names are right on a setup screen and far too long for a
 * notification title or a countdown headline.
 */
export function shortNameFor(board: ExamBoard): string {
  const [head] = profileFor(board).name.split('—');
  return (head ?? '').trim() || profileFor(board).name;
}

// Boards grouped by category (insertion order preserved) for grouped <select> menus.
export function boardsByCategory(): { category: string; boards: ExamBoard[] }[] {
  const groups: { category: string; boards: ExamBoard[] }[] = [];
  for (const profile of Object.values(EXAM_PROFILES)) {
    let group = groups.find((g) => g.category === profile.category);
    if (!group) {
      group = { category: profile.category, boards: [] };
      groups.push(group);
    }
    group.boards.push(profile.board);
  }
  return groups;
}

/** Every board, in profile order — what a whole-history re-scoring iterates. */
export const ALL_BOARDS: readonly ExamBoard[] = Object.keys(EXAM_PROFILES) as ExamBoard[];

/**
 * Boards with a real pass mark. Custom has none, so it can never be "cleared"
 * and has no place in an eligibility report.
 */
export function gradedBoards(): ExamBoard[] {
  return ALL_BOARDS.filter((board) => {
    const { rules } = profileFor(board);
    return rules.minWpm > 0 || rules.minKdph > 0;
  });
}

/** The dictation spec of a Stenographer post, or null for a typing post. */
export function dictationFor(board: ExamBoard): DictationSpec | null {
  return profileFor(board).dictation ?? null;
}

/** True where the work is tabular data entry rather than prose. */
export function isDataEntry(board: ExamBoard): boolean {
  return profileFor(board).dataEntry === true;
}

/** True where the pass mark is key depressions per hour. */
export function isKdph(board: ExamBoard): boolean {
  return profileFor(board).rules.scoringMode === ScoringMode.Kdph;
}
