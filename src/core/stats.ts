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

// Reward points for a single run: speed + accuracy and pass bonuses.
export function pointsFor(r: TestRow): number {
  return Math.round(r.netWpm) + (r.accuracy >= 95 ? 20 : 0) + (r.status === TestStatus.Passed ? 30 : 0);
}

export function totalPoints(rows: TestRow[]): number {
  return realAttempts(rows).reduce((sum, r) => sum + pointsFor(r), 0);
}
