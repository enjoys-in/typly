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

/**
 * Whether each achievement is earned. The name and description are interface
 * copy and live in the dictionary, keyed by id — core only decides the facts.
 */
export interface Badge {
  id: BadgeId;
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
    { id: 'first', earned: total >= 1 },
    { id: 'ten', earned: total >= 10 },
    { id: 'fifty', earned: total >= 50 },
    { id: 'pass', earned: passed },
    { id: 'wpm30', earned: best >= 30 },
    { id: 'wpm50', earned: best >= 50 },
    { id: 'wpm70', earned: best >= 70 },
    { id: 'perfect', earned: perfect },
    { id: 'streak3', earned: streak >= 3 },
    { id: 'streak7', earned: streak >= 7 },
  ];
}
