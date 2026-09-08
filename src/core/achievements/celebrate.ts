/**
 * When a result is worth celebrating.
 *
 * Kept out of the results page because "did this go well?" is a scoring
 * question, not a rendering one — and because the answer has to be stingy.
 * Confetti that fires on every run is wallpaper: the second time you see it you
 * stop reading it, and the one run that deserved it lands the same as the rest.
 *
 * So it fires on a *judged* pass — a board with a real cut-off, cleared — or on
 * a flawless run whatever the profile, since not a single mistake is worth
 * something even in a practice passage with nothing to clear.
 */

import { ScoringMode, TestStatus } from '../constants';
import type { ScoringRules, TestResult } from '../types';

export enum Celebration {
  None = 'none',
  /** Cleared the board's cut-off. */
  Pass = 'pass',
  /** Cleared it without a single mistake. */
  Flawless = 'flawless',
}

/**
 * Accuracy a run must reach to count as clean, alongside a zero error count.
 *
 * Not 100: accuracy is a character ratio rounded to one decimal, so a long
 * passage typed perfectly bar one keystroke that was corrected can land at
 * 99.9 while the error count is genuinely zero.
 */
const FLAWLESS_ACCURACY = 99.5;

/** True when the profile actually demands something, so a pass means anything. */
function hasCutoff(rules: ScoringRules): boolean {
  return rules.scoringMode === ScoringMode.Kdph
    ? rules.minKdph > 0
    : rules.minWpm > 0 || rules.minAccuracy > 0;
}

export function celebrationFor(result: TestResult, rules: ScoringRules | null): Celebration {
  // An abandoned run has nothing to judge, and an unscored one (a Custom
  // profile sets no floor) reports every result as a pass — including a blank
  // one, which is where a naive `status === Passed` check would throw paper.
  if (result.status !== TestStatus.Passed || result.charsTyped === 0) return Celebration.None;
  if (result.errors === 0 && result.accuracy >= FLAWLESS_ACCURACY) return Celebration.Flawless;
  return rules && hasCutoff(rules) ? Celebration.Pass : Celebration.None;
}
