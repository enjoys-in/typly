import { describe, expect, test } from 'bun:test';
import type { DocumentRow } from '../types';
import { Lang, SourceType } from '../constants';
import { nextInSequence, sequenceDepth } from './sequence';

function doc(id: number, lang = Lang.En, content = 'word '.repeat(80)): DocumentRow {
  return {
    id,
    title: `doc ${id}`,
    lang,
    sourceType: SourceType.Text,
    content,
    charCount: content.length,
    createdAt: new Date(2026, 0, id).toISOString(),
  };
}

const library = [doc(1), doc(2), doc(3, Lang.Hi), doc(4)];

describe('nextInSequence', () => {
  test('the next one is the one after it in the list', () => {
    expect(nextInSequence(library, 1)?.id).toBe(2);
    expect(nextInSequence(library, 2)?.id).toBe(3);
  });

  test('the list is a ring, so the last leads back to the first', () => {
    expect(nextInSequence(library, 4)?.id).toBe(1);
  });

  test('a run with no saved paragraph starts at the top of the library', () => {
    expect(nextInSequence(library, null)?.id).toBe(1);
  });

  test('a paragraph deleted mid-run starts the ring over rather than ending it', () => {
    expect(nextInSequence(library, 99)?.id).toBe(1);
  });

  test('the language is kept, so the keyboard never changes under the hands', () => {
    // After 2 comes 3, which is Hindi — an English run takes 4 instead.
    expect(nextInSequence(library, 2, { lang: Lang.En })?.id).toBe(4);
  });

  test('a library with nothing in the asked-for language still supplies one', () => {
    const hindiOnly = [doc(1, Lang.Hi), doc(2, Lang.Hi)];
    expect(nextInSequence(hindiOnly, 1, { lang: Lang.En })?.id).toBe(2);
  });

  test('paragraphs already used are passed over while others remain', () => {
    expect(nextInSequence(library, 1, { skipIds: [1, 2] })?.id).toBe(3);
  });

  test('once every paragraph has been used it starts round again', () => {
    // A continuous run must not stop because the library has been worked
    // through — a second lap is a better answer than an ended session.
    expect(nextInSequence(library, 1, { skipIds: [1, 2, 3, 4] })?.id).toBe(2);
  });

  test('the current paragraph is never offered as its own successor', () => {
    expect(nextInSequence([doc(7)], 7)).toBeNull();
  });

  test('an empty library has nothing to offer', () => {
    expect(nextInSequence([], 1)).toBeNull();
    expect(nextInSequence([], null)).toBeNull();
  });

  test('a blank paragraph is not a passage', () => {
    expect(nextInSequence([doc(1), doc(2, Lang.En, '   '), doc(3)], 1)?.id).toBe(3);
  });

  test('a library of one blank paragraph offers nothing', () => {
    expect(nextInSequence([doc(1), doc(2, Lang.En, '')], 1)).toBeNull();
  });
});

describe('sequenceDepth', () => {
  test('counts what could follow, excluding the current paragraph', () => {
    expect(sequenceDepth(library, 1)).toBe(3);
    expect(sequenceDepth(library, null)).toBe(4);
  });

  test('zero means there is nothing to offer', () => {
    expect(sequenceDepth([doc(7)], 7)).toBe(0);
    expect(sequenceDepth([], null)).toBe(0);
  });
});
