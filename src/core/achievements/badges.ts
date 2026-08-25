import type { TestRow } from '../types';
import { TestStatus } from '../constants';
import { currentStreak, realAttempts } from '../stats';

export type BadgeId =
  | 'first'
  | 'ten'
  | 'fifty'
  | 'pass'
  | 'wpm30'
  | 'wpm50'
  | 'wpm70'
  | 'perfect'
  | 'streak3'
  | 'streak7';

export interface Badge {
  id: BadgeId;
  label: string;
  description: string;
  earned: boolean;
}

// Derive earned/locked achievement badges from test history.
export function computeBadges(rows: TestRow[]): Badge[] {
  const real = realAttempts(rows);
  const total = real.length;
  const best = real.reduce((m, r) => Math.max(m, r.netWpm), 0);
  const perfect = real.some((r) => r.accuracy >= 100);
  const passed = real.some((r) => r.status === TestStatus.Passed);
  const streak = currentStreak(real);

  return [
    { id: 'first', label: 'First steps', description: 'Complete your first test', earned: total >= 1 },
    { id: 'ten', label: 'Getting warm', description: 'Complete 10 tests', earned: total >= 10 },
    { id: 'fifty', label: 'Dedicated', description: 'Complete 50 tests', earned: total >= 50 },
    { id: 'pass', label: 'Qualified', description: 'Pass a test', earned: passed },
    { id: 'wpm30', label: '30 WPM', description: 'Reach 30 net WPM', earned: best >= 30 },
    { id: 'wpm50', label: '50 WPM', description: 'Reach 50 net WPM', earned: best >= 50 },
    { id: 'wpm70', label: 'Speedster', description: 'Reach 70 net WPM', earned: best >= 70 },
    { id: 'perfect', label: 'Flawless', description: 'Finish with 100% accuracy', earned: perfect },
    { id: 'streak3', label: 'On a roll', description: '3-day practice streak', earned: streak >= 3 },
    { id: 'streak7', label: 'Unstoppable', description: '7-day practice streak', earned: streak >= 7 },
  ];
}
