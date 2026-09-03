import { createKeymap, type KeymapSequence } from './keymap';

/**
 * Remington GAIL (Hindi typewriter) layout — Unicode Devanagari on the physical
 * Remington key positions, as required by GAIL/CBI and several state typing
 * tests. This is the base (unshifted + Shift) layer.
 *
 * Transcribed from the SIL "Remington GAIL" Keyman keyboard definition
 * (keymanapp/keyboards, release/r/remington_gail/source/remington_gail.kmn) and
 * cross-checked against the published GAIL chart. Keys are written as the
 * character a US-QWERTY key produces, so Shift is already accounted for.
 *
 * Not included: the AltGr layer of extra conjuncts. Those need a modifier the
 * exam input does not currently forward, and none of them are on the base chart.
 *
 * GAIL is *logical* order, unlike the Kruti Dev fonts it shares key positions
 * with: the consonant is typed before its matra (`g` `f` → हि), not after it as
 * on the mechanical typewriter. SIL left the visual-order rules out on purpose,
 * so this does too — reordering here would disagree with every other GAIL tool.
 */

/** Full consonants and independent vowels: one key, one letter. */
const LETTERS: Record<string, string> = {
  v: 'अ', b: 'इ', m: 'उ', ')': 'ऋ', ',': 'ए',
  d: 'क', x: 'ग', p: 'च', N: 'छ', t: 'ज', '>': 'झ', V: 'ट',
  B: 'ठ', M: 'ड', '<': 'ढ', r: 'त', n: 'द', u: 'न', i: 'प', Q: 'फ', c: 'ब', e: 'म', ';': 'य',
  j: 'र', y: 'ल', G: 'ळ', o: 'व', l: 'स', g: 'ह',
};

/**
 * Half (dead) consonants — the letter plus a halant. On a typewriter these are
 * the letter without its vertical stroke; pressing the stroke key (`k` or `A`)
 * completes them, which the sequences below handle.
 */
const HALF_LETTERS: Record<string, string> = {
  D: 'क', '[': 'ख', X: 'ग', '?': 'घ', P: 'च', T: 'ज', '.': 'ण', R: 'त', F: 'थ', '/': 'ध',
  U: 'न', I: 'प', C: 'ब', H: 'भ', E: 'म', Y: 'ल', O: 'व', "'": 'श', '"': 'ष', L: 'स',
};

const HALANT = '्';

/** Matras and other combining marks. */
const MARKS: Record<string, string> = {
  a: 'ं', '`': '़', A: 'ा', f: 'ि', h: 'ी', q: 'ु', w: 'ू', '=': 'ृ',
  W: 'ॅ', s: 'े', S: 'ै', '+': HALANT,
};

/** Conjuncts and clusters that sit on a single key. */
const CLUSTERS: Record<string, string> = {
  '(': 'त्र', '*': 'द्ध', '~': 'द्य', z: HALANT + 'र', Z: 'र' + HALANT,
  J: 'श्र', K: 'ज्ञ', '}': 'द्व', '{': 'क्ष' + HALANT, ':': 'रू',
};

/** Punctuation, which sits on different keys than it does on a QWERTY board. */
const PUNCTUATION: Record<string, string> = {
  k: 'ा', '!': '।', '#': 'ः', '&': '’', '^': '‘', '\\': '(', '|': ')',
  $: '*', ']': ',', '%': '-', _: '.', '@': '/', '-': ';',
};

/** Consonants that take a nukta, and the precomposed letter it produces. */
const NUKTA: Record<string, string> = {
  'न': 'ऩ', 'र': 'ऱ', 'ळ': 'ऴ', 'क': 'क़', 'ख': 'ख़', 'ग': 'ग़',
  'ज': 'ज़', 'ड': 'ड़', 'ढ': 'ढ़', 'फ': 'फ़', 'य': 'य़',
};

// Characters after which the `#` key means a colon rather than a visarga.
const COLON_CONTEXT = "1234567890;,()/*-‘’“”÷×!* ";

/** The vertical-stroke keys, which complete a half consonant into a full one. */
const STROKE_KEYS = ['k', 'A'];

function completions(): KeymapSequence[] {
  const out: KeymapSequence[] = [];
  for (const letter of Object.values(HALF_LETTERS)) {
    for (const key of STROKE_KEYS) {
      out.push({ before: letter + HALANT, key, text: letter });
    }
  }
  return out;
}

function nuktaRules(): KeymapSequence[] {
  return Object.entries(NUKTA).map(([letter, composed]) => ({
    before: letter,
    key: '`',
    text: composed,
  }));
}

function colonRules(): KeymapSequence[] {
  return [...COLON_CONTEXT].map((ch) => ({ before: ch, key: '#', text: ch + ':' }));
}

const SEQUENCES: KeymapSequence[] = [
  ...completions(),
  ...nuktaRules(),
  ...colonRules(),
  // Vowels are built up the way the typewriter did: a base letter plus a stroke.
  { before: 'अ', key: 'k', text: 'आ' },
  { before: 'अ', key: 'A', text: 'आ' },
  { before: 'आ', key: 'W', text: 'ऑ' },
  { before: 'आ', key: 's', text: 'ओ' },
  { before: 'आ', key: 'S', text: 'औ' },
  { before: 'इ', key: 'Z', text: 'ई' },
  { before: 'उ', key: 'q', text: 'ऊ' },
  { before: 'ए', key: 'W', text: 'ऍ' },
  { before: 'ए', key: 's', text: 'ऐ' },
  // The same for the matras.
  { before: 'ा', key: 'W', text: 'ॉ' },
  { before: 'ा', key: 's', text: 'ो' },
  { before: 'ा', key: 'S', text: 'ौ' },
  { before: 'ॉ', key: 'a', text: 'ाँ' },
  { before: 'ॅ', key: 'a', text: 'ँ' },
  { before: 'ॅ', key: 'A', text: 'ँ' },
  { before: 'ं', key: 'W', text: 'ँ' },
  { before: 'ृ', key: '=', text: 'ॄ' },
  { before: '।', key: '!', text: '॥' },
  { before: '‘', key: '^', text: '“' },
  { before: '’', key: '&', text: '”' },
];

export const REMINGTON_MAP: Record<string, string> = {
  ...LETTERS,
  ...Object.fromEntries(Object.entries(HALF_LETTERS).map(([key, letter]) => [key, letter + HALANT])),
  ...MARKS,
  ...CLUSTERS,
  ...PUNCTUATION,
};

export const REMINGTON = createKeymap({
  label: 'Remington GAIL',
  table: REMINGTON_MAP,
  sequences: SEQUENCES,
});
