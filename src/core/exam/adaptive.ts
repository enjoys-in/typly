/**
 * An endless run that finds your real ceiling.
 *
 * Every other mode has a fixed length, which measures how fast you can go for
 * ten minutes. This measures something more useful and much harder to fake:
 * how long you can *hold* exam pace. Passages keep coming, difficulty climbs
 * while the target is held and eases when it slips, and the run ends when the
 * cut-off has been missed for a sustained stretch rather than once.
 *
 * The output is a single honest number — minutes at pace — which is exactly
 * what a 50-minute Stenographer transcription or a long DEST asks for.
 */

import { ENDLESS_FAIL_STREAK, ENDLESS_STEP, PassageBand, PASSAGE_BANDS } from '../constants';
import type { ScoringRules, TestResult } from '../types';
import { ScoringMode } from '../constants';
import { kdph, depressionsOf } from '../scoring/kdph';

export interface AdaptiveLap {
  /** Passage number, 1-based. */
  lap: number;
  /** Band the passage was drawn from. */
  band: PassageBand;
  netWpm: number;
  accuracy: number;
  /** Whether this lap held the cut-off. */
  held: boolean;
  /** Seconds the lap took. */
  seconds: number;
}

export interface AdaptiveRun {
  laps: AdaptiveLap[];
  /** Band the next passage should be drawn from. */
  band: PassageBand;
  /** Consecutive laps below the cut-off. */
  failStreak: number;
  /** True once the run has ended — the fail streak reached its limit. */
  finished: boolean;
  /** Total seconds held at or above the cut-off. */
  secondsAtPace: number;
  /** The headline: whole minutes held at pace. */
  minutesAtPace: number;
  /** Hardest band reached while still holding pace. */
  peakBand: PassageBand;
}

export function startAdaptive(band = PassageBand.Moderate): AdaptiveRun {
  return {
    laps: [],
    band,
    failStreak: 0,
    finished: false,
    secondsAtPace: 0,
    minutesAtPace: 0,
    peakBand: band,
  };
}

/**
 * Fold one finished passage into the run: judge it, move the difficulty, and
 * decide whether the run is over.
 */
export function advanceAdaptive(
  run: AdaptiveRun,
  result: TestResult,
  elapsedMs: number,
  rules: ScoringRules,
): AdaptiveRun {
  const held = heldPace(result, elapsedMs, rules);
  const seconds = Math.round(elapsedMs / 1000);
  const lap: AdaptiveLap = {
    lap: run.laps.length + 1,
    band: run.band,
    netWpm: result.netWpm,
    accuracy: result.accuracy,
    held,
    seconds,
  };

  const failStreak = held ? 0 : run.failStreak + 1;
  const finished = failStreak >= ENDLESS_FAIL_STREAK;
  // Holding pace earns harder material; slipping eases it, so the run settles
  // at the level the typist can actually sustain rather than spiralling.
  const band = shiftBand(run.band, held ? ENDLESS_STEP : -ENDLESS_STEP);
  const secondsAtPace = run.secondsAtPace + (held ? seconds : 0);

  return {
    laps: [...run.laps, lap],
    band: finished ? run.band : band,
    failStreak,
    finished,
    secondsAtPace,
    minutesAtPace: Math.floor(secondsAtPace / 60),
    peakBand: held && bandIndex(run.band) > bandIndex(run.peakBand) ? run.band : run.peakBand,
  };
}

/** Whether one lap met the profile's speed bar and its accuracy bar. */
function heldPace(result: TestResult, elapsedMs: number, rules: ScoringRules): boolean {
  const speedMet =
    rules.scoringMode === ScoringMode.Kdph
      ? kdph(depressionsOf(result), elapsedMs) >= rules.minKdph
      : result.netWpm >= rules.minWpm;
  return speedMet && result.accuracy >= rules.minAccuracy;
}

function bandIndex(band: PassageBand): number {
  return Math.max(0, PASSAGE_BANDS.indexOf(band));
}

function shiftBand(band: PassageBand, step: number): PassageBand {
  const next = bandIndex(band) + step;
  return PASSAGE_BANDS[Math.min(PASSAGE_BANDS.length - 1, Math.max(0, next))]!;
}
