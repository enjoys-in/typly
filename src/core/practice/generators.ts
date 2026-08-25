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
  for (let i = tokens.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tokens[i], tokens[j]] = [tokens[j] as string, tokens[i] as string];
  }
  return tokens.join(' ');
}
