/**
 * Multi-section mock papers.
 *
 * CPCT and several state exams test English *and* Hindi in one sitting, and a
 * candidate's real problem is the switch: the second section starts with the
 * wrong input method still in muscle memory. Practising the two halves on
 * separate days never rehearses that.
 *
 * The series machinery already chains attempts (that is how a split document
 * runs); what it lacked was per-section settings and one combined report at the
 * end. Both are here — a paper is a series whose items each carry their own
 * language, clock and profile.
 */

import type { ExamProfile, PaperSection, SeriesItem, TestRow } from '../types';
import { ExamBoard, Lang, SourceType, TestStatus } from '../constants';
import { profileFor } from '../scoring/examProfiles';

export interface PaperTemplate {
  id: string;
  /** Paper name, e.g. "CPCT — English + Hindi". */
  name: string;
  /** The exam this paper imitates, for the report heading. */
  board: ExamBoard;
  /** Each section's rules; passages are supplied when the paper is started. */
  sections: PaperSectionSpec[];
}

/** A section before a passage has been chosen for it. */
export interface PaperSectionSpec {
  title: string;
  lang: Lang;
  board: ExamBoard;
  durationSec: number;
}

/**
 * The papers worth shipping: the ones where the *combination* is the exam.
 * A single-language paper is just a test, so none are listed.
 */
export const PAPER_TEMPLATES: PaperTemplate[] = [
  {
    id: 'cpct-en-hi',
    name: 'CPCT — English then Hindi',
    board: ExamBoard.Cpct,
    sections: [
      { title: 'English typing', lang: Lang.En, board: ExamBoard.Cpct, durationSec: 15 * 60 },
      { title: 'Hindi typing', lang: Lang.Hi, board: ExamBoard.Cpct, durationSec: 15 * 60 },
    ],
  },
  {
    id: 'upsssc-en-hi',
    name: 'UPSSSC — Hindi then English',
    board: ExamBoard.Upsssc,
    sections: [
      { title: 'Hindi typing', lang: Lang.Hi, board: ExamBoard.Upsssc, durationSec: 10 * 60 },
      { title: 'English typing', lang: Lang.En, board: ExamBoard.Upsssc, durationSec: 10 * 60 },
    ],
  },
  {
    id: 'court-en-hi',
    name: 'High Court — English then Hindi',
    board: ExamBoard.HighCourt,
    sections: [
      { title: 'English typing', lang: Lang.En, board: ExamBoard.HighCourt, durationSec: 10 * 60 },
      { title: 'Hindi typing', lang: Lang.Hi, board: ExamBoard.HighCourt, durationSec: 10 * 60 },
    ],
  },
];

/**
 * A paper as series items. Each section carries its own language, clock and
 * profile, so the run switches between them without the user touching setup —
 * which is the point.
 */
export function paperSeries(sections: PaperSection[]): SeriesItem[] {
  return sections.map((section, index) => ({
    passage: section.passage,
    title: `${index + 1}. ${section.title}`,
    documentId: null,
    sourceType: SourceType.Text,
    partIndex: index,
    partCount: sections.length,
    lang: section.lang,
    board: section.board,
    durationSec: section.durationSec,
  }));
}

/** One finished section, as the combined report reads it. */
export interface SectionResult {
  title: string
  lang: Lang;
  profile: ExamProfile;
  netWpm: number;
  accuracy: number;
  passed: boolean;
}

export interface PaperReportSummary {
  sections: SectionResult[];
  /** Mean net WPM across every section. */
  averageNet: number;
  /** Mean accuracy across every section. */
  averageAccuracy: number;
  /** A paper is cleared only when every section is — that is how they mark it. */
  cleared: boolean;
  /** The section that let the paper down, if one did. */
  weakest: SectionResult | null;
}

/**
 * Fold the attempts a paper produced into one verdict.
 *
 * Sections are matched to attempts by order, which is safe because a series
 * runs them in order and cannot skip one — and it means the report needs
 * nothing stored beyond the ordinary test rows.
 */
export function summarisePaper(
  sections: PaperSection[],
  rows: TestRow[],
): PaperReportSummary {
  const results: SectionResult[] = sections.map((section, index) => {
    const row = rows[index];
    const profile = profileFor(section.board);
    return {
      title: section.title,
      lang: section.lang,
      profile,
      netWpm: row?.netWpm ?? 0,
      accuracy: row?.accuracy ?? 0,
      passed: row?.status === TestStatus.Passed,
    };
  });

  const done = results.filter((_, i) => rows[i] !== undefined);
  return {
    sections: results,
    averageNet: mean(done.map((r) => r.netWpm)),
    averageAccuracy: mean(done.map((r) => r.accuracy)),
    cleared: done.length === sections.length && done.every((r) => r.passed),
    weakest: [...done].sort((a, b) => a.netWpm - b.netWpm)[0] ?? null,
  };
}

function mean(values: number[]): number {
  return values.length
    ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
    : 0;
}
