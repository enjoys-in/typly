import { CHARS_PER_WORD, SourceType } from '../constants';

// Same word definition the scorer uses (see core/typing/diff.ts), so the count
// shown here matches the count the exam is graded on.
const WORD_RE = /\S+/g;

export interface TextStats {
  /** Total characters, whitespace included. */
  chars: number;
  /** Characters excluding all whitespace. */
  charsNoSpaces: number;
  /** Whitespace-separated words. */
  words: number;
  /** Literal space characters. */
  spaces: number;
  /** Full stops / periods. */
  fullStops: number;
  /** Sentences, terminated by . ! ? or the Devanagari danda (।). */
  sentences: number;
  /** Non-blank lines. */
  lines: number;
  /** Blocks separated by a blank line. */
  paragraphs: number;
  digits: number;
  punctuation: number;
  uppercase: number;
  /** Mean word length in non-space characters, one decimal. */
  avgWordLen: number;
  longestWord: number;
  /** Exam-standard words (5 characters each) — what WPM is measured in. */
  standardWords: number;
}

function count(text: string, re: RegExp): number {
  return text.match(re)?.length ?? 0;
}

export function textStats(text: string): TextStats {
  const words = text.match(WORD_RE) ?? [];
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const longestWord = words.reduce((max, w) => Math.max(max, w.length), 0);

  return {
    chars: text.length,
    charsNoSpaces,
    words: words.length,
    spaces: count(text, / /g),
    fullStops: count(text, /\./g),
    sentences: text.split(/[.!?।]+/).filter((s) => s.trim().length > 0).length,
    lines: text.split('\n').filter((l) => l.trim().length > 0).length,
    paragraphs: text.split(/\n{2,}/).filter((p) => p.trim().length > 0).length,
    digits: count(text, /\p{Nd}/gu),
    punctuation: count(text, /[\p{P}\p{S}]/gu),
    uppercase: count(text, /\p{Lu}/gu),
    avgWordLen: words.length ? Math.round((charsNoSpaces / words.length) * 10) / 10 : 0,
    longestWord,
    standardWords: Math.round(text.length / CHARS_PER_WORD),
  };
}

/** Rough minutes this passage takes to type at `wpm`, for duration guidance. */
export function estimatedMinutes(stats: TextStats, wpm: number): number {
  if (wpm <= 0 || stats.standardWords === 0) return 0;
  return Math.max(1, Math.ceil(stats.standardWords / wpm));
}

export const SOURCE_LABEL: Record<SourceType, string> = {
  [SourceType.Text]: 'Pasted text',
  [SourceType.Image]: 'Image (OCR)',
  [SourceType.Pdf]: 'PDF',
  [SourceType.Docx]: 'Word document',
};
