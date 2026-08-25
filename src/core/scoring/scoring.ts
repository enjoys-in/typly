import type { ScoringRules, TestResult } from '../types';
import { Difficulty, ErrorPenalty, ExamMode, TestStatus } from '../constants';

export interface ScoreInput {
  charsTyped: number;
  correctChars: number;
  incorrectChars: number;
  correctWords: number;
  wrongWords: number;
  backspaces: number;
  deletes: number;
  errors: number;
  elapsedMs: number;
  rules: ScoringRules;
}

// Difficulty scales the pass thresholds and error penalty over an exam profile's rules.
export function applyDifficulty(rules: ScoringRules, difficulty: Difficulty): ScoringRules {
  switch (difficulty) {
    case Difficulty.Easy:
      return {
        ...rules,
        minWpm: round1(rules.minWpm * 0.7),
        minAccuracy: Math.max(0, rules.minAccuracy - 5),
        penaltyValue: rules.penaltyValue * 0.5,
      };
    case Difficulty.Hard:
      return {
        ...rules,
        minWpm: round1(rules.minWpm * 1.3),
        minAccuracy: Math.min(100, rules.minAccuracy + 3),
        penaltyValue: rules.penaltyValue * 1.5,
      };
    case Difficulty.Normal:
      return rules;
    default: {
      const _exhaustive: never = difficulty;
      return _exhaustive;
    }
  }
}

// Exam mode nudges the pass thresholds toward accuracy or speed.
export function applyMode(rules: ScoringRules, mode: ExamMode): ScoringRules {
  switch (mode) {
    case ExamMode.Accuracy:
      return {
        ...rules,
        minAccuracy: Math.min(100, rules.minAccuracy + 5),
        penaltyValue: rules.penaltyValue * 1.5,
      };
    case ExamMode.Speed:
      return {
        ...rules,
        minWpm: round1(rules.minWpm * 1.15),
        minAccuracy: Math.max(0, rules.minAccuracy - 5),
        penaltyValue: rules.penaltyValue * 0.5,
      };
    case ExamMode.ErrorFree:
      return { ...rules, minAccuracy: 100 };
    case ExamMode.Blind:
    case ExamMode.Standard:
      return rules;
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

export function grossWpm(chars: number, minutes: number, charsPerWord: number): number {
  if (minutes <= 0) return 0;
  return chars / charsPerWord / minutes;
}

function penalty(rules: ScoringRules, errors: number, wrongWords: number): number {
  switch (rules.errorPenalty) {
    case ErrorPenalty.None:
      return 0;
    case ErrorPenalty.PerError:
      return errors * rules.penaltyValue;
    case ErrorPenalty.PerWord:
      return wrongWords * rules.penaltyValue;
    default: {
      const _exhaustive: never = rules.errorPenalty;
      return _exhaustive;
    }
  }
}

export function score(input: ScoreInput): TestResult {
  const { rules } = input;
  const minutes = Math.max(input.elapsedMs / 60_000, 1 / 60_000);
  const gross = grossWpm(input.charsTyped, minutes, rules.charsPerWord);
  // Flat penalty: each mistake subtracts penaltyValue WPM directly from the gross speed.
  const net = Math.max(0, gross - penalty(rules, input.errors, input.wrongWords));
  const accuracy = input.charsTyped === 0 ? 0 : (input.correctChars / input.charsTyped) * 100;
  const passed = net >= rules.minWpm && accuracy >= rules.minAccuracy;

  return {
    grossWpm: round1(gross),
    netWpm: round1(net),
    accuracy: round1(accuracy),
    charsTyped: input.charsTyped,
    correctChars: input.correctChars,
    incorrectChars: input.incorrectChars,
    correctWords: input.correctWords,
    wrongWords: input.wrongWords,
    backspaces: input.backspaces,
    deletes: input.deletes,
    errors: input.errors,
    status: passed ? TestStatus.Passed : TestStatus.Failed,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
