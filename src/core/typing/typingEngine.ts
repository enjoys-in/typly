import type { Keystroke, TimelinePoint } from '../types';
import { CHARS_PER_WORD } from '../constants';

export type CharState = 'untyped' | 'correct' | 'incorrect';

export interface Evaluation {
  states: CharState[];
  correctChars: number;
  incorrectChars: number;
}

// Per-character comparison of what was typed against the expected passage.
export function evaluate(passage: string, typed: string): Evaluation {
  const states: CharState[] = [];
  let correctChars = 0;
  let incorrectChars = 0;

  for (let i = 0; i < passage.length; i++) {
    const typedChar = typed[i];
    if (typedChar === undefined) {
      states.push('untyped');
      continue;
    }
    if (typedChar === passage[i]) {
      states.push('correct');
      correctChars++;
    } else {
      states.push('incorrect');
      incorrectChars++;
    }
  }
  return { states, correctChars, incorrectChars };
}

export function countBackspaces(keystrokes: Keystroke[]): number {
  return keystrokes.reduce((n, k) => (k.key === 'Backspace' ? n + 1 : n), 0);
}

export function countDeletes(keystrokes: Keystroke[]): number {
  return keystrokes.reduce((n, k) => (k.key === 'Delete' ? n + 1 : n), 0);
}

/**
 * Bucket keystrokes into per-minute windows for the WPM/accuracy timeline.
 *
 * One pass over the log rather than one filter per minute: the longitudinal
 * fatigue curve rebuilds this for every run in its window, so a per-minute
 * re-scan of a few thousand keystrokes multiplies out badly.
 */
export function buildTimeline(keystrokes: Keystroke[], elapsedMs: number): TimelinePoint[] {
  const minutes = Math.max(1, Math.ceil(elapsedMs / 60_000));
  const total = new Array<number>(minutes).fill(0);
  const correct = new Array<number>(minutes).fill(0);

  for (const stroke of keystrokes) {
    if (stroke.key === 'Backspace') continue;
    const bucket = Math.floor(stroke.t / 60_000);
    // A keystroke logged past the run's own length belongs to no window, the
    // same as under the previous per-window filter.
    if (bucket < 0 || bucket >= minutes) continue;
    total[bucket]!++;
    if (stroke.correct) correct[bucket]!++;
  }

  return total.map((count, bucket) => ({
    bucket,
    // Per this one-minute window, so the count is already a per-minute rate.
    wpm: round1(correct[bucket]! / CHARS_PER_WORD),
    accuracy: count === 0 ? 0 : round1((correct[bucket]! / count) * 100),
  }));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
