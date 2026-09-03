import type { GrammarIssue, Keystroke, ScoringRules, TestResult } from '../types';
import { countBackspaces, countDeletes } from '../typing/typingEngine';
import { countWords } from '../typing/diff';
import { score } from './scoring';

/**
 * Scoring for a run with no passage on screen — the text is on paper in front
 * of the typist.
 *
 * Nothing can be diffed, so correctness comes from the language instead of from
 * a reference: a word the dictionary rejects is a wrong word, and each grammar
 * issue is an error. Speed is unchanged — characters over time.
 */

/** Just enough of the spell checker to look words up. */
export interface SpellLookup {
  ready(): Promise<boolean>;
  check(word: string): boolean;
}

const WORD_RE = /\S+/g;
/** Leading/trailing punctuation is not part of the word being spelled. */
const TRIM_RE = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

export function wordsOf(text: string): string[] {
  return text.match(WORD_RE) ?? [];
}

/** A word as the dictionary would look it up. */
export function bareWord(token: string): string {
  return token.replace(TRIM_RE, '');
}

export interface PaperFindings {
  words: number;
  /** Distinct misspelled words, in the order they were first typed. */
  misspelled: string[];
  /** How many typed words were misspelled, counting repeats. */
  misspelledCount: number;
  grammar: GrammarIssue[];
  /** False when no dictionary was available for the language. */
  spellChecked: boolean;
}

/**
 * Words the dictionary rejects. Numbers and punctuation-only tokens are skipped,
 * and each distinct word is looked up once however often it was typed.
 */
export async function findMisspellings(
  text: string,
  spell: SpellLookup,
): Promise<{ misspelled: string[]; misspelledCount: number; checked: boolean }> {
  const tokens = wordsOf(text);
  if (!(await spell.ready())) return { misspelled: [], misspelledCount: 0, checked: false };

  const verdicts = new Map<string, boolean>();
  const misspelled: string[] = [];
  let misspelledCount = 0;

  for (const token of tokens) {
    const word = bareWord(token);
    // Skip anything without a letter: digits, dashes, stray punctuation.
    if (word === '' || !/\p{L}/u.test(word)) continue;
    const key = word.toLowerCase();
    let wrong = verdicts.get(key);
    if (wrong === undefined) {
      wrong = !spell.check(word);
      verdicts.set(key, wrong);
      if (wrong) misspelled.push(word);
    }
    if (wrong) misspelledCount++;
  }
  return { misspelled, misspelledCount, checked: true };
}

export interface FreeformInput {
  typed: string;
  elapsedMs: number;
  keystrokes: Keystroke[];
  findings: PaperFindings;
  rules: ScoringRules;
}

/**
 * Turns paper-mode findings into the same TestResult shape every other run
 * produces, by feeding the shared scorer — so penalties, the pass mark and the
 * history all behave identically.
 */
export function scoreFreeform(input: FreeformInput): TestResult {
  const { typed, findings, rules } = input;
  const words = findings.words;
  const wrongWords = Math.min(findings.misspelledCount, words);
  // Characters inside misspelled words are the ones that were typed wrong.
  const misspelledChars = findings.misspelled.reduce((sum, w) => sum + w.length, 0);
  const incorrectChars = findings.spellChecked ? Math.min(misspelledChars, typed.length) : 0;

  return score({
    charsTyped: typed.length,
    correctChars: typed.length - incorrectChars,
    incorrectChars,
    correctWords: Math.max(0, words - wrongWords),
    wrongWords,
    backspaces: countBackspaces(input.keystrokes),
    deletes: countDeletes(input.keystrokes),
    // Grammar issues count alongside spelling: both are mistakes on the page.
    errors: wrongWords + findings.grammar.length,
    elapsedMs: input.elapsedMs,
    rules,
  });
}

/** Word count for the live counter, before any checking has happened. */
export function liveWordCount(typed: string): number {
  return countWords(typed);
}
