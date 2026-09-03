import { PracticeKind } from '../constants';

// Small frequent-word list for word/capital/punctuation drills.
const WORDS = [
  'the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they',
  'this', 'have', 'from', 'one', 'had', 'word', 'but', 'not', 'what', 'all',
  'were', 'when', 'your', 'can', 'said', 'there', 'use', 'each', 'which', 'she',
  'how', 'their', 'will', 'other', 'about', 'out', 'many', 'then', 'them', 'some',
  'would', 'make', 'like', 'him', 'into', 'time', 'look', 'more', 'write', 'see',
  'number', 'way', 'could', 'people', 'than', 'first', 'water', 'been', 'call', 'who',
];

const SYMBOLS = "!@#$%^&*()-_=+[]{};:'\",.<>/?\\|`~".split('');
const HOME_ROW = 'asdfghjkl;'.split('');
const PUNCT = [',', '.', ';', ':', '!', '?', '-'];
const DIGITS = '0123456789'.split('');
const NUM_OPS = ['+', '-', '*', '/'];

// Real, platform-correct shortcuts — Cmd/Option on macOS, Ctrl/Alt/Win elsewhere.
// A given machine only ever practices the combos that actually exist on it.
const MAC_SHORTCUTS = [
  'Cmd+C', 'Cmd+V', 'Cmd+X', 'Cmd+Z', 'Cmd+A', 'Cmd+S', 'Cmd+F', 'Cmd+P', 'Cmd+N', 'Cmd+W',
  'Cmd+T', 'Cmd+R', 'Cmd+Q', 'Cmd+Shift+Z', 'Cmd+Shift+T', 'Cmd+Tab', 'Cmd+Space', 'Cmd+Left',
  'Cmd+Right', 'Option+Delete', 'Ctrl+Cmd+F', 'Cmd+Comma',
];
const WIN_SHORTCUTS = [
  'Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Ctrl+Z', 'Ctrl+A', 'Ctrl+S', 'Ctrl+F', 'Ctrl+P', 'Ctrl+N',
  'Ctrl+W', 'Ctrl+T', 'Ctrl+R', 'Ctrl+Y', 'Ctrl+Shift+T', 'Alt+Tab', 'Alt+F4', 'Win+D', 'Win+E',
  'Ctrl+Home', 'Ctrl+End', 'Ctrl+Shift+Esc', 'Ctrl+Alt+Del',
];


// Touch-typing rows, split by hand so drills follow the same left/right anchoring
// a keyboard tutor teaches. Index-finger stretch keys (g/h, t/y, b/n) sit at the seam.
const HOME_LEFT = ['a', 's', 'd', 'f', 'g'];
const HOME_RIGHT = ['h', 'j', 'k', 'l', ';'];
const TOP_LEFT = ['q', 'w', 'e', 'r', 't'];
const TOP_RIGHT = ['y', 'u', 'i', 'o', 'p'];
const BOTTOM_LEFT = ['z', 'x', 'c', 'v', 'b'];
const BOTTOM_RIGHT = ['n', 'm', ',', '.', '/'];
// Vertical finger columns (same finger, three rows) — the classic q-a-z ladder drill.
const FINGER_COLUMNS = ['qaz', 'wsx', 'edc', 'rfv', 'tgb', 'yhn', 'ujm', 'ik,', 'ol.', 'p;/'];

// The letter pairs that cost English typists the most time: awkward rolls,
// same-hand reaches, and the q-u pairing that has no alternative.
const HARD_BIGRAMS = [
  'th', 'ch', 'sh', 'ph', 'gh', 'qu', 'wh', 'ck', 'ng', 'nk',
  'br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr', 'bl', 'cl', 'fl', 'gl', 'pl', 'sl',
  'sc', 'sk', 'sm', 'sn', 'sp', 'st', 'sw', 'tw', 'dw', 'mp', 'nd', 'nt', 'rd',
];

// Words that alternate hands almost every keystroke — the easiest rhythm to
// build speed on, and the drill that teaches it.
const ALTERNATING_WORDS = [
  'the', 'and', 'with', 'their', 'them', 'title', 'right', 'field', 'world',
  'height', 'signal', 'theory', 'social', 'profit', 'ritual', 'visual', 'orient',
  'blame', 'chair', 'flame', 'giant', 'ideal', 'laugh', 'ocean', 'panel', 'shape',
];

// Sequences that hit the same finger twice in a row — the slowest motion on a
// keyboard, and the one that hides in ordinary words.
const SAME_FINGER = [
  'ed', 'de', 'ki', 'ik', 'ju', 'uj', 'lo', 'ol', 'ft', 'tf', 'gr', 'rg',
  'hy', 'yh', 'nu', 'un', 'my', 'ym', 'cd', 'dc', 'xs', 'sx', 'wz', 'zw',
  'deed', 'kick', 'juju', 'loll', 'fifty', 'gravy', 'hymn', 'nun', 'myth',
];

// Long words, where a single mistyped letter costs the whole word.
const LONG_WORDS = [
  'government', 'development', 'information', 'organisation', 'responsibility',
  'administration', 'communication', 'international', 'qualification', 'infrastructure',
  'recommendation', 'representative', 'characteristic', 'constitutional', 'understanding',
  'examination', 'application', 'requirement', 'appointment', 'certificate',
  'department', 'employment', 'management', 'settlement', 'statement',
];

const SENTENCES = [
  'The quick brown fox jumps over the lazy dog.',
  'Pack my box with five dozen liquor jugs.',
  'How vexingly quick daft zebras jump!',
  'Sphinx of black quartz, judge my vow.',
  'The five boxing wizards jump quickly.',
  'Bright vixens jump; dozy fowl quack.',
  'A wizard\u2019s job is to vex chumps quickly in fog.',
  'We promptly judged antique ivory buckles for the next prize.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function times<T>(n: number, fn: () => T): T[] {
  return Array.from({ length: n }, fn);
}

function group(min: number, max: number, chars: string[]): string {
  const len = min + Math.floor(Math.random() * (max - min + 1));
  return times(len, () => pick(chars)).join('');
}

function cap(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

// A structured single-row drill: single-key warm-ups, whole-hand blocks, cross-hand
// bigrams, then mixed groups — the "proper" asdf / jkl progression a tutor uses.
function rowDrill(left: string[], right: string[]): string {
  const all = [...left, ...right];
  const cells: string[] = [];
  for (const k of all) cells.push(k.repeat(3)); // aaa sss ddd ...
  const leftBlock = left.join('');
  const rightBlock = right.join('');
  cells.push(leftBlock, rightBlock, leftBlock, rightBlock); // asdfg hjkl; asdfg hjkl;
  cells.push([...left].reverse().join(''), [...right].reverse().join('')); // gfdsa ;lkjh
  for (let i = 0; i < Math.min(left.length, right.length); i++) {
    cells.push(right[i]! + left[i]!); // ha js kd lf ;g — cross-hand rhythm
  }
  for (let i = 0; i < 12; i++) cells.push(group(4, 4, all));
  return cells.join(' ');
}

// Whole-keyboard ladder drill: walks each finger column top→bottom (qaz wsx …),
// then mixes every letter for reach practice across all three rows.
function allRowsDrill(): string {
  const all = 'asdfghjkl;qwertyuiopzxcvbnm,./'.split('');
  const cells: string[] = [];
  for (const col of FINGER_COLUMNS) cells.push(col, col);
  for (let i = 0; i < 20; i++) cells.push(group(3, 5, all));
  return cells.join(' ');
}


// Generate a practice passage for the given drill kind.
// `isMac` selects Cmd-based shortcuts on macOS and Ctrl/Win-based ones elsewhere.
export function generateDrill(kind: PracticeKind, isMac = false): string {
  switch (kind) {
    case PracticeKind.Words:
      return times(45, () => pick(WORDS)).join(' ');
    case PracticeKind.Capitals:
      return times(30, () => {
        const w = pick(WORDS);
        const r = Math.random();
        if (r < 0.55) return cap(w); // Title Case — one Shift per word
        if (r < 0.85) return w.toUpperCase(); // ALL CAPS — sustained Shift reaches
        return cap(w) + cap(pick(WORDS)); // CamelCase — mid-word Shift
      }).join(' ');
    case PracticeKind.Numbers:
      return times(40, () => String(Math.floor(Math.random() * 100000))).join(' ');
    case PracticeKind.Symbols:
      return times(45, () => group(3, 5, SYMBOLS)).join(' ');
    case PracticeKind.Punctuation:
      return times(28, () => pick(WORDS) + pick(PUNCT)).join(' ');
    case PracticeKind.HomeRow:
      return rowDrill(HOME_LEFT, HOME_RIGHT);
    case PracticeKind.TopRow:
      return rowDrill(TOP_LEFT, TOP_RIGHT);
    case PracticeKind.BottomRow:
      return rowDrill(BOTTOM_LEFT, BOTTOM_RIGHT);
    case PracticeKind.AllRows:
      return allRowsDrill();
    case PracticeKind.Numpad:
      return times(24, () => {
        const r = Math.random();
        if (r < 0.5) return `${group(1, 4, DIGITS)}${pick(NUM_OPS)}${group(1, 3, DIGITS)}`;
        if (r < 0.75) return `${group(1, 3, DIGITS)}.${group(1, 2, DIGITS)}`; // decimals
        return group(3, 6, DIGITS); // long digit runs
      }).join(' ');

    case PracticeKind.Shortcuts:
      return times(24, () => pick(isMac ? MAC_SHORTCUTS : WIN_SHORTCUTS)).join(' ');
    case PracticeKind.Sentences:
      return times(5, () => pick(SENTENCES)).join(' ');
    case PracticeKind.Bigrams:
      // Each pair three times, then inside a nonsense word, so the motion is
      // learnt and then used cold.
      return shuffle(
        HARD_BIGRAMS.flatMap((pair) => [pair.repeat(3), `${group(1, 2, HOME_ROW)}${pair}${group(1, 2, HOME_ROW)}`]),
      )
        .slice(0, 40)
        .join(' ');
    case PracticeKind.Alternating:
      return times(40, () => pick(ALTERNATING_WORDS)).join(' ');
    case PracticeKind.SameFinger:
      return shuffle(SAME_FINGER.flatMap((seq) => [seq, seq.repeat(2)]))
        .slice(0, 40)
        .join(' ');
    case PracticeKind.LongWords:
      return times(24, () => pick(LONG_WORDS)).join(' ');
    case PracticeKind.Mixed:
      // Words, figures, punctuation and symbols in one stream — closest to the
      // mixed content a real exam passage throws at you.
      return times(36, () => {
        const r = Math.random();
        if (r < 0.4) return pick(WORDS);
        if (r < 0.55) return cap(pick(WORDS));
        if (r < 0.7) return String(Math.floor(Math.random() * 10000));
        if (r < 0.82) return pick(WORDS) + pick(PUNCT);
        if (r < 0.92) return pick(LONG_WORDS);
        return group(2, 3, SYMBOLS);
      }).join(' ');
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

// Build a drill that emphasizes the user's weak keys and most-missed words.
export function generateWeaknessDrill(keys: string[], words: string[]): string {
  const tokens: string[] = [];
  for (const w of words.slice(0, 8)) tokens.push(w, w);
  const pool = keys.length ? keys : HOME_ROW;
  for (let i = 0; i < 26; i++) tokens.push(group(3, 5, pool));
  return shuffle(tokens).join(' ');
}

/**
 * A rhythm drill for the transitions that cost the most time. Each slow pair is
 * repeated as its own burst, then buried inside mixed groups so the hand has to
 * find it cold — the same progression a tutor uses for a sticky bigram.
 */
export function generateSpeedDrill(pairs: string[], keys: string[]): string {
  const tokens: string[] = [];
  for (const pair of pairs.slice(0, 10)) {
    tokens.push(pair.repeat(3), pair.repeat(2), pair);
  }
  const pool = keys.length ? keys : HOME_ROW;
  for (const pair of pairs.slice(0, 10)) {
    tokens.push(`${group(1, 2, pool)}${pair}${group(1, 2, pool)}`);
  }
  for (let i = 0; i < 16; i++) tokens.push(group(3, 5, pool));
  return shuffle(tokens).join(' ');
}
