import type { ScoringRules, TestResult } from '../types';

export interface CutoffCheck {
  requiredWpm: number;
  requiredAccuracy: number;
  /** Net WPM minus the cut-off — negative is the shortfall. */
  wpmGap: number;
  accuracyGap: number;
  wpmMet: boolean;
  accuracyMet: boolean;
  /** False when the profile sets no cut-off (Custom), so nothing can be judged. */
  graded: boolean;
}

export function cutoffCheck(result: TestResult, rules: ScoringRules): CutoffCheck {
  const wpmGap = round1(result.netWpm - rules.minWpm);
  const accuracyGap = round1(result.accuracy - rules.minAccuracy);
  return {
    requiredWpm: rules.minWpm,
    requiredAccuracy: rules.minAccuracy,
    wpmGap,
    accuracyGap,
    wpmMet: wpmGap >= 0,
    accuracyMet: accuracyGap >= 0,
    graded: rules.minWpm > 0 || rules.minAccuracy > 0,
  };
}

/**
 * Where `value` sits among past attempts: the share it beats, 0–100. With no
 * history to compare against there is no rank, hence null.
 */
export function percentileOf(value: number, samples: number[]): number | null {
  if (samples.length === 0) return null;
  const below = samples.filter((s) => s < value).length;
  return Math.round((below / samples.length) * 100);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
