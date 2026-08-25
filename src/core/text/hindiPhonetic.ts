// Lightweight Roman → Devanagari transliteration (ITRANS-like) for Hindi phonetic
// typing practice. Whole-string and deterministic, so it can run on every keystroke.

// Consonants, longest keys first so clusters/aspirates win over singles.
const CONSONANTS: [string, string][] = [
  ['kSh', 'क्ष'], ['ksh', 'क्ष'], ['gy', 'ज्ञ'], ['shr', 'श्र'],
  ['chh', 'छ'], ['Chh', 'छ'],
  ['kh', 'ख'], ['gh', 'घ'], ['ch', 'च'], ['jh', 'झ'], ['Th', 'ठ'], ['Dh', 'ढ'],
  ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'], ['bh', 'भ'], ['sh', 'श'], ['Sh', 'ष'], ['ng', 'ङ'], ['ny', 'ञ'],
  ['k', 'क'], ['g', 'ग'], ['j', 'ज'], ['c', 'च'], ['T', 'ट'], ['D', 'ड'], ['N', 'ण'],
  ['t', 'त'], ['d', 'द'], ['n', 'न'], ['p', 'प'], ['b', 'ब'], ['m', 'म'],
  ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'], ['s', 'स'], ['h', 'ह'],
  ['f', 'फ'], ['x', 'क्ष'], ['z', 'ज़'],
];

// Vowel: roman, independent form, dependent matra ('' = inherent 'a').
const VOWELS: [string, string, string][] = [
  ['aa', 'आ', 'ा'], ['ai', 'ऐ', 'ै'], ['au', 'औ', 'ौ'],
  ['ii', 'ई', 'ी'], ['ee', 'ई', 'ी'], ['uu', 'ऊ', 'ू'], ['oo', 'ऊ', 'ू'],
  ['A', 'आ', 'ा'], ['I', 'ई', 'ी'], ['U', 'ऊ', 'ू'], ['E', 'ऐ', 'ै'], ['O', 'औ', 'ौ'],
  ['a', 'अ', ''], ['i', 'इ', 'ि'], ['u', 'उ', 'ु'], ['e', 'ए', 'े'], ['o', 'ओ', 'ो'],
];

const VIRAMA = '्';

function matchFrom(text: string, i: number, table: [string, ...string[]][]): [string, ...string[]] | null {
  for (const entry of table) {
    if (text.startsWith(entry[0], i)) return entry;
  }
  return null;
}

export function toDevanagari(roman: string): string {
  let out = '';
  let i = 0;
  let afterConsonant = false;

  while (i < roman.length) {
    const cons = matchFrom(roman, i, CONSONANTS);
    if (cons) {
      if (afterConsonant) out += VIRAMA;
      out += cons[1];
      afterConsonant = true;
      i += cons[0].length;
      continue;
    }

    const vow = matchFrom(roman, i, VOWELS) as [string, string, string] | null;
    if (vow) {
      out += afterConsonant ? vow[2] : vow[1];
      afterConsonant = false;
      i += vow[0].length;
      continue;
    }

    // Anusvara / visarga shortcuts, else pass the character through untouched.
    const ch = roman[i]!;
    if (ch === 'M' || ch === 'n') out += 'ं';
    else if (ch === 'H') out += 'ः';
    else out += ch;
    afterConsonant = false;
    i += 1;
  }
  return out;
}
