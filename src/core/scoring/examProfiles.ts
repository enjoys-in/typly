import type { ExamProfile } from '../types';
import {
  CHARS_PER_WORD,
  ErrorPenalty,
  ExamBoard,
  Lang,
  TimingMode,
} from '../constants';

const baseRules = {
  charsPerWord: CHARS_PER_WORD,
  errorPenalty: ErrorPenalty.PerWord,
  penaltyValue: 1,
  backspaceAllowed: true,
  pasteAllowed: false,
};

const SSC = 'SSC · ssc.gov.in';

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
  [ExamBoard.SscSteno]: {
    board: ExamBoard.SscSteno,
    name: 'SSC Stenographer — Skill Test',
    category: 'SSC',
    source: SSC,
    lang: Lang.En,
    durationSec: 10 * 60,
    timing: TimingMode.Countdown,
    rules: { ...baseRules, minWpm: 40, minAccuracy: 92 },
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
