import type { GrammarIssue } from '../types';

interface WordChecker {
  check(word: string): boolean;
  suggest(word: string): string[];
}

const WORD_RE = /[A-Za-z][A-Za-z']*/g;

// Flags misspelled words in the passage as issues — kept separate from typing accuracy.
export function spellIssues(text: string, checker: WordChecker): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  for (const match of text.matchAll(WORD_RE)) {
    const word = match[0];
    if (word.length < 2 || checker.check(word)) continue;
    issues.push({
      offset: match.index ?? 0,
      length: word.length,
      message: `Possible spelling mistake: “${word}”`,
      replacements: checker.suggest(word).slice(0, 4),
    });
  }
  return issues;
}
