/**
 * How long the keyboard was actually under the hands, and how often.
 *
 * The progress page counts *tests*, which answers "how much have I done" only
 * if every test is the same length — and they are not: a 15-minute DEST paper
 * and a two-minute drill both count as one. Time is the honest measure of a
 * day's practice, and it is already stored: `durationSec` on every row is the
 * clock that run was graded on.
 *
 * Every reading here is arithmetic over rows the caller already has, so a page
 * can show today, this week, this month and a per-day history without a second
 * query. Abandoned attempts (gross 0) are excluded throughout — nothing was
 * typed, so no time was spent typing.
 */

import { format, isThisMonth, isThisWeek } from 'date-fns';
import type { TestRow } from '../types';
import { realAttempts } from '../stats';

const DAY_MS = 86_400_000;

/** One period's practice: how many runs, and how long they ran for. */
export interface PracticeBucket {
  tests: number;
  seconds: number;
}

/** One calendar day, including the days nothing was typed. */
export interface PracticeDay extends PracticeBucket {
  /** Local calendar day, `yyyy-MM-dd` — the key the UI labels and sorts on. */
  date: string;
  /** Mean net WPM that day, or null on a day with no runs. */
  netWpm: number | null;
}

export interface PracticeTotals {
  today: PracticeBucket;
  /** The current ISO week, Monday-start — the same week the challenges card counts. */
  week: PracticeBucket;
  month: PracticeBucket;
  allTime: PracticeBucket;
  /** Mean seconds per day over the days that had any practice at all. */
  perActiveDay: number;
  /** How many distinct days have ever been practised. */
  activeDays: number;
}

const EMPTY: PracticeBucket = { tests: 0, seconds: 0 };

function bucket(rows: TestRow[]): PracticeBucket {
  return {
    tests: rows.length,
    seconds: rows.reduce((sum, row) => sum + Math.max(0, row.durationSec), 0),
  };
}

function dayKey(value: string | Date): string {
  return format(new Date(value), 'yyyy-MM-dd');
}

/** Today, this week, this month and all time, from one pass over the rows. */
export function practiceTotals(rows: TestRow[]): PracticeTotals {
  const real = realAttempts(rows);
  if (real.length === 0) {
    return {
      today: EMPTY,
      week: EMPTY,
      month: EMPTY,
      allTime: EMPTY,
      perActiveDay: 0,
      activeDays: 0,
    };
  }
  const today = dayKey(new Date());
  const days = new Set(real.map((row) => dayKey(row.createdAt)));
  const allTime = bucket(real);
  return {
    today: bucket(real.filter((row) => dayKey(row.createdAt) === today)),
    week: bucket(real.filter((row) => isThisWeek(new Date(row.createdAt), { weekStartsOn: 1 }))),
    month: bucket(real.filter((row) => isThisMonth(new Date(row.createdAt)))),
    allTime,
    perActiveDay: days.size === 0 ? 0 : Math.round(allTime.seconds / days.size),
    activeDays: days.size,
  };
}

/**
 * The last `days` calendar days, oldest first, with the empty ones filled in.
 *
 * The gaps are the point: a bar chart that only plots the days someone turned
 * up reads as an unbroken run of practice, which is the one thing a practice
 * history must not do.
 */
export function practiceDays(rows: TestRow[], days = 14): PracticeDay[] {
  const real = realAttempts(rows);
  const byDay = new Map<string, TestRow[]>();
  for (const row of real) {
    const key = dayKey(row.createdAt);
    const list = byDay.get(key);
    if (list) list.push(row);
    else byDay.set(key, [row]);
  }
  const out: PracticeDay[] = [];
  const start = Date.now() - (Math.max(1, days) - 1) * DAY_MS;
  for (let i = 0; i < Math.max(1, days); i++) {
    const date = dayKey(new Date(start + i * DAY_MS));
    const dayRows = byDay.get(date) ?? [];
    out.push({
      date,
      ...bucket(dayRows),
      netWpm:
        dayRows.length === 0
          ? null
          : Math.round(dayRows.reduce((sum, row) => sum + row.netWpm, 0) / dayRows.length),
    });
  }
  return out;
}

/**
 * Seconds as a short, readable duration: "0m", "9m", "1h 04m".
 *
 * Deliberately not `date-fns`' `formatDuration`, which spells the units out in
 * English ("1 hour 4 minutes") — these sit in stat tiles and bar labels where
 * the number is what is being read, and the interface has a Hindi half.
 */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  if (minutes > 0) return `${minutes}m`;
  return total > 0 ? `${total}s` : '0m';
}
