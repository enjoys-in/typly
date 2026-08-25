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

// Bucket keystrokes into per-minute windows for the WPM/accuracy timeline.
export function buildTimeline(keystrokes: Keystroke[], elapsedMs: number): TimelinePoint[] {
  const minutes = Math.max(1, Math.ceil(elapsedMs / 60_000));
  const points: TimelinePoint[] = [];

  for (let m = 0; m < minutes; m++) {
    const from = m * 60_000;
    const to = from + 60_000;
    const inWindow = keystrokes.filter((k) => k.t >= from && k.t < to && k.key !== 'Backspace');
    const correct = inWindow.filter((k) => k.correct).length;
    const total = inWindow.length;
    const wpm = correct / CHARS_PER_WORD; // per this 1-minute window
    const accuracy = total === 0 ? 0 : (correct / total) * 100;
    points.push({ bucket: m, wpm: round1(wpm), accuracy: round1(accuracy) });
  }
  return points;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
