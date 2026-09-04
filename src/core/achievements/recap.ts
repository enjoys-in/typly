/**
 * "Your September" — a monthly summary.
 *
 * Ten badges topping out at a seven-day streak runs out inside a fortnight, and
 * after that the reward ladder has no rungs left. A monthly recap has as many
 * rungs as there are months: hours practised, WPM gained, keys fixed, best day.
 * It also pairs naturally with the shareable card — a month is a thing people
 * will post, where a single test is not.
 */

import { format, isSameMonth, parseISO, startOfMonth, subMonths } from 'date-fns';
import type { Mistake, TestRow } from '../types';
import { TestStatus } from '../constants';
import { realAttempts } from '../stats';
import { weakKeys } from '../analysis/analysis';

export interface RecapDay {
  /** `yyyy-MM-dd`. */
  day: string;
  tests: number;
  bestNet: number;
  minutes: number;
}

export interface MonthlyRecap {
  /** `yyyy-MM`, the month this recap is for. */
  month: string;
  /** Month and year as a heading, e.g. "September 2026". */
  label: string;
  tests: number;
  /** Whole minutes spent typing. */
  minutes: number;
  /** Hours, one decimal — the friendlier reading of the same number. */
  hours: number;
  /** Days with at least one real attempt. */
  activeDays: number;
  /** Longest run of consecutive active days inside the month. */
  bestStreak: number;
  bestNet: number;
  /** Mean net WPM across the month. */
  averageNet: number;
  /** Change in mean net WPM against the month before. Null with no comparison. */
  gained: number | null;
  passed: number;
  /** The single best day, or null for an empty month. */
  bestDay: RecapDay | null;
  /** Keys that were weak last month and are no longer in this month's worst. */
  keysFixed: string[];
  /** True when there is genuinely nothing to celebrate. */
  empty: boolean;
}

/** How many of the worst keys count as "the keys you were working on". */
const WATCHED_KEYS = 8;

/**
 * The recap for whichever month `on` falls in.
 *
 * Mistakes are optional: they only feed the "keys fixed" line, and the store's
 * aggregate does not carry a date, so a caller that cannot split them by month
 * simply gets a recap without that line rather than a wrong one.
 */
export function monthlyRecap(
  rows: TestRow[],
  on = new Date(),
  mistakes?: { thisMonth: Mistake[]; lastMonth: Mistake[] },
): MonthlyRecap {
  const real = realAttempts(rows);
  const month = startOfMonth(on);
  const previous = subMonths(month, 1);

  const inMonth = real.filter((r) => isSameMonth(parseISO(r.createdAt), month));
  const inPrevious = real.filter((r) => isSameMonth(parseISO(r.createdAt), previous));

  const days = groupByDay(inMonth);
  const bestDay = [...days.values()].sort(
    (a, b) => b.tests - a.tests || b.bestNet - a.bestNet,
  )[0] ?? null;

  const seconds = inMonth.reduce((sum, r) => sum + r.durationSec, 0);
  const averageNet = mean(inMonth.map((r) => r.netWpm));
  const previousAverage = inPrevious.length > 0 ? mean(inPrevious.map((r) => r.netWpm)) : null;

  return {
    month: format(month, 'yyyy-MM'),
    label: format(month, 'MMMM yyyy'),
    tests: inMonth.length,
    minutes: Math.round(seconds / 60),
    hours: round1(seconds / 3600),
    activeDays: days.size,
    bestStreak: longestStreak([...days.keys()]),
    bestNet: inMonth.reduce((m, r) => Math.max(m, r.netWpm), 0),
    averageNet,
    gained: previousAverage === null ? null : round1(averageNet - previousAverage),
    passed: inMonth.filter((r) => r.status === TestStatus.Passed).length,
    bestDay,
    keysFixed: mistakes ? fixedKeys(mistakes.lastMonth, mistakes.thisMonth) : [],
    empty: inMonth.length === 0,
  };
}

function groupByDay(rows: TestRow[]): Map<string, RecapDay> {
  const days = new Map<string, RecapDay>();
  for (const row of rows) {
    const day = format(parseISO(row.createdAt), 'yyyy-MM-dd');
    const entry = days.get(day) ?? { day, tests: 0, bestNet: 0, minutes: 0 };
    entry.tests++;
    entry.bestNet = Math.max(entry.bestNet, row.netWpm);
    entry.minutes += Math.round(row.durationSec / 60);
    days.set(day, entry);
  }
  return days;
}

/** Longest run of consecutive calendar days present in the set. */
function longestStreak(days: string[]): number {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let previous: number | null = null;
  for (const day of sorted) {
    const time = new Date(`${day}T00:00:00`).getTime();
    run = previous !== null && time - previous === 86_400_000 ? run + 1 : 1;
    previous = time;
    best = Math.max(best, run);
  }
  return best;
}

/**
 * Keys that were among last month's worst and have dropped out of this
 * month's. Not "keys with fewer errors" — a quiet month would fake that; a key
 * has to stop being one of the problems.
 */
function fixedKeys(lastMonth: Mistake[], thisMonth: Mistake[]): string[] {
  const before = weakKeys(lastMonth, WATCHED_KEYS).map((k) => k.key);
  const now = new Set(weakKeys(thisMonth, WATCHED_KEYS).map((k) => k.key));
  return before.filter((key) => !now.has(key));
}

/** The month key a recap should next be offered for, or null while it is current. */
export function recapDue(seen: string | null, on = new Date()): string | null {
  const lastComplete = format(subMonths(startOfMonth(on), 1), 'yyyy-MM');
  return seen === lastComplete ? null : lastComplete;
}

function mean(values: number[]): number {
  return values.length ? round1(values.reduce((s, v) => s + v, 0) / values.length) : 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
