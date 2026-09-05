/**
 * A review schedule over your own mistakes.
 *
 * The Trainer already computes weak keys and words, but only ever as a
 * snapshot: nothing recorded that you drilled `ि` on Tuesday, whether it took,
 * or when to test it again. So a weakness you had actually fixed kept
 * resurfacing, and one you never fixed quietly fell off the list the moment
 * fresher mistakes outranked it. Neither is a curriculum.
 *
 * This is a Leitner ladder — the simplest scheduler that works, and the only
 * kind worth using on data this noisy. Each weakness is a card. Type it
 * correctly in a real run and it climbs a rung, so it comes back later. Get it
 * wrong and it drops to the bottom, due tomorrow.
 *
 * Pure: no storage, no clock of its own. `now` is always passed in, which is
 * what makes the whole thing testable.
 */

import { diffChars } from 'diff';
import type { Mistake } from '../types';

/**
 * Two kinds, not three. Confused pairs are already expressible as the key that
 * was missed, and a card you cannot describe in two words is a card nobody
 * reviews.
 */
export type ReviewKind = 'key' | 'word';

export interface ReviewItem {
  /** `${kind}:${value}` — stable, so a card survives being re-derived. */
  id: string;
  kind: ReviewKind;
  value: string;
  /** Rung on the ladder; indexes BOX_DAYS. */
  box: number;
  dueAt: string;
  /** Times this card has been graded, passed or failed. */
  reviews: number;
  lapses: number;
  addedAt: string;
  lastSeenAt: string | null;
}

export type ReviewDeck = Record<string, ReviewItem>;

/**
 * Days until a card returns, by rung. The first is zero because a card nobody
 * has drilled yet is due immediately — there is nothing to wait for.
 *
 * The spacing roughly doubles, which is all a Leitner ladder needs. Anything
 * more elaborate (SM-2 and friends) would be modelling a per-item difficulty we
 * cannot measure from typing mistakes without far more data than most users
 * will ever produce.
 */
export const BOX_DAYS = [0, 1, 3, 7, 16, 35] as const;
export const MASTERED_BOX = BOX_DAYS.length - 1;

const DAY_MS = 86_400_000;

export function itemId(kind: ReviewKind, value: string): string {
  return `${kind}:${value}`;
}

export function newItem(kind: ReviewKind, value: string, now: Date): ReviewItem {
  const iso = now.toISOString();
  return {
    id: itemId(kind, value),
    kind,
    value,
    box: 0,
    dueAt: iso,
    reviews: 0,
    lapses: 0,
    addedAt: iso,
    lastSeenAt: null,
  };
}

/** Passed: up a rung, and away for that rung's interval. */
export function promote(item: ReviewItem, now: Date): ReviewItem {
  const box = Math.min(item.box + 1, MASTERED_BOX);
  return {
    ...item,
    box,
    dueAt: new Date(now.getTime() + BOX_DAYS[box]! * DAY_MS).toISOString(),
    reviews: item.reviews + 1,
    lastSeenAt: now.toISOString(),
  };
}

/**
 * Failed: back to the bottom of the ladder — but due tomorrow, not now.
 *
 * Re-drilling a miss ten seconds later tests short-term memory and nothing
 * else; the gap is the part that does the work. It is also why a lapse is not
 * simply `box - 1`: a card you still get wrong at rung four has not earned
 * rung three.
 */
export function demote(item: ReviewItem, now: Date): ReviewItem {
  return {
    ...item,
    box: 0,
    dueAt: new Date(now.getTime() + DAY_MS).toISOString(),
    reviews: item.reviews + 1,
    lapses: item.lapses + 1,
    lastSeenAt: now.toISOString(),
  };
}

export function isDue(item: ReviewItem, now: Date): boolean {
  return new Date(item.dueAt).getTime() <= now.getTime();
}

export function isMastered(item: ReviewItem): boolean {
  return item.box >= MASTERED_BOX;
}

/** Due cards, most overdue first, then whichever is furthest down the ladder. */
export function dueItems(deck: ReviewDeck, now: Date, limit = Infinity): ReviewItem[] {
  return Object.values(deck)
    .filter((item) => isDue(item, now))
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt) || a.box - b.box)
    .slice(0, limit);
}

export interface DeckStats {
  total: number;
  due: number;
  learning: number;
  mastered: number;
}

export function deckStats(deck: ReviewDeck, now: Date): DeckStats {
  const items = Object.values(deck);
  return {
    total: items.length,
    due: items.filter((i) => isDue(i, now)).length,
    learning: items.filter((i) => !isMastered(i)).length,
    mastered: items.filter(isMastered).length,
  };
}

/**
 * Enrol weaknesses that have no card yet.
 *
 * Deliberately additive only. The weakness lists are computed over *all* stored
 * mistakes, so a key you mastered months ago is still in them — reading them as
 * current evidence would reset every mastered card on every sync and the ladder
 * would never hold anything. Demotion is driven by fresh runs instead, in
 * `gradeRun`, which is the only place that sees what just happened.
 */
export function syncFromWeaknesses(
  deck: ReviewDeck,
  weaknesses: { keys: string[]; words: string[] },
  now: Date,
): ReviewDeck {
  const next = { ...deck };
  const enrol = (kind: ReviewKind, value: string) => {
    if (!value) return;
    const id = itemId(kind, value);
    if (!next[id]) next[id] = newItem(kind, value, now);
  };
  for (const key of weaknesses.keys) enrol('key', key);
  for (const word of weaknesses.words) enrol('word', word);
  return next;
}

/** Characters this run actually got wrong, by the same diff the heatmap uses. */
function lapsedKeys(mistakes: Mistake[]): Set<string> {
  const out = new Set<string>();
  for (const m of mistakes) {
    if (!m.expected) continue;
    for (const part of diffChars(m.expected, m.typed || '')) {
      if (!part.removed) continue;
      for (const ch of part.value.toLowerCase()) out.add(ch);
    }
  }
  return out;
}

/** Whole-word match, so `at` is not credited by `attempt`. */
function containsWord(passage: string, word: string): boolean {
  const lower = passage.toLowerCase();
  const target = word.toLowerCase();
  let from = 0;
  for (;;) {
    const at = lower.indexOf(target, from);
    if (at < 0) return false;
    const before = at === 0 ? '' : lower[at - 1]!;
    const after = lower[at + target.length] ?? '';
    // A boundary is anything that is not part of a word. Kept deliberately
    // simple rather than a \b regex: \b is ASCII-only and would never match a
    // Devanagari word, which is half the passages this app sees.
    const open = !before || /[\s.,;:!?'"()[\]{}\-—–/\\]/.test(before);
    const close = !after || /[\s.,;:!?'"()[\]{}\-—–/\\]/.test(after);
    if (open && close) return true;
    from = at + 1;
  }
}

export interface RunEvidence {
  passage: string;
  mistakes: Mistake[];
}

/**
 * Grade the deck against a finished run.
 *
 * Any completed typing counts — there is no separate "review session" to start
 * and no state to keep between screens. Whatever you typed, the cards it
 * covered get marked.
 *
 * The two directions are deliberately asymmetric:
 *
 * - A **lapse** counts whenever the run shows the mistake, due or not. Fresh
 *   evidence that a card is not learnt outranks a schedule that says it is.
 * - A **pass** only counts for a card that was due *and* actually appeared in
 *   the passage. Otherwise every long run would promote the entire deck for
 *   free, which is how a review queue quietly becomes a participation trophy.
 */
export function gradeRun(
  deck: ReviewDeck,
  run: RunEvidence,
  now: Date,
  /**
   * Cards this run must not grade — in practice, the ones it just created.
   *
   * A weakness is enrolled *because* of the mistakes in a run, so grading that
   * same run against it would demote every new card the moment it is born:
   * guaranteed to lapse, sent to the back of the queue, and due tomorrow. The
   * first thing a new user saw after their first test was "nothing due today",
   * which is the opposite of the truth. A brand-new card is left at the bottom
   * of the ladder and due immediately, because that is what it is.
   */
  exempt: ReadonlySet<string> = new Set(),
): ReviewDeck {
  const missedKeys = lapsedKeys(run.mistakes);
  const missedWords = new Set(run.mistakes.map((m) => m.expected.toLowerCase()).filter(Boolean));
  const next: ReviewDeck = {};

  for (const [id, item] of Object.entries(deck)) {
    if (exempt.has(id)) {
      next[id] = item;
      continue;
    }
    const lapsed =
      item.kind === 'key'
        ? missedKeys.has(item.value.toLowerCase())
        : missedWords.has(item.value.toLowerCase());
    if (lapsed) {
      next[id] = demote(item, now);
      continue;
    }
    const present =
      item.kind === 'key'
        ? run.passage.toLowerCase().includes(item.value.toLowerCase())
        : containsWord(run.passage, item.value);
    next[id] = isDue(item, now) && present ? promote(item, now) : item;
  }
  return next;
}

/** What a drill has to contain to review these cards. */
export function drillSeed(items: ReviewItem[]): { keys: string[]; words: string[] } {
  return {
    keys: items.filter((i) => i.kind === 'key').map((i) => i.value),
    words: items.filter((i) => i.kind === 'word').map((i) => i.value),
  };
}
