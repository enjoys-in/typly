import { format, isThisMonth, isThisWeek } from 'date-fns';
import type { TestRow } from './types';
import { TestStatus } from './constants';

const DAY_MS = 86_400_000;

// Attempts where something was actually typed (gross > 0) — ignores abandoned tests.
export function realAttempts(rows: TestRow[]): TestRow[] {
  return rows.filter((r) => r.grossWpm > 0);
}

// Consecutive days (ending today or yesterday) with at least one real attempt.
export function currentStreak(rows: TestRow[]): number {
  const real = realAttempts(rows);
  if (real.length === 0) return 0;
  const days = new Set(real.map((r) => format(new Date(r.createdAt), 'yyyy-MM-dd')));
  let cursor = new Date();
  if (!days.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = new Date(cursor.getTime() - DAY_MS);
    if (!days.has(format(cursor, 'yyyy-MM-dd'))) return 0;
  }
  let streak = 0;
  while (days.has(format(cursor, 'yyyy-MM-dd'))) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

// Number of real attempts completed today.
export function testsToday(rows: TestRow[]): number {
  const today = format(new Date(), 'yyyy-MM-dd');
  return realAttempts(rows).filter((r) => format(new Date(r.createdAt), 'yyyy-MM-dd') === today)
    .length;
}

// Real attempts in the current ISO week (Mon-start) and calendar month.
export function testsThisWeek(rows: TestRow[]): number {
  return realAttempts(rows).filter((r) => isThisWeek(new Date(r.createdAt), { weekStartsOn: 1 }))
    .length;
}

export function testsThisMonth(rows: TestRow[]): number {
  return realAttempts(rows).filter((r) => isThisMonth(new Date(r.createdAt))).length;
}

export interface WpmAverages {
  /** Mean net WPM across every real attempt. */
  netAll: number;
  /** Mean gross (unpenalised) WPM across every real attempt. */
  grossAll: number;
  /** Mean net WPM over the most recent attempts — the current form. */
  recentNet: number;
  /** How many attempts `recentNet` covers. */
  recentCount: number;
  /** recentNet minus netAll: positive means improving on your own average. */
  trend: number;
  /** Mean net WPM of today's attempts, or null if none yet. */
  todayNet: number | null;
  bestNet: number;
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : round1(values.reduce((s, v) => s + v, 0) / values.length);
}

/**
 * Every average worth reading at a glance: lifetime, current form, today, best.
 * Rows are newest-first (as `listHistory` returns them), so "recent" is the head.
 */
export function wpmAverages(rows: TestRow[], recent = 10): WpmAverages {
  const real = realAttempts(rows);
  const netAll = mean(real.map((r) => r.netWpm));
  const head = real.slice(0, recent);
  const recentNet = mean(head.map((r) => r.netWpm));
  const today = format(new Date(), 'yyyy-MM-dd');
  const todays = real.filter((r) => format(new Date(r.createdAt), 'yyyy-MM-dd') === today);
  return {
    netAll,
    grossAll: mean(real.map((r) => r.grossWpm)),
    recentNet,
    recentCount: head.length,
    trend: round1(recentNet - netAll),
    todayNet: todays.length > 0 ? mean(todays.map((r) => r.netWpm)) : null,
    bestNet: real.reduce((m, r) => Math.max(m, r.netWpm), 0),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// Reward points for a single run: speed + accuracy and pass bonuses.
export function pointsFor(r: TestRow): number {
  return Math.round(r.netWpm) + (r.accuracy >= 95 ? 20 : 0) + (r.status === TestStatus.Passed ? 30 : 0);
}

export function totalPoints(rows: TestRow[]): number {
  return realAttempts(rows).reduce((sum, r) => sum + pointsFor(r), 0);
}
