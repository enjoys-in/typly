/**
 * "Which post could I actually clear?"
 *
 * Scoring is pure and every attempt is stored, so the whole history can be
 * re-graded against every profile at once — no new data, only arithmetic over
 * data already held. That answers the question aspirants genuinely agonise
 * over, and it answers it honestly: not "you typed 34 WPM once" but "your best
 * three runs clear SSC MTS, and CHSL is 1.4 WPM away".
 *
 * A single lucky run proves nothing, so eligibility is judged on a typist's
 * *repeatable* speed — the best of several attempts, not the best of all time.
 */

import type { ExamProfile, ScoringRules, TestRow } from '../types';
import { ExamBoard, ScoringMode, TestStatus } from '../constants';
import { gradedBoards, profileFor } from '../scoring/examProfiles';
import { wpmToKdph } from '../scoring/kdph';
import { realAttempts } from '../stats';

/** Where a typist stands against one post. */
export type Standing = 'cleared' | 'close' | 'far';

/** WPM within which a post counts as "one or two WPM away" rather than out of reach. */
const CLOSE_WPM = 3;
/** Attempts that must clear the bar before it counts as repeatable, not lucky. */
const PROOF_RUNS = 3;

export interface PostStanding {
  board: ExamBoard;
  profile: ExamProfile;
  standing: Standing;
  /** Best net WPM achieved in this post's language. */
  bestWpm: number;
  /** Best accuracy on the run that produced `bestWpm`. */
  bestAccuracy: number;
  /** Best key depressions per hour, for posts graded that way. */
  bestKdph: number;
  /** Attempts in this post's language that met both of its thresholds. */
  clearedRuns: number;
  /** Attempts considered at all — a standing over one run is not worth much. */
  consideredRuns: number;
  /** WPM (or KDPH) still missing. Zero once the bar is met. */
  speedGap: number;
  accuracyGap: number;
  /** True once enough separate attempts cleared it to call it repeatable. */
  repeatable: boolean;
}

export interface EligibilityReport {
  cleared: PostStanding[];
  close: PostStanding[];
  far: PostStanding[];
  /** Attempts the report drew on, across every language. */
  attempts: number;
}

/**
 * Re-score every stored attempt against every graded profile.
 *
 * Only attempts in a post's own language count: a 45 WPM English run says
 * nothing about a Hindi Remington test, and pretending otherwise would be the
 * one way this report could mislead someone into applying for the wrong post.
 */
export function eligibility(rows: TestRow[]): EligibilityReport {
  const real = realAttempts(rows);
  const standings = gradedBoards().map((board) => standingFor(board, real));

  return {
    cleared: standings.filter((s) => s.standing === 'cleared').sort(bySpeedGap),
    close: standings.filter((s) => s.standing === 'close').sort(bySpeedGap),
    far: standings.filter((s) => s.standing === 'far').sort(bySpeedGap),
    attempts: real.length,
  };
}

function standingFor(board: ExamBoard, rows: TestRow[]): PostStanding {
  const profile = profileFor(board);
  const { rules } = profile;
  const relevant = rows.filter((row) => row.lang === profile.lang);

  let bestWpm = 0;
  let bestAccuracy = 0;
  let bestKdph = 0;
  let clearedRuns = 0;

  for (const row of relevant) {
    const kdph = kdphFromRow(row);
    if (kdph > bestKdph) bestKdph = kdph;
    if (row.netWpm > bestWpm) {
      bestWpm = row.netWpm;
      bestAccuracy = row.accuracy;
    }
    if (meetsRules(row, kdph, rules)) clearedRuns++;
  }

  const speedGap = speedShortfall(rules, bestWpm, bestKdph);
  const accuracyGap = round1(Math.max(0, rules.minAccuracy - bestAccuracy));
  const met = speedGap === 0 && accuracyGap === 0;

  return {
    board,
    profile,
    standing: met ? 'cleared' : withinReach(rules, speedGap) ? 'close' : 'far',
    bestWpm,
    bestAccuracy,
    bestKdph,
    clearedRuns,
    consideredRuns: relevant.length,
    speedGap,
    accuracyGap,
    repeatable: clearedRuns >= PROOF_RUNS,
  };
}

/**
 * KDPH of a history row. `TestRow` carries no depression count, so it is taken
 * from the row's own net speed — the same conversion the KDPH scorer uses in
 * reverse, which is exact for a run with no corrections and conservative for
 * one with them.
 */
function kdphFromRow(row: TestRow): number {
  return wpmToKdph(row.grossWpm);
}

function meetsRules(row: TestRow, kdph: number, rules: ScoringRules): boolean {
  const speedMet =
    rules.scoringMode === ScoringMode.Kdph ? kdph >= rules.minKdph : row.netWpm >= rules.minWpm;
  return speedMet && row.accuracy >= rules.minAccuracy;
}

function speedShortfall(rules: ScoringRules, bestWpm: number, bestKdph: number): number {
  return rules.scoringMode === ScoringMode.Kdph
    ? Math.max(0, rules.minKdph - bestKdph)
    : round1(Math.max(0, rules.minWpm - bestWpm));
}

/** "Close" is measured in the post's own unit, so KDPH gaps convert first. */
function withinReach(rules: ScoringRules, speedGap: number): boolean {
  if (speedGap === 0) return true;
  const allowance =
    rules.scoringMode === ScoringMode.Kdph ? wpmToKdph(CLOSE_WPM) : CLOSE_WPM;
  return speedGap <= allowance;
}

function bySpeedGap(a: PostStanding, b: PostStanding): number {
  return a.speedGap - b.speedGap || b.clearedRuns - a.clearedRuns;
}

/** How many stored attempts actually passed, for a one-line summary. */
export function passedCount(rows: TestRow[]): number {
  return realAttempts(rows).filter((r) => r.status === TestStatus.Passed).length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
