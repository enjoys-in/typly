/**
 * *How* each mistake was made, not just what was wrong with it.
 *
 * `analysis.ts` already answers "which keys and words do you get wrong". This
 * answers the more useful question: was the word transposed, doubled, dropped,
 * substituted, or shifted? Each of those has a different cure — transpositions
 * are a rhythm problem, doublings a key-repeat problem, shift errors a
 * coordination problem — so classifying them is what lets the coach say
 * something specific.
 */

import type { Mistake } from '../types';
import { MISTAKE_KINDS, MistakeKind } from '../constants';

export interface KindCount {
  kind: MistakeKind;
  count: number;
  /** Share of all classified mistakes, 0–100. */
  share: number;
  /** Up to three worked examples, as `expected → typed`. */
  examples: { expected: string; typed: string }[];
}

const MAX_EXAMPLES = 3;

/**
 * The single kind that best explains one mistake.
 *
 * Order matters: the tests run from most specific to least, so "teh" is a
 * transposition rather than two substitutions, and a case-only difference is a
 * shift error rather than a substitution of every letter.
 */
export function classify(expected: string, typed: string): MistakeKind {
  if (!expected || !typed) return expected ? MistakeKind.Omission : MistakeKind.Other;
  if (expected === typed) return MistakeKind.Other;

  // Right letters, wrong case — Shift missed, held, or stuck on.
  if (expected.toLowerCase() === typed.toLowerCase()) return MistakeKind.Shift;

  // Whitespace is its own problem: a word run into the next one, or split.
  if (stripSpace(expected) === stripSpace(typed)) return MistakeKind.Spacing;

  if (isTransposition(expected, typed)) return MistakeKind.Transposition;
  if (isDoubling(expected, typed)) return MistakeKind.Doubling;

  if (typed.length < expected.length && isSubsequence(typed, expected)) {
    return MistakeKind.Omission;
  }
  if (typed.length === expected.length) return MistakeKind.Substitution;
  // A longer attempt is an extra keystroke, but only a *repeated* one is a
  // doubling — `isDoubling` above has already claimed those. A stray different
  // character has no single cure, so it is not given one it does not have.
  return MistakeKind.Other;
}

/** Same length, and exactly one adjacent pair swapped. */
function isTransposition(expected: string, typed: string): boolean {
  if (expected.length !== typed.length) return false;
  const diffs: number[] = [];
  for (let i = 0; i < expected.length; i++) {
    if (expected[i] !== typed[i]) diffs.push(i);
    if (diffs.length > 2) return false;
  }
  const [a, b] = diffs;
  if (diffs.length !== 2 || a === undefined || b === undefined || b !== a + 1) return false;
  return expected[a] === typed[b] && expected[b] === typed[a];
}

/** One character held a beat too long: the attempt repeats a letter it shouldn't. */
function isDoubling(expected: string, typed: string): boolean {
  if (typed.length !== expected.length + 1) return false;
  for (let i = 0; i < typed.length; i++) {
    const without = typed.slice(0, i) + typed.slice(i + 1);
    if (without !== expected) continue;
    // The dropped character has to repeat one of its neighbours, or it was an
    // insertion of something new rather than a key that fired twice.
    const ch = typed[i];
    if (ch === typed[i - 1] || ch === typed[i + 1]) return true;
  }
  return false;
}

/** Every character of `small`, in order, somewhere inside `big`. */
function isSubsequence(small: string, big: string): boolean {
  let i = 0;
  for (const ch of big) if (ch === small[i]) i++;
  return i === small.length;
}

function stripSpace(text: string): string {
  return text.replace(/\s+/g, '');
}

/**
 * The whole run's mistakes, grouped by kind and ordered by how often each
 * happened. Kinds with no instances are dropped — an empty row teaches nothing.
 */
export function mistakeTaxonomy(mistakes: Mistake[]): KindCount[] {
  const buckets = new Map<MistakeKind, KindCount>(
    MISTAKE_KINDS.map((kind) => [kind, { kind, count: 0, share: 0, examples: [] }]),
  );

  for (const m of mistakes) {
    const bucket = buckets.get(classify(m.expected, m.typed));
    if (!bucket) continue;
    bucket.count++;
    if (bucket.examples.length < MAX_EXAMPLES && m.expected && m.typed) {
      bucket.examples.push({ expected: m.expected, typed: m.typed });
    }
  }

  const total = mistakes.length;
  return [...buckets.values()]
    .filter((b) => b.count > 0)
    .map((b) => ({ ...b, share: total ? Math.round((b.count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
}
