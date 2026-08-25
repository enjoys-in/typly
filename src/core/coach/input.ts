// Turns a finished test (result + mistakes) into the platform-agnostic
// `CoachInput` the AI coach consumes. Pure — no React, no platform imports.

import type { Mistake, TestResult } from '../types';
import { ErrorCategory, LANG_LABEL, TestStatus, type ExamBoard, type Lang } from '../constants';
import { categoryBreakdown, weakWords } from '../analysis/analysis';
import { profileFor } from '../scoring/examProfiles';
import type { CoachInput } from './types';

const CHAR_CATEGORIES: ReadonlySet<ErrorCategory> = new Set([
  ErrorCategory.WrongChar,
  ErrorCategory.MissingChar,
  ErrorCategory.ExtraChar,
]);

export function buildCoachInput(
  result: TestResult,
  mistakes: Mistake[],
  meta: { durationSec: number; lang: Lang; board: ExamBoard },
): CoachInput {
  return {
    netWpm: result.netWpm,
    grossWpm: result.grossWpm,
    accuracy: result.accuracy,
    errors: result.errors,
    durationSec: meta.durationSec,
    passed: result.status === TestStatus.Passed,
    language: LANG_LABEL[meta.lang],
    exam: profileFor(meta.board).name,
    focusChars: focusChars(mistakes),
    weakWords: weakWords(mistakes, 8).map((w) => ({ word: w.expected, count: w.count })),
    categories: categoryBreakdown(mistakes),
  };
}

// Approximate the "keys to practice" from character-level mistakes by taking the
// first expected character that diverges from what was typed.
function focusChars(mistakes: Mistake[], limit = 6): string[] {
  const counts = new Map<string, number>();
  for (const m of mistakes) {
    if (!CHAR_CATEGORIES.has(m.category)) continue;
    const ch = firstDiffChar(m.expected, m.typed);
    if (ch && ch.trim()) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([ch]) => ch);
}

function firstDiffChar(expected: string, typed: string): string | null {
  const n = Math.min(expected.length, typed.length);
  for (let i = 0; i < n; i++) {
    if (expected[i] !== typed[i]) return expected[i] ?? null;
  }
  if (expected.length > typed.length) return expected[typed.length] ?? null;
  return null;
}
