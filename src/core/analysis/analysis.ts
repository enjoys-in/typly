import { diffChars } from 'diff';
import type { Mistake } from '../types';
import { CATEGORY_LABEL } from '../constants';

export interface WeakWord {
  expected: string;
  count: number;
}

export interface WeakKey {
  key: string;
  count: number;
}

export interface ConfusedPair {
  expected: string;
  typed: string;
  count: number;
}

export interface CategoryCount {
  label: string;
  count: number;
}

const TRACKABLE = /^[a-z0-9!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]$/;

export function weakWords(mistakes: Mistake[], limit = 10): WeakWord[] {
  const counts = new Map<string, number>();
  for (const m of mistakes) {
    if (!m.expected) continue;
    counts.set(m.expected, (counts.get(m.expected) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([expected, count]) => ({ expected, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function categoryBreakdown(mistakes: Mistake[]): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const m of mistakes) {
    const label = CATEGORY_LABEL[m.category];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

// Characters the user failed to type correctly, from char-diffing each mistake.
export function weakKeys(mistakes: Mistake[], limit = 12): WeakKey[] {
  const counts = new Map<string, number>();
  for (const m of mistakes) {
    if (!m.expected) continue;
    for (const part of diffChars(m.expected, m.typed || '')) {
      if (!part.removed) continue;
      for (const ch of part.value.toLowerCase()) {
        if (TRACKABLE.test(ch)) counts.set(ch, (counts.get(ch) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Single-character substitutions (expected → typed), most frequent first.
export function confusedPairs(mistakes: Mistake[], limit = 8): ConfusedPair[] {
  const counts = new Map<string, ConfusedPair>();
  for (const m of mistakes) {
    if (!m.expected || !m.typed) continue;
    const parts = diffChars(m.expected, m.typed);
    for (let i = 0; i < parts.length; i++) {
      const removed = parts[i];
      const added = parts[i + 1];
      if (removed?.removed && added?.added && removed.value.length === 1 && added.value.length === 1) {
        const expected = removed.value.toLowerCase();
        const typed = added.value.toLowerCase();
        if (expected !== typed && TRACKABLE.test(expected)) {
          const key = `${expected}→${typed}`;
          const cur = counts.get(key) ?? { expected, typed, count: 0 };
          cur.count++;
          counts.set(key, cur);
        }
        i++;
      }
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}
