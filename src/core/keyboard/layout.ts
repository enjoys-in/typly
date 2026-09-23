// QWERTY layout with touch-typing finger groups, used by the on-screen keyboard.

export type Finger = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';

export interface Key {
  id: string; // canonical char used to match the next keystroke
  label: string; // display text
  finger: Finger;
  width: number; // relative flex-grow units
}

function k(id: string, label: string, finger: Finger, width = 1): Key {
  return { id, label, finger, width };
}

export const KEY_ROWS: Key[][] = [
  [
    k('`', '`', 'pinky'),
    k('1', '1', 'pinky'),
    k('2', '2', 'ring'),
    k('3', '3', 'middle'),
    k('4', '4', 'index'),
    k('5', '5', 'index'),
    k('6', '6', 'index'),
    k('7', '7', 'index'),
    k('8', '8', 'middle'),
    k('9', '9', 'ring'),
    k('0', '0', 'pinky'),
    k('-', '-', 'pinky'),
    k('=', '=', 'pinky'),
  ],
  [
    k('q', 'Q', 'pinky'),
    k('w', 'W', 'ring'),
    k('e', 'E', 'middle'),
    k('r', 'R', 'index'),
    k('t', 'T', 'index'),
    k('y', 'Y', 'index'),
    k('u', 'U', 'index'),
    k('i', 'I', 'middle'),
    k('o', 'O', 'ring'),
    k('p', 'P', 'pinky'),
    k('[', '[', 'pinky'),
    k(']', ']', 'pinky'),
    k('\\', '\\', 'pinky'),
  ],
  [
    k('a', 'A', 'pinky'),
    k('s', 'S', 'ring'),
    k('d', 'D', 'middle'),
    k('f', 'F', 'index'),
    k('g', 'G', 'index'),
    k('h', 'H', 'index'),
    k('j', 'J', 'index'),
    k('k', 'K', 'middle'),
    k('l', 'L', 'ring'),
    k(';', ';', 'pinky'),
    k("'", "'", 'pinky'),
  ],
  [
    k('z', 'Z', 'pinky'),
    k('x', 'X', 'ring'),
    k('c', 'C', 'middle'),
    k('v', 'V', 'index'),
    k('b', 'B', 'index'),
    k('n', 'N', 'index'),
    k('m', 'M', 'index'),
    k(',', ',', 'middle'),
    k('.', '.', 'ring'),
    k('/', '/', 'pinky'),
  ],
  [k(' ', 'space', 'thumb', 10)],
];

// Shifted symbols map back to their base (unshifted) key for highlighting.
const SHIFT: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', $: '4', '%': '5', '^': '6', '&': '7', '*': '8',
  '(': '9', ')': '0', _: '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';',
  '"': "'", '<': ',', '>': '.', '?': '/', '~': '`',
};

// The key id a character maps to (uppercase → its letter key, symbols → base key).
export function keyIdForChar(ch: string): string {
  if (ch === ' ') return ' ';
  if (ch === '\n' || ch === '\t') return '';
  const lower = ch.toLowerCase();
  if (lower !== ch) return lower;
  return SHIFT[ch] ?? ch;
}

/**
 * The character a key produces with Shift held.
 *
 * The inverse of the table above, plus the letters, which shift to their own
 * uppercase. A remapped layout needs this to be asked about its *second* layer:
 * InScript and Remington keep half the alphabet up there — ख, घ, छ, झ, ठ, ढ, ण,
 * थ, ध, फ, भ, श, ष and every conjunct key — and a chart that only showed the
 * unshifted face would be missing the harder half of the keyboard.
 */
const SHIFTED: Record<string, string> = Object.fromEntries(
  Object.entries(SHIFT).map(([shifted, base]) => [base, shifted]),
);

export function shiftedChar(keyId: string): string {
  if (keyId === ' ') return '';
  const upper = keyId.toUpperCase();
  return upper !== keyId ? upper : (SHIFTED[keyId] ?? '');
}

/** Flat lookup from key id to its Key, for single-key displays. */
const BY_ID: Record<string, Key> = Object.fromEntries(
  KEY_ROWS.flat().map((key) => [key.id, key]),
);

/** The Key a character resolves to, or null for keys not on the layout. */
export function keyForChar(ch: string): Key | null {
  const id = keyIdForChar(ch);
  return id ? (BY_ID[id] ?? null) : null;
}
