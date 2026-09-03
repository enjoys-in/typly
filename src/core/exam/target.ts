import { differenceInCalendarDays, isValid, parseISO } from 'date-fns';
import type { ExamBoard, Lang } from '../constants';
import { isExamBoard, isLang } from '../constants';

/**
 * The exam someone is actually preparing for.
 *
 * Everything else in the app is about the last attempt; this is the one piece
 * of state that points forward, and it is what turns a pile of results into
 * "am I going to pass in time". Stored as one settings row so it travels with
 * a backup like every other preference.
 */
export interface ExamTarget {
  board: ExamBoard;
  /** Exam day, as YYYY-MM-DD in the user's own calendar. */
  date: string;
  /**
   * The language the paper will be typed in.
   *
   * It belongs to the target rather than to the exam profile, because the same
   * post is sat in English in one state and in Hindi in another — and typing
   * speed in Devanagari is a different skill with different numbers. Without
   * this, a forecast would happily average the two.
   */
  lang: Lang;
}

/** How far ahead a date may be set — a decade is generous; a typo is not. */
export const MAX_TARGET_YEARS = 5;

export function isTargetDate(date: unknown): date is string {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = parseISO(date);
  if (!isValid(parsed)) return false;
  const years = differenceInCalendarDays(parsed, new Date()) / 365;
  return years <= MAX_TARGET_YEARS;
}

export function parseTarget(raw: string | null): ExamTarget | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const { board, date, lang } = value as Partial<ExamTarget>;
    // A board removed in a later version, or a hand-edited row, is simply not a
    // target — better no countdown than a countdown to nothing.
    return isExamBoard(board) && isTargetDate(date) && isLang(lang)
      ? { board, date, lang }
      : null;
  } catch {
    return null;
  }
}

export function serializeTarget(target: ExamTarget): string {
  return JSON.stringify(target);
}

/**
 * Whole days from today to exam day, by the calendar rather than by the clock:
 * an exam tomorrow morning is "1 day", not "0.6 of a day".
 */
export function daysUntil(date: string, now = new Date()): number {
  return differenceInCalendarDays(parseISO(date), now);
}
