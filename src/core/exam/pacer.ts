/**
 * A marker that advances at exactly the exam's cut-off speed.
 *
 * The ghost race runs you against a past attempt, which is motivating but
 * arbitrary — beating last Tuesday says nothing about passing. A cut-off pacer
 * is the other thing entirely: it moves at `minWpm`, so falling behind the
 * marker *is* failing. It needs no prior attempt, which means it works on the
 * very first run, and it maps onto the one number the exam cares about.
 */

import { CHARS_PER_WORD } from '../constants';
import type { ScoringRules } from '../types';

export interface PacerState {
  /** Characters the pacer has "typed" by now. */
  pacerChars: number;
  /** Characters the typist has. */
  typedChars: number;
  /** typedChars − pacerChars: negative means behind the pass line. */
  lead: number;
  /** Each side's progress through the passage, 0–100. */
  pacerPct: number;
  typedPct: number;
  /** True while the typist is at or ahead of the cut-off pace. */
  passing: boolean;
  /** Seconds of cushion (or deficit) at the cut-off's own rate. */
  leadSeconds: number;
  /** The pace being held to, for the label. */
  targetWpm: number;
}

/**
 * Where the cut-off has reached after `elapsedMs`.
 *
 * Deliberately linear: a real cut-off is a flat average over the whole test, so
 * a pacer that eased in at the start would be lying about the requirement.
 */
export function pacerChars(targetWpm: number, elapsedMs: number, charsPerWord: number): number {
  if (targetWpm <= 0 || elapsedMs <= 0) return 0;
  return Math.floor((targetWpm * charsPerWord * elapsedMs) / 60_000);
}

export function pacerState(
  rules: ScoringRules,
  elapsedMs: number,
  typedChars: number,
  passageLength: number,
): PacerState {
  const targetWpm = rules.minWpm;
  const charsPerWord = rules.charsPerWord || CHARS_PER_WORD;
  const ahead = pacerChars(targetWpm, elapsedMs, charsPerWord);
  const lead = typedChars - ahead;
  const charsPerSecond = (targetWpm * charsPerWord) / 60;

  const pct = (chars: number) =>
    passageLength > 0 ? Math.min(100, (chars / passageLength) * 100) : 0;

  return {
    pacerChars: ahead,
    typedChars,
    lead,
    pacerPct: pct(ahead),
    typedPct: pct(typedChars),
    passing: lead >= 0,
    leadSeconds: charsPerSecond > 0 ? Math.round(lead / charsPerSecond) : 0,
    targetWpm,
  };
}

/** True when a pacer is worth showing — a profile with no cut-off has none. */
export function pacerAvailable(rules: ScoringRules): boolean {
  return rules.minWpm > 0;
}
