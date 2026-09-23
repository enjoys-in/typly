import { describe, expect, test } from 'bun:test';
import { format } from 'date-fns';
import type { TestRow } from '../types';
import { ExamBoard, Lang, TestStatus } from '../constants';
import { formatDuration, practiceDays, practiceTotals } from './practiceTime';

const DAY_MS = 86_400_000;

/** A finished run `daysAgo` days back, `durationSec` long. */
function row(daysAgo: number, durationSec: number, netWpm = 40, grossWpm = 45): TestRow {
  return {
    id: daysAgo * 1000 + durationSec,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS).toISOString(),
    documentId: null,
    lang: Lang.En,
    examBoard: ExamBoard.Custom,
    grossWpm,
    netWpm,
    accuracy: 95,
    errors: 2,
    durationSec,
    status: TestStatus.Passed,
  };
}

/** An attempt where nothing was typed — no time was spent typing either. */
function abandoned(daysAgo: number, durationSec: number): TestRow {
  return { ...row(daysAgo, durationSec), grossWpm: 0, netWpm: 0 };
}

describe('practiceTotals', () => {
  test('today counts only today, in runs and in seconds', () => {
    const totals = practiceTotals([row(0, 600), row(0, 300), row(2, 900)]);
    expect(totals.today).toEqual({ tests: 2, seconds: 900 });
  });

  test('an abandoned attempt is neither a test nor time spent', () => {
    const totals = practiceTotals([row(0, 600), abandoned(0, 3600)]);
    expect(totals.today).toEqual({ tests: 1, seconds: 600 });
    expect(totals.allTime).toEqual({ tests: 1, seconds: 600 });
  });

  test('the average is per day practised, not per day elapsed', () => {
    // Two days of practice, 30 minutes in total — a fortnight of silence
    // between them must not drag the average down to nothing.
    const totals = practiceTotals([row(0, 600), row(13, 1200)]);
    expect(totals.activeDays).toBe(2);
    expect(totals.perActiveDay).toBe(900);
  });

  test('several runs on one day count as one day practised', () => {
    const totals = practiceTotals([row(0, 60), row(0, 60), row(0, 60)]);
    expect(totals.activeDays).toBe(1);
    expect(totals.allTime.tests).toBe(3);
  });

  test('an empty history reads as zero everywhere, not as NaN', () => {
    const totals = practiceTotals([]);
    expect(totals.today).toEqual({ tests: 0, seconds: 0 });
    expect(totals.allTime).toEqual({ tests: 0, seconds: 0 });
    expect(totals.perActiveDay).toBe(0);
    expect(totals.activeDays).toBe(0);
  });

  test('a negative duration cannot subtract from the day', () => {
    const totals = practiceTotals([row(0, 600), row(0, -900)]);
    expect(totals.today.seconds).toBe(600);
  });
});

describe('practiceDays', () => {
  test('the days nothing was typed are still days', () => {
    const days = practiceDays([row(0, 900), row(3, 600)], 5);
    expect(days).toHaveLength(5);
    expect(days.map((d) => d.seconds)).toEqual([0, 600, 0, 0, 900]);
  });

  test('the last day is today, so the newest bar is on the right', () => {
    const days = practiceDays([row(0, 900)], 7);
    expect(days[days.length - 1]!.date).toBe(format(new Date(), 'yyyy-MM-dd'));
    expect(days[days.length - 1]!.seconds).toBe(900);
  });

  test('a day with no runs has no speed to report', () => {
    const days = practiceDays([row(0, 900, 50)], 2);
    expect(days[0]!.netWpm).toBeNull();
    expect(days[1]!.netWpm).toBe(50);
  });

  test("a day's speed is the mean of its runs", () => {
    const days = practiceDays([row(0, 60, 30), row(0, 60, 50)], 1);
    expect(days[0]!.netWpm).toBe(40);
  });

  test('runs older than the window are left out of it', () => {
    const days = practiceDays([row(30, 3600)], 7);
    expect(days.every((d) => d.seconds === 0)).toBe(true);
  });
});

describe('formatDuration', () => {
  test('reads as a duration at every scale', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(600)).toBe('10m');
    expect(formatDuration(3600)).toBe('1h 00m');
    expect(formatDuration(3840)).toBe('1h 04m');
  });

  test('nothing negative or fractional escapes', () => {
    expect(formatDuration(-10)).toBe('0m');
    expect(formatDuration(59.6)).toBe('1m');
  });
});
