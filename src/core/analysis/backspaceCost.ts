/**
 * What corrections actually cost, in seconds and in WPM.
 *
 * Backspaces and deletes are already counted (`TestResult`), but a raw count of
 * 63 means nothing to anybody. Priced as "corrections cost you 47 seconds —
 * about 4 WPM" it becomes the single most actionable line on the result page,
 * and fix-later is the most common habit at 30–40 WPM.
 *
 * The cost is measured, not assumed: each correction's own inter-key gap comes
 * out of the keystroke log, so a typist who corrects quickly is not charged for
 * someone else's hesitation.
 */

import type { Keystroke, ScoringRules } from '../types';

const CORRECTION_KEYS = new Set(['Backspace', 'Delete']);

/** Fallback per-correction cost where the log is too thin to measure one. */
const ASSUMED_MS = 300;
/** Gaps longer than this are thinking, not typing, and would skew the mean. */
const MAX_GAP_MS = 2_000;

export interface BackspaceCost {
  corrections: number;
  /** Mean milliseconds a single correction took. */
  meanMs: number;
  /** Total time spent correcting. */
  totalMs: number;
  /** Seconds spent correcting, one decimal. */
  seconds: number;
  /** What that time would have been worth at the run's own typing rate. */
  wpmCost: number;
  /** Corrections as a share of every keystroke, 0–100. */
  share: number;
  /**
   * Characters retyped after a correction — the work done twice. Distinct from
   * the correction count, since one backspace can be followed by several keys.
   */
  retyped: number;
}

export function backspaceCost(
  keystrokes: Keystroke[],
  elapsedMs: number,
  rules: ScoringRules,
): BackspaceCost {
  const gaps: number[] = [];
  let corrections = 0;
  let retyped = 0;
  // Once a correction happens, the keys that follow are re-covering ground the
  // typist had already covered — until the cursor passes its old high-water
  // mark. Starts before the passage, so position 0 is itself coverable.
  let furthest = -1;

  for (let i = 0; i < keystrokes.length; i++) {
    const stroke = keystrokes[i]!;
    if (CORRECTION_KEYS.has(stroke.key)) {
      corrections++;
      const previous = keystrokes[i - 1];
      const gap = previous ? stroke.t - previous.t : 0;
      if (gap > 0 && gap <= MAX_GAP_MS) gaps.push(gap);
      continue;
    }
    if (stroke.index <= furthest) retyped++;
    else furthest = stroke.index;
  }

  const meanMs = gaps.length
    ? Math.round(gaps.reduce((sum, g) => sum + g, 0) / gaps.length)
    : ASSUMED_MS;
  // The retyping is the real waste; the keypress itself is only its trigger.
  const interval = typingIntervalMs(keystrokes, elapsedMs);
  const totalMs = corrections * meanMs + retyped * interval;

  // What that time was worth: at this typist's own rate it would have produced
  // `charsSaved` more characters, and those characters spread over the run's
  // full duration are the WPM the habit cost.
  const charsSaved = interval > 0 ? totalMs / interval : 0;
  const runMinutes = Math.max(elapsedMs / 60_000, 1 / 60);
  const wpmCost = charsSaved / rules.charsPerWord / runMinutes;

  return {
    corrections,
    meanMs,
    totalMs: Math.round(totalMs),
    seconds: round1(totalMs / 1000),
    wpmCost: round1(wpmCost),
    share: keystrokes.length ? round1((corrections / keystrokes.length) * 100) : 0,
    retyped,
  };
}

/** The run's own mean time between productive keystrokes. */
function typingIntervalMs(keystrokes: Keystroke[], elapsedMs: number): number {
  const productive = keystrokes.filter((k) => !CORRECTION_KEYS.has(k.key)).length;
  return productive > 0 ? elapsedMs / productive : ASSUMED_MS;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
