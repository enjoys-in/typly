import { describe, expect, test } from 'bun:test';
import { InputMethod, Lang, PracticeKind, Script, drillsFor } from '../constants';
import { keymapFor } from '../text/keymaps';
import { generateDrillFor } from './generators';
import {
  CONJUNCTS,
  HALF_LETTERS,
  MATRAS,
  WORDS,
  generateDevanagariDrill,
  isCombining,
} from './devanagari';

const INSCRIPT = keymapFor(InputMethod.InScript, Lang.Hi)!;
const REMINGTON = keymapFor(InputMethod.Remington, Lang.Hi)!;

/** Devanagari, the danda, the digits, plus ordinary spaces and Roman marks. */
const DEVANAGARI_OR_NEUTRAL = /^[ऀ-ॿ\s.,?;:\-()/%+*'"0-9]*$/u;
/** A Roman letter in a Hindi drill means English material leaked in. */
const ROMAN_LETTER = /[A-Za-z]/u;

const KINDS = drillsFor(Object.values(PracticeKind), Script.Devanagari);

describe('the layouts are installed', () => {
  test('InScript and Remington both have tables to drill from', () => {
    expect(INSCRIPT.size).toBeGreaterThan(40);
    expect(REMINGTON.size).toBeGreaterThan(40);
  });
});

describe('generateDevanagariDrill', () => {
  for (const kind of KINDS) {
    test(`${kind} produces Devanagari and nothing Roman`, () => {
      for (const keymap of [INSCRIPT, REMINGTON, null]) {
        const text = generateDevanagariDrill(kind, keymap);
        expect(text.length).toBeGreaterThan(20);
        expect(text).toMatch(DEVANAGARI_OR_NEUTRAL);
        expect(ROMAN_LETTER.test(text)).toBe(false);
      }
    });
  }

  test('no drill starts a word with a mark that cannot stand alone', () => {
    // A matra or halant at the head of a word renders on a dotted circle and
    // cannot be typed as written — the drill would be asking for a shape the
    // keyboard does not produce in that order.
    for (const kind of KINDS) {
      for (const keymap of [INSCRIPT, REMINGTON, null]) {
        for (const word of generateDevanagariDrill(kind, keymap).split(/\s+/)) {
          if (word.length === 0) continue;
          expect(isCombining(word[0]!)).toBe(false);
        }
      }
    }
  });

  test('a row drill uses the keys of that row on the layout in force', () => {
    // InScript's home row: क on k, त on l, ल on n… so a home-row drill must be
    // built from those letters and not from some other row's.
    const text = generateDevanagariDrill(PracticeKind.HomeRow, INSCRIPT);
    const homeRow = new Set(
      [...'asdfghjkl;'].map((k) => INSCRIPT.resolve(k, '')?.text).filter(Boolean),
    );
    const used = new Set([...text.replace(/\s+/g, '')]);
    for (const ch of used) expect(homeRow.has(ch)).toBe(true);
  });

  test('the two layouts give different row drills, because they are different keyboards', () => {
    const inscript = new Set(
      [...'asdfghjkl;'].map((k) => INSCRIPT.resolve(k, '')?.text).filter(Boolean),
    );
    const remington = new Set(
      [...'asdfghjkl;'].map((k) => REMINGTON.resolve(k, '')?.text).filter(Boolean),
    );
    expect([...remington].some((ch) => !inscript.has(ch))).toBe(true);
  });

  test('with no layout, a row drill falls back to the alphabet by varga', () => {
    // Phonetic input has no fixed key per letter, so there is no row to drill.
    const text = generateDevanagariDrill(PracticeKind.HomeRow, null);
    expect(text).toContain('कखगघङ');
  });

  test('the matra drill puts every matra on a consonant', () => {
    const text = generateDevanagariDrill(PracticeKind.Matras, INSCRIPT);
    for (const matra of MATRAS) expect(text).toContain(matra);
  });

  test('the half-letter and conjunct drills use their own material', () => {
    const half = generateDevanagariDrill(PracticeKind.HalfLetters, INSCRIPT);
    expect(HALF_LETTERS.some((h) => half.includes(h))).toBe(true);
    const joined = generateDevanagariDrill(PracticeKind.Conjuncts, INSCRIPT);
    expect(CONJUNCTS.some((c) => joined.includes(c))).toBe(true);
  });

  test('digits are Devanagari, because that is what the layouts type', () => {
    const text = generateDevanagariDrill(PracticeKind.Numbers, INSCRIPT);
    expect(text).toMatch(/[०-९]/u);
    expect(text).not.toMatch(/[0-9]/u);
  });

  test('sentences end in a danda', () => {
    expect(generateDevanagariDrill(PracticeKind.Sentences, INSCRIPT)).toContain('।');
  });
});

describe('generateDrillFor', () => {
  test('routes by script, not by drill kind', () => {
    const hindi = generateDrillFor(Lang.Hi, PracticeKind.Words, { keymap: INSCRIPT });
    expect(WORDS.some((w) => hindi.includes(w))).toBe(true);
    expect(ROMAN_LETTER.test(hindi)).toBe(false);

    const english = generateDrillFor(Lang.En, PracticeKind.Words);
    expect(english).toMatch(/[a-z]/u);
  });

  test('Marathi gets the Devanagari drills too', () => {
    const marathi = generateDrillFor(Lang.Mr, PracticeKind.Matras, { keymap: INSCRIPT });
    expect(ROMAN_LETTER.test(marathi)).toBe(false);
  });

  test('a Devanagari-only kind asked for in English still answers with something', () => {
    // `drillsFor` keeps it off the page, but a stale saved lesson could still
    // ask — and an empty passage would be a run with nothing to type.
    const text = generateDrillFor(Lang.En, PracticeKind.Matras);
    expect(text.length).toBeGreaterThan(20);
  });
});
