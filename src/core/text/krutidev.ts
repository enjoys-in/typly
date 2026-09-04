/**
 * Kruti Dev ⇄ Unicode.
 *
 * Every Hindi typist needs this conversion sooner or later — a form wants
 * Unicode, a printer wants Kruti Dev, an old file is unreadable — and today
 * they google it and paste their text into whichever advert-covered website
 * comes up first. Shipping it offline is a small addition and a real reason to
 * keep the app installed.
 *
 * Kruti Dev is not an encoding: it is a *font* whose glyph slots sit on Latin
 * byte values, on the same key positions as Remington GAIL. That is what makes
 * this cheap — `remington.ts` already holds the position table, so the letter
 * mapping is derived from it rather than transcribed a second time and left to
 * drift.
 *
 * The one thing that cannot be derived is order. GAIL is *logical* (a consonant
 * then its matra, as Unicode stores it); the Kruti Dev fonts are *visual* (the
 * short-i matra is drawn to the left of its consonant, so it is stored before
 * it, and reph is stored after the syllable it sits above). Those two rules are
 * applied explicitly, in both directions.
 *
 * Coverage is the base Remington layer: consonants, vowels, matras, the
 * conjuncts on their own keys, and punctuation. Kruti Dev's decorative variants
 * and its AltGr ligatures are not on that chart and pass through untouched
 * rather than being guessed at.
 */

import { REMINGTON_MAP } from './remington';

const HALANT = '्';
const SHORT_I = 'ि';
const REPH = 'र' + HALANT;

/** Devanagari consonants — what a matra or a halant can attach to. */
const CONSONANT = '[\\u0915-\\u0939\\u0958-\\u095F]';
/**
 * One written syllable's consonant part: a consonant, plus any number of
 * halant-joined consonants after it. This is the unit a matra belongs to.
 */
const CLUSTER = new RegExp(`(${CONSONANT}(?:${HALANT}${CONSONANT})*)`);

/** Latin key → Devanagari, longest key first so multi-key entries win. */
const TO_UNICODE: [string, string][] = Object.entries(REMINGTON_MAP).sort(
  (a, b) => b[0].length - a[0].length,
);

/**
 * Devanagari → Latin key. Where several keys produce the same letter the first
 * one wins, which is the unshifted key — the same preference `createKeymap`
 * makes for its own reverse lookup.
 */
const TO_KRUTIDEV: [string, string][] = (() => {
  const seen = new Set<string>();
  const pairs: [string, string][] = [];
  for (const [key, value] of TO_UNICODE) {
    if (seen.has(value)) continue;
    seen.add(value);
    pairs.push([value, key]);
  }
  return pairs.sort((a, b) => b[0].length - a[0].length);
})();

/**
 * Kruti Dev bytes to Unicode Devanagari.
 *
 * Two passes, and the order matters: the letters are substituted first, then the
 * visual-order rules are undone on the Devanagari — trying to reorder the Latin
 * would mean re-implementing the cluster rules against the key table.
 */
export function krutiDevToUnicode(text: string): string {
  return logicalOrder(replaceAll(text, TO_UNICODE));
}

/** Unicode Devanagari to Kruti Dev bytes, for a font that expects them. */
export function unicodeToKrutiDev(text: string): string {
  return replaceAll(visualOrder(text), TO_KRUTIDEV);
}

/** Longest-match substitution, left to right, without re-scanning output. */
function replaceAll(text: string, table: [string, string][]): string {
  let out = '';
  let i = 0;
  outer: while (i < text.length) {
    for (const [from, to] of table) {
      if (from.length > 0 && text.startsWith(from, i)) {
        out += to;
        i += from.length;
        continue outer;
      }
    }
    out += text[i];
    i++;
  }
  return out;
}

/** Visual order → logical: `ि` moves after its cluster, reph moves before it. */
function logicalOrder(text: string): string {
  const shortI = new RegExp(`${SHORT_I}${CLUSTER.source}`, 'g');
  const reph = new RegExp(`${CLUSTER.source}${REPH}`, 'g');
  return text.replace(shortI, (_m, cluster: string) => cluster + SHORT_I).replace(
    reph,
    (_m, cluster: string) => REPH + cluster,
  );
}

/** Logical order → visual, for the trip back out to a Kruti Dev font. */
function visualOrder(text: string): string {
  const shortI = new RegExp(`${CLUSTER.source}${SHORT_I}`, 'g');
  const reph = new RegExp(`${REPH}${CLUSTER.source}`, 'g');
  return text.replace(shortI, (_m, cluster: string) => SHORT_I + cluster).replace(
    reph,
    (_m, cluster: string) => cluster + REPH,
  );
}

export type ConvertDirection = 'toUnicode' | 'toKrutiDev';

export function convert(text: string, direction: ConvertDirection): string {
  return direction === 'toUnicode' ? krutiDevToUnicode(text) : unicodeToKrutiDev(text);
}

/**
 * Which direction the input probably wants, so the tool can pick for itself.
 * Devanagari code points mean it is already Unicode; Latin bytes with no
 * Devanagari at all mean it is legacy text waiting to be decoded.
 */
export function guessDirection(text: string): ConvertDirection {
  const devanagari = (text.match(/[ऀ-ॿ]/g) ?? []).length;
  return devanagari > text.length * 0.15 ? 'toKrutiDev' : 'toUnicode';
}
