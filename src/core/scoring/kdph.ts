/**
 * Key depressions per hour — the measure data-entry recruitment actually uses.
 *
 * DEST and Data Entry Operator posts are not scored in words: the notification
 * asks for 8,000 or 15,000 *key depressions per hour*, where a depression is
 * any key pressed, corrections included. That makes it a fundamentally
 * different target from WPM — backspacing raises your depression count while
 * lowering your speed — so it gets its own arithmetic rather than a conversion
 * factor bolted onto the WPM scorer.
 */

import type { TestResult } from '../types';
import { CHARS_PER_WORD, MINUTES_PER_HOUR } from '../constants';

/** The three counts a depression total is built from. */
export interface DepressionCounts {
  charsTyped: number;
  backspaces: number;
  deletes: number;
}

/**
 * Every key the typist pressed. Characters land in the text; Backspace and
 * Delete do not, but they were still depressions and the exam counts them.
 */
export function depressionsOf(counts: DepressionCounts): number {
  return counts.charsTyped + counts.backspaces + counts.deletes;
}

/** Depressions extrapolated to an hour. */
export function kdph(depressions: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const hours = elapsedMs / 3_600_000;
  return Math.round(depressions / hours);
}

/** The KDPH a stored result works out to — no new column needed to read it. */
export function kdphOf(result: TestResult, durationSec: number): number {
  return kdph(depressionsOf(result), durationSec * 1000);
}

/**
 * KDPH as an equivalent typing speed, and back. Useful either way round: an
 * aspirant who knows they type 35 WPM wants to know whether that clears 8,000,
 * and one drilling a KDPH target wants a WPM number to hold on screen.
 */
export function kdphToWpm(depressionsPerHour: number): number {
  return round1(depressionsPerHour / MINUTES_PER_HOUR / CHARS_PER_WORD);
}

export function wpmToKdph(wpm: number): number {
  return Math.round(wpm * CHARS_PER_WORD * MINUTES_PER_HOUR);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
