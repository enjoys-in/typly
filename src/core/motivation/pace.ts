/**
 * When a run was slow enough to be worth a word of encouragement.
 *
 * The exact mirror of `celebrate.ts`, and deliberately so: that module decides
 * when a result has earned confetti, this one decides when it has earned a
 * quote and a bit of ribbing. Keeping the two apart from the results page means
 * "did this go badly?" stays a scoring question rather than a rendering one.
 *
 * It has to be as stingy as the celebration is. A quote on every run is
 * wallpaper — worse than wallpaper, because a motivational poster shown to
 * someone who just missed by two words reads as mockery rather than help. So it
 * fires only on a *judged* miss: a board with a real speed floor, not cleared.
 *
 * Speed only, never accuracy. A run that hit 45 WPM at 82% accuracy failed, but
 * it did not fail by being slow, and telling that typist to keep going is
 * advice for the wrong problem — the mistake taxonomy is already their card.
 */

import { PACE_ADRIFT_SHARE, PACE_NEAR_SHARE, ScoringMode } from '../constants';
import { kdphOf } from '../scoring/kdph';
import type { ScoringRules, TestResult } from '../types';

export enum Pace {
  /** At or above the floor, or nothing to judge against. Say nothing. */
  Fine = 'fine',
  /** Under the line, but within touching distance of it. */
  Near = 'near',
  /** Comfortably short. */
  Short = 'short',
  /** Not in the same postcode as the cut-off. */
  Adrift = 'adrift',
}

export interface PaceVerdict {
  pace: Pace;
  /**
   * The gap, in whatever unit the board grades on — words per minute on most
   * profiles, key depressions per hour on a data-entry post. Always positive:
   * the sign is carried by `pace`.
   */
  shortfall: number;
  /** What the board asked for, and what the run returned, in that same unit. */
  required: number;
  achieved: number;
  /** Which unit the three numbers above are in, so the card can label them. */
  mode: ScoringMode;
}

const FINE: PaceVerdict = {
  pace: Pace.Fine,
  shortfall: 0,
  required: 0,
  achieved: 0,
  mode: ScoringMode.Wpm,
};

/**
 * The speed floor this run was held to, and what it actually managed.
 *
 * A KDPH post is not WPM with a different label on it: backspacing raises a
 * depression count while lowering a typing speed, so a data-entry run has to be
 * read in its own unit or the gap comes out wrong in both directions.
 */
function against(
  result: TestResult,
  rules: ScoringRules,
  durationSec: number,
): { required: number; achieved: number; mode: ScoringMode } {
  if (rules.scoringMode === ScoringMode.Kdph) {
    return {
      required: rules.minKdph,
      achieved: kdphOf(result, durationSec),
      mode: ScoringMode.Kdph,
    };
  }
  return { required: rules.minWpm, achieved: result.netWpm, mode: ScoringMode.Wpm };
}

/**
 * How a finished run sat against its board's speed floor.
 *
 * `durationSec` is needed because a KDPH figure is a rate over the clock and
 * `TestResult` stores only the counts it is derived from.
 */
export function paceOf(
  result: TestResult,
  rules: ScoringRules | null,
  durationSec: number,
): PaceVerdict {
  // A run that produced nothing was abandoned, not typed slowly. Without this
  // the nudge would fire on every test opened and closed by accident — and a
  // shortfall measured against zero characters puts every one of them in the
  // worst tier, which is the least forgiving thing it could possibly do.
  if (!rules || result.charsTyped === 0 || durationSec <= 0) return FINE;

  const { required, achieved, mode } = against(result, rules, durationSec);
  // No floor means nothing to be slow against. A Custom profile sets none, and
  // a practice passage with no cut-off has no opinion about anyone's speed.
  if (required <= 0 || achieved >= required) return FINE;

  const share = achieved / required;
  const pace =
    share >= PACE_NEAR_SHARE ? Pace.Near : share >= PACE_ADRIFT_SHARE ? Pace.Short : Pace.Adrift;

  return {
    pace,
    shortfall: Math.round((required - achieved) * 10) / 10,
    required,
    achieved,
    mode,
  };
}
