import { addDays, format, parseISO } from 'date-fns';
import type { ExamProfile } from '../types';
import { realAttempts } from '../stats';
import { daysUntil, type ExamTarget } from './target';

/**
 * Am I going to pass, and when?
 *
 * The app already knows everything needed to answer that — every attempt, and
 * the cut-off of the exam being sat — but never put the two together. This does
 * the arithmetic and nothing else: current form against the cut-off, the rate
 * of improvement, and the date those two lines cross. All of it local; none of
 * it a promise (see the caveats on each field).
 */

const DAY_MS = 86_400_000;
/** Attempts that make up "current form". */
const FORM_WINDOW = 10;
/** How far back to look when fitting a trend line. */
const TREND_DAYS = 45;
/** Fewer attempts than this is noise, not a trend. */
const TREND_MIN_ATTEMPTS = 4;
/** A trend needs a spread of days; five tests in one evening is one data point. */
const TREND_MIN_SPAN_DAYS = 2;
/** Days over which practice time is averaged. */
const HABIT_DAYS = 14;
/** Beyond this the projection is meaningless, so it is reported as none. */
const MAX_PROJECTION_DAYS = 730;

/**
 * The part of a past attempt a forecast needs. Deliberately looser than
 * TestRow: the desktop store hands back plain strings out of SQLite, and none
 * of this arithmetic cares whether the language is a typed enum.
 */
export interface AttemptSample {
  createdAt: string;
  lang: string;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  durationSec: number;
}

export type Verdict =
  /** Exam day has been and gone. */
  | 'passed'
  /** Nothing to go on yet in the exam's language. */
  | 'noData'
  /** Current form already clears both cut-offs. */
  | 'ready'
  /** Not there yet, but the trend arrives before exam day. */
  | 'onTrack'
  /** The trend does not arrive in time, or there is no upward trend. */
  | 'behind';

export interface Readiness {
  /** Calendar days to exam day; negative once it has passed. */
  daysLeft: number;
  verdict: Verdict;
  /** Mean net WPM over recent attempts — current form, not the personal best. */
  netWpm: number;
  accuracy: number;
  /** How many attempts the form is based on. */
  attempts: number;
  requiredWpm: number;
  requiredAccuracy: number;
  /** What is still missing; zero once the cut-off is met. */
  wpmGap: number;
  accuracyGap: number;
  /** Net WPM gained per day, least-squares. Null when there is too little data. */
  trendPerDay: number | null;
  /** Where that trend meets the cut-off (YYYY-MM-DD), or null if it never does. */
  projectedDate: string | null;
  /** WPM per day needed to arrive on time. Null when nothing is needed. */
  neededPerDay: number | null;
  /** Average minutes practised per day over the last two weeks. */
  minutesPerDay: number;
  /** Days practised in that window — the honest half of the average. */
  activeDays: number;
}

export function readinessFor(
  target: ExamTarget,
  profile: ExamProfile,
  rows: AttemptSample[],
  now = new Date(),
): Readiness {
  const daysLeft = daysUntil(target.date, now);
  // Speed in Devanagari and speed in English are different skills, so a
  // forecast for a Hindi paper must not be flattered by English attempts. The
  // language comes from the target, not the profile: the same exam is sat in
  // different languages in different states.
  const relevant = realAttempts(rows).filter((row) => row.lang === target.lang);
  const { minWpm, minAccuracy } = profile.rules;

  const form = relevant.slice(0, FORM_WINDOW);
  const netWpm = mean(form.map((r) => r.netWpm));
  const accuracy = mean(form.map((r) => r.accuracy));
  const wpmGap = round1(Math.max(0, minWpm - netWpm));
  const accuracyGap = round1(Math.max(0, minAccuracy - accuracy));

  const trendPerDay = trend(relevant, now);
  const projectedDate = project(netWpm, minWpm, trendPerDay, now);
  const habit = practiceHabit(relevant, now);

  return {
    daysLeft,
    verdict: verdictFor({ daysLeft, attempts: form.length, wpmGap, accuracyGap, projectedDate, target }),
    netWpm,
    accuracy,
    attempts: form.length,
    requiredWpm: minWpm,
    requiredAccuracy: minAccuracy,
    wpmGap,
    accuracyGap,
    trendPerDay,
    projectedDate,
    neededPerDay: wpmGap > 0 && daysLeft > 0 ? round2(wpmGap / daysLeft) : null,
    ...habit,
  };
}

function verdictFor(input: {
  daysLeft: number;
  attempts: number;
  wpmGap: number;
  accuracyGap: number;
  projectedDate: string | null;
  target: ExamTarget;
}): Verdict {
  if (input.daysLeft < 0) return 'passed';
  if (input.attempts === 0) return 'noData';
  if (input.wpmGap === 0 && input.accuracyGap === 0) return 'ready';
  // On track means the trend line crosses the cut-off on or before exam day.
  if (input.projectedDate !== null && input.projectedDate <= input.target.date) return 'onTrack';
  return 'behind';
}

/**
 * Net WPM gained per day, as the slope of a least-squares line through recent
 * attempts. Sparse or single-day history gives no slope at all rather than a
 * confident one, because a forecast is only as honest as its input.
 */
function trend(rows: AttemptSample[], now: Date): number | null {
  const since = now.getTime() - TREND_DAYS * DAY_MS;
  const points = rows
    .filter((row) => new Date(row.createdAt).getTime() >= since)
    .map((row) => ({ x: new Date(row.createdAt).getTime() / DAY_MS, y: row.netWpm }));
  if (points.length < TREND_MIN_ATTEMPTS) return null;

  const xs = points.map((p) => p.x);
  const span = Math.max(...xs) - Math.min(...xs);
  if (span < TREND_MIN_SPAN_DAYS) return null;

  const meanX = xs.reduce((sum, x) => sum + x, 0) / points.length;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  let covariance = 0;
  let variance = 0;
  for (const point of points) {
    covariance += (point.x - meanX) * (point.y - meanY);
    variance += (point.x - meanX) ** 2;
  }
  return variance === 0 ? null : round2(covariance / variance);
}

/** The day the trend line reaches the cut-off. */
function project(
  netWpm: number,
  requiredWpm: number,
  trendPerDay: number | null,
  now: Date,
): string | null {
  if (netWpm >= requiredWpm) return format(now, 'yyyy-MM-dd');
  // Standing still or sliding back never arrives, and saying so is the point.
  if (trendPerDay === null || trendPerDay <= 0) return null;
  const days = Math.ceil((requiredWpm - netWpm) / trendPerDay);
  if (days > MAX_PROJECTION_DAYS) return null;
  return format(addDays(now, days), 'yyyy-MM-dd');
}

/** How much practice is actually happening, which is what a forecast rests on. */
function practiceHabit(
  rows: AttemptSample[],
  now: Date,
): { minutesPerDay: number; activeDays: number } {
  const since = now.getTime() - HABIT_DAYS * DAY_MS;
  const recent = rows.filter((row) => new Date(row.createdAt).getTime() >= since);
  const seconds = recent.reduce((sum, row) => sum + row.durationSec, 0);
  const days = new Set(recent.map((row) => format(new Date(row.createdAt), 'yyyy-MM-dd')));
  return {
    minutesPerDay: Math.round(seconds / 60 / HABIT_DAYS),
    activeDays: days.size,
  };
}

/** Days from today to a projected date, for phrasing "in about N days". */
export function daysToProjection(projectedDate: string, now = new Date()): number {
  return Math.max(0, Math.round((parseISO(projectedDate).getTime() - now.getTime()) / DAY_MS));
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : round1(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
