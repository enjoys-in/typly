import { createKeymap } from './keymap';

// InScript (Devanagari) keyboard mapping. Keyed by the character a US-QWERTY key
// produces (so Shift is already accounted for), mapped to Unicode Devanagari.
// Source: the standard BIS/Unicode hi-inscript layout. InScript is logical-order,
// so typed code points combine into conjuncts via the font's shaping engine.
export const INSCRIPT_MAP: Record<string, string> = {
  X: 'ँ', x: 'ं', _: 'ः',
  D: 'अ', E: 'आ', F: 'इ', R: 'ई', G: 'उ', T: 'ऊ', '+': 'ऋ',
  '!': 'ऍ', S: 'ए', W: 'ऐ', '|': 'ऑ', A: 'ओ', Q: 'औ',
  k: 'क', K: 'ख', i: 'ग', I: 'घ', U: 'ङ',
  ';': 'च', ':': 'छ', p: 'ज', P: 'झ', '}': 'ञ',
  "'": 'ट', '"': 'ठ', '[': 'ड', '{': 'ढ', C: 'ण',
  l: 'त', L: 'थ', o: 'द', O: 'ध', v: 'न',
  h: 'प', H: 'फ', y: 'ब', Y: 'भ', c: 'म',
  '/': 'य', j: 'र', n: 'ल', b: 'व', M: 'श', '<': 'ष', m: 'स', u: 'ह',
  ']': '़', e: 'ा', f: 'ि', r: 'ी', g: 'ु', t: 'ू', '=': 'ृ',
  '@': 'ॅ', s: 'े', w: 'ै', '\\': 'ॉ', a: 'ो', q: 'ौ', d: '्',
  '>': '।',
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
  '#': '्र', $: 'र्', '%': 'ज्ञ',
  '^': 'त्र', '&': 'क्ष', '*': 'श्र',
};

export const INSCRIPT = createKeymap({ label: 'InScript', table: INSCRIPT_MAP });
