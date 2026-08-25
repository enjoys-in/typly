import { diffArrays } from 'diff';
import { fuzzy } from 'fast-fuzzy';
import type { Mistake } from '../types';
import { ErrorCategory } from '../constants';

const WORD_RE = /\S+/g;
const PUNCT_RE = /[.,!?;:'"()\-—]/g;
const SIMILARITY_THRESHOLD = 0.6;

function words(text: string): string[] {
  return text.match(WORD_RE) ?? [];
}

// Align expected vs typed at the word level, then classify each divergence.
export function findMistakes(expected: string, typed: string): Mistake[] {
  const parts = diffArrays(words(expected), words(typed));
  const mistakes: Mistake[] = [];
  let index = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (!part.added && !part.removed) {
      index += part.value.length;
      continue;
    }

    const next = parts[i + 1];
    if (part.removed && next?.added) {
      // A substitution block: pair up expected↔typed words.
      pairWords(part.value, next.value, index, mistakes);
      index += part.value.length;
      i++; // consume the paired `added` block
    } else if (part.removed) {
      for (const w of part.value) {
        mistakes.push({ category: ErrorCategory.MissingWord, expected: w, typed: '', index });
        index++;
      }
    } else if (part.added) {
      for (const w of part.value) {
        mistakes.push({ category: ErrorCategory.ExtraWord, expected: '', typed: w, index });
      }
    }
  }
  return mistakes;
}

function pairWords(exp: string[], got: string[], startIndex: number, out: Mistake[]): void {
  const max = Math.max(exp.length, got.length);
  for (let i = 0; i < max; i++) {
    const e = exp[i];
    const g = got[i];
    const index = startIndex + i;
    if (e === undefined && g !== undefined) {
      out.push({ category: ErrorCategory.ExtraWord, expected: '', typed: g, index });
    } else if (e !== undefined && g === undefined) {
      out.push({ category: ErrorCategory.MissingWord, expected: e, typed: '', index });
    } else if (e !== undefined && g !== undefined) {
      out.push({ category: classify(e, g), expected: e, typed: g, index });
    }
  }
}

function classify(expected: string, typed: string): ErrorCategory {
  if (expected.toLowerCase() === typed.toLowerCase()) return ErrorCategory.Capitalization;
  if (strip(expected) === strip(typed)) return ErrorCategory.Punctuation;

  const similar = fuzzy(expected, typed) >= SIMILARITY_THRESHOLD;
  if (!similar) return ErrorCategory.WrongWord;

  if (typed.length < expected.length) return ErrorCategory.MissingChar;
  if (typed.length > expected.length) return ErrorCategory.ExtraChar;
  return ErrorCategory.WrongChar;
}

function strip(word: string): string {
  return word.replace(PUNCT_RE, '');
}

export function countWords(text: string): number {
  return words(text).length;
}
