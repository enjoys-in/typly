import { describe, expect, test } from 'bun:test';
import {
  DEFAULT_CHUNK_CHARS,
  LONG_PASSAGE_CHARS,
  MIN_SPLIT_CHARS,
  isLongPassage,
  splitPassage,
  splitTexts,
  suggestChunkChars,
} from './splitter';

/** `count` sentences of roughly `chars` characters each. */
function prose(count: number, chars = 60): string {
  const sentence = `${'word '.repeat(Math.max(1, Math.round(chars / 5)) - 1)}end.`;
  return Array.from({ length: count }, () => sentence).join(' ');
}

describe('isLongPassage', () => {
  test('only a text past the long-passage mark is worth offering a split for', () => {
    expect(isLongPassage('a'.repeat(LONG_PASSAGE_CHARS))).toBe(false);
    expect(isLongPassage('a'.repeat(LONG_PASSAGE_CHARS + 1))).toBe(true);
  });

  test('whitespace is not length', () => {
    expect(isLongPassage(` ${'a'.repeat(LONG_PASSAGE_CHARS - 10)} `.padEnd(9_000, ' '))).toBe(false);
  });
});

describe('splitPassage', () => {
  test('an empty text has no parts at all', () => {
    expect(splitPassage('', DEFAULT_CHUNK_CHARS)).toEqual([]);
    expect(splitPassage('   \n  ', DEFAULT_CHUNK_CHARS)).toEqual([]);
  });

  test('a text shorter than the chunk stays one part', () => {
    const parts = splitPassage(prose(4), DEFAULT_CHUNK_CHARS);
    expect(parts).toHaveLength(1);
    expect(parts[0]!.index).toBe(0);
  });

  test('the parts reassemble into the source, in order and without loss', () => {
    const text = prose(120);
    const joined = splitTexts(text, 600).join(' ');
    expect(joined.replace(/\s+/g, ' ')).toBe(text.replace(/\s+/g, ' ').trim());
  });

  test('parts are numbered from zero, with no gaps', () => {
    const parts = splitPassage(prose(120), 600);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.map((p) => p.index)).toEqual(parts.map((_, i) => i));
  });

  test('every cut lands at a sentence end', () => {
    for (const part of splitPassage(prose(120), 600)) {
      expect(part.text.endsWith('end.')).toBe(true);
    }
  });

  // The whole scheme rests on this: only the chunk size is stored, and the
  // parts are recomputed on demand. If the split drifted, saved progress
  // would start pointing at different text.
  test('the same text and chunk size always split the same way', () => {
    const text = prose(200);
    expect(splitTexts(text, 900)).toEqual(splitTexts(text, 900));
  });

  test('a chunk size below the floor is raised to it rather than making stubs', () => {
    const parts = splitPassage(prose(200), 10);
    for (const part of parts.slice(0, -1)) {
      expect(part.text.length).toBeGreaterThanOrEqual(MIN_SPLIT_CHARS / 2);
    }
  });

  // OCR output routinely arrives with no punctuation at all.
  test('text with no sentence ends still splits, at word boundaries', () => {
    const parts = splitPassage('word '.repeat(2_000).trim(), 600);
    expect(parts.length).toBeGreaterThan(1);
    for (const part of parts) {
      expect(part.text.startsWith('word')).toBe(true);
      expect(part.text.endsWith('word')).toBe(true);
    }
  });

  test('a Devanagari danda ends a sentence too', () => {
    const parts = splitPassage(`${'यह एक वाक्य है। '.repeat(200)}`.trim(), 600);
    expect(parts.length).toBeGreaterThan(1);
    for (const part of parts) expect(part.text.endsWith('।')).toBe(true);
  });

  test('no part is left as a scrap at the end', () => {
    const parts = splitPassage(`${prose(60)} tail.`, 600);
    expect(parts[parts.length - 1]!.text.length).toBeGreaterThan(150);
  });
});

describe('suggestChunkChars', () => {
  test('a suggestion is always one of the offered presets', () => {
    for (const length of [0, 500, 2_000, 20_000, 500_000]) {
      expect([600, 1_200, 1_800, 2_500]).toContain(suggestChunkChars(length));
    }
  });

  test('longer texts are cut into longer passages, never shorter ones', () => {
    const lengths = [1_000, 10_000, 30_000, 200_000];
    const suggestions = lengths.map(suggestChunkChars);
    expect(suggestions).toEqual([...suggestions].sort((a, b) => a - b));
  });
});
