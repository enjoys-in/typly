// InScript (Devanagari) keyboard mapping. Keyed by the character a US-QWERTY key
// produces (so Shift is already accounted for), mapped to Unicode Devanagari.
// Source: the standard BIS/Unicode hi-inscript layout. InScript is logical-order,
// so typed code points combine into conjuncts via the font's shaping engine.
export const INSCRIPT_MAP: Record<string, string> = {
  X: '\u0901', x: '\u0902', _: '\u0903',
  D: '\u0905', E: '\u0906', F: '\u0907', R: '\u0908', G: '\u0909', T: '\u090A', '+': '\u090B',
  '!': '\u090D', S: '\u090F', W: '\u0910', '|': '\u0911', A: '\u0913', Q: '\u0914',
  k: '\u0915', K: '\u0916', i: '\u0917', I: '\u0918', U: '\u0919',
  ';': '\u091A', ':': '\u091B', p: '\u091C', P: '\u091D', '}': '\u091E',
  "'": '\u091F', '"': '\u0920', '[': '\u0921', '{': '\u0922', C: '\u0923',
  l: '\u0924', L: '\u0925', o: '\u0926', O: '\u0927', v: '\u0928',
  h: '\u092A', H: '\u092B', y: '\u092C', Y: '\u092D', c: '\u092E',
  '/': '\u092F', j: '\u0930', n: '\u0932', b: '\u0935', M: '\u0936', '<': '\u0937', m: '\u0938', u: '\u0939',
  ']': '\u093C', e: '\u093E', f: '\u093F', r: '\u0940', g: '\u0941', t: '\u0942', '=': '\u0943',
  '@': '\u0945', s: '\u0947', w: '\u0948', '\\': '\u0949', a: '\u094B', q: '\u094C', d: '\u094D',
  '>': '\u0964',
  '0': '\u0966', '1': '\u0967', '2': '\u0968', '3': '\u0969', '4': '\u096A',
  '5': '\u096B', '6': '\u096C', '7': '\u096D', '8': '\u096E', '9': '\u096F',
  '#': '\u094D\u0930', $: '\u0930\u094D', '%': '\u091C\u094D\u091E',
  '^': '\u0924\u094D\u0930', '&': '\u0915\u094D\u0937', '*': '\u0936\u094D\u0930',
};

// The InScript output for a produced key character, or null to pass through.
export function inscriptChar(key: string): string | null {
  return Object.prototype.hasOwnProperty.call(INSCRIPT_MAP, key) ? INSCRIPT_MAP[key]! : null;
}

// Shifted symbol → its unshifted key, so highlighting lands on the physical key.
const SHIFT_BASE: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', $: '4', '%': '5', '^': '6', '&': '7', '*': '8',
  '(': '9', ')': '0', _: '-', '+': '=', '{': '[', '}': ']', '|': '\\',
  ':': ';', '"': "'", '<': ',', '>': '.', '?': '/', '~': '`',
};

function baseKey(ch: string): string {
  return SHIFT_BASE[ch] ?? ch.toLowerCase();
}

// Reverse map: a single Devanagari output → the physical key id to highlight.
export const INSCRIPT_KEY_FOR_OUTPUT: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(INSCRIPT_MAP)) {
    if (val.length === 1 && !(val in out)) out[val] = baseKey(key);
  }
  return out;
})();

// The Devanagari label a key shows in InScript mode, or its default label.
export function inscriptLabel(keyId: string, fallback: string): string {
  const v = INSCRIPT_MAP[keyId];
  return v && v.length === 1 ? v : fallback;
}
