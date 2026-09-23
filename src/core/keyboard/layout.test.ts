import { describe, expect, test } from 'bun:test';
import { InputMethod, Lang } from '../constants';
import { keymapFor } from '../text/keymaps';
import { CONSONANT_GROUPS, MATRAS } from '../practice/devanagari';
import { KEY_ROWS, keyIdForChar, shiftedChar } from './layout';

const INSCRIPT = keymapFor(InputMethod.InScript, Lang.Hi)!;
const REMINGTON = keymapFor(InputMethod.Remington, Lang.Hi)!;
const KEYS = KEY_ROWS.flat();
/** The plain consonants — the ones a layout should give a key each. */
const PLAIN_CONSONANTS = CONSONANT_GROUPS.slice(0, 7).flat();

describe('shiftedChar', () => {
  test('a letter shifts to its own uppercase', () => {
    expect(shiftedChar('q')).toBe('Q');
    expect(shiftedChar('m')).toBe('M');
  });

  test('a symbol shifts to the one printed above it', () => {
    expect(shiftedChar('1')).toBe('!');
    expect(shiftedChar('-')).toBe('_');
    expect(shiftedChar('\\')).toBe('|');
    expect(shiftedChar(';')).toBe(':');
  });

  test('space has no second layer', () => {
    expect(shiftedChar(' ')).toBe('');
  });

  test('every key on the board has one, and it maps back to that key', () => {
    for (const key of KEYS) {
      if (key.id === ' ') continue;
      const shifted = shiftedChar(key.id);
      expect(shifted).not.toBe('');
      // The inverse the exam keyboard uses to decide what to highlight.
      expect(keyIdForChar(shifted)).toBe(key.id);
    }
  });
});

describe('what the chart draws', () => {
  for (const [name, keymap] of [
    ['InScript', INSCRIPT],
    ['Remington', REMINGTON],
  ] as const) {
    test(`${name} fills both layers, so the chart is worth printing`, () => {
      let base = 0;
      let shifted = 0;
      for (const key of KEYS) {
        if (keymap.resolve(key.id, '')?.text) base++;
        const up = shiftedChar(key.id);
        if (up && keymap.resolve(up, '')?.text) shifted++;
      }
      expect(base).toBeGreaterThan(20);
      // The point of charting the second layer: half the alphabet is up there.
      expect(shifted).toBeGreaterThan(15);
    });

    test(`${name} can say how all but the rarest consonant is typed`, () => {
      // The "find a letter" box has to answer for these, whether the layout
      // gives the letter a key or builds it from two. What it cannot answer for
      // is what the layout genuinely does not reach — see the Remington case
      // below, which is ङ and ञ and nothing else.
      const unanswerable = PLAIN_CONSONANTS.filter(
        (c) => keymap.keyForOutput(c) === '' && keymap.sequenceFor(c) === null,
      );
      expect(unanswerable.length).toBeLessThanOrEqual(2);
    });
  }

  test('InScript reaches its matras from the unshifted layer', () => {
    // Which is why its home row drills as syllables: consonants on one hand,
    // matras on the other, both without Shift.
    const reachable = MATRAS.filter((m) => INSCRIPT.keyForOutput(m) !== '');
    expect(reachable.length).toBeGreaterThanOrEqual(MATRAS.length - 2);
  });

  test('InScript gives every plain consonant a key of its own', () => {
    const missing = PLAIN_CONSONANTS.filter((c) => INSCRIPT.keyForOutput(c) === '');
    expect(missing).toEqual([]);
  });

  test('Remington builds the aspirated consonants from two keys, as the typewriter did', () => {
    // The layout's defining quirk, and the thing a Remington chart most has to
    // explain: there is no ख key. You type the half form and then the stroke
    // key, which completes the letter. Twelve of the commonest consonants are
    // like this, so "which key is it on" has no answer for them. झ and छ are
    // not among them — GAIL does give those two a key of their own.
    const built = PLAIN_CONSONANTS.filter((c) => REMINGTON.keyForOutput(c) === '');
    expect(built).toEqual(['ख', 'घ', 'ङ', 'ञ', 'ण', 'थ', 'ध', 'भ', 'श', 'ष']);
    for (const ch of ['ख', 'घ', 'ण', 'थ', 'ध', 'भ', 'श', 'ष']) {
      const keys = REMINGTON.sequenceFor(ch);
      expect(keys).not.toBeNull();
      expect(keys).toHaveLength(2);
      // Every one of them ends on a stroke key, which is what completes a
      // half form into a whole letter.
      expect(['k', 'A']).toContain(keys![1]!);
    }
  });

  test('ङ and ञ are the two the charted Remington layer cannot reach', () => {
    // Honest gap rather than a silent one: GAIL keeps them on the AltGr layer,
    // which the layout data deliberately leaves out (the exam input forwards no
    // such modifier), so the chart must not claim they are a sequence.
    for (const ch of ['ङ', 'ञ']) {
      expect(REMINGTON.keyForOutput(ch)).toBe('');
      expect(REMINGTON.sequenceFor(ch)).toBeNull();
    }
  });

  test('a letter that is already one key is not reported as a sequence', () => {
    expect(REMINGTON.sequenceFor('क')).toBeNull();
    expect(INSCRIPT.sequenceFor('क')).toBeNull();
  });

  test('the two layouts disagree about nearly every key', () => {
    // A chart per layout is not decoration: this is why one cannot stand in
    // for the other.
    const same = KEYS.filter((key) => {
      const a = INSCRIPT.resolve(key.id, '')?.text;
      const b = REMINGTON.resolve(key.id, '')?.text;
      return a !== undefined && a === b;
    });
    expect(same.length).toBeLessThan(5);
  });
});
