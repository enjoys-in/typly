/**
 * Devanagari drill material.
 *
 * The English drills teach a QWERTY keyboard: home row, then reaches up and
 * down, then words. None of that transfers. A Hindi typist on InScript or
 * Remington is pressing different keys for different letters, and the things
 * that actually cost them marks are the ones English has no equivalent of — the
 * matra that follows a consonant, the half letter that fuses with the next one,
 * the four conjuncts every chart puts in a box of their own.
 *
 * So this is not the English word list translated. It is the syllabus a Hindi
 * typing tutor teaches, in the order they teach it, and the row drills are
 * generated from whichever layout the typist has selected rather than assumed.
 */

import { PracticeKind } from '../constants';
import type { Keymap } from '../text/keymap';

/** स्वर — the independent vowels, as they are printed on every chart. */
export const VOWELS = [
  'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः',
];

/**
 * मात्राएँ — the dependent vowel signs, which is where Hindi typing is won or
 * lost. Each is meaningless alone (it renders on a dotted circle), so every
 * drill below attaches them to a consonant, exactly as they are typed.
 */
export const MATRAS = ['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ', 'ं', 'ः', 'ँ'];

/** व्यंजन, grouped by वर्ग — the order the alphabet is recited and taught in. */
export const CONSONANT_GROUPS = [
  ['क', 'ख', 'ग', 'घ', 'ङ'],
  ['च', 'छ', 'ज', 'झ', 'ञ'],
  ['ट', 'ठ', 'ड', 'ढ', 'ण'],
  ['त', 'थ', 'द', 'ध', 'न'],
  ['प', 'फ', 'ब', 'भ', 'म'],
  ['य', 'र', 'ल', 'व'],
  ['श', 'ष', 'स', 'ह'],
  ['ड़', 'ढ़', 'क्ष', 'त्र', 'ज्ञ', 'श्र'],
];

export const CONSONANTS = CONSONANT_GROUPS.flat();

/**
 * आधे अक्षर — a consonant with its vowel cut off, fused onto the one after it.
 * Typed as consonant + halant + consonant, which is three keys for one shape,
 * and the single most common place a Hindi run loses accuracy.
 */
export const HALF_LETTERS = [
  'क्क', 'क्त', 'क्य', 'क्र', 'ग्र', 'ज्य', 'त्य', 'त्व', 'द्र', 'द्व',
  'न्त', 'न्द', 'न्ह', 'प्र', 'प्त', 'म्प', 'म्ह', 'ल्ल', 'व्य', 'श्व',
  'ष्ट', 'स्त', 'स्न', 'स्व', 'ह्य', 'ब्र', 'भ्र', 'ट्र', 'ध्य', 'च्च',
];

/** संयुक्ताक्षर — the clusters that get taught as characters in their own right. */
export const CONJUNCTS = [
  'क्ष', 'त्र', 'ज्ञ', 'श्र', 'द्ध', 'द्य', 'ह्म', 'ङ्ग', 'ञ्च', 'ण्ड',
  'न्द्र', 'ष्ट्र', 'स्त्र', 'त्त्व', 'द्भ', 'ब्ध', 'श्च', 'ह्न',
];

/** The commonest words in written Hindi — the flow drill's vocabulary. */
export const WORDS = [
  'और', 'है', 'में', 'को', 'से', 'का', 'की', 'के', 'एक', 'यह',
  'वह', 'हम', 'आप', 'नहीं', 'कर', 'हो', 'था', 'थी', 'थे', 'लिए',
  'साथ', 'बहुत', 'अब', 'तब', 'जब', 'क्या', 'कौन', 'कहाँ', 'कैसे', 'समय',
  'काम', 'लोग', 'देश', 'राज्य', 'दिन', 'रात', 'वर्ष', 'माह', 'गाँव', 'शहर',
  'पानी', 'जीवन', 'नियम', 'पत्र', 'सूचना', 'प्रश्न', 'उत्तर', 'विषय', 'भाषा', 'हिंदी',
];

/** The office and exam register: longer, and every one of them a real word. */
export const LONG_WORDS = [
  'अंतर्राष्ट्रीय', 'उत्तरदायित्व', 'विश्वविद्यालय', 'कार्यकर्ता', 'प्रशासनिक',
  'स्वतंत्रता', 'राष्ट्रपति', 'प्रतियोगिता', 'संवैधानिक', 'अधिसूचना',
  'पर्यावरण', 'प्रौद्योगिकी', 'सांस्कृतिक', 'महाविद्यालय', 'कर्मचारियों',
  'व्यवस्थापक', 'अधिकारियों', 'आवश्यकताओं', 'शुभकामनाएँ', 'उपर्युक्त',
];

/** Sentences in the register the papers are set in: office prose and GK. */
export const SENTENCES = [
  'भारत एक विशाल और विविधता से भरा देश है।',
  'शिक्षा ही किसी राष्ट्र की सबसे बड़ी पूँजी होती है।',
  'कार्यालय के सभी कर्मचारियों को समय पर उपस्थित होना चाहिए।',
  'इस पत्र की एक प्रति संबंधित अधिकारी को भेज दी जाए।',
  'परीक्षा में सफलता के लिए नियमित अभ्यास आवश्यक है।',
  'सरकार ने ग्रामीण क्षेत्रों के विकास के लिए नई योजना शुरू की है।',
  'स्वच्छ पर्यावरण हमारे स्वास्थ्य का आधार है।',
  'उपर्युक्त विषय पर आपका उत्तर शीघ्र अपेक्षित है।',
  'हिंदी टंकण की गति बढ़ाने के लिए मात्राओं का अभ्यास सबसे महत्वपूर्ण है।',
  'समिति की बैठक अगले सप्ताह सोमवार को आयोजित की जाएगी।',
];

/**
 * विराम चिह्न. The danda is the full stop of Devanagari and sits on its own
 * key; the rest are shared with the Roman set.
 */
export const PUNCT = ['।', ',', '?', ';', ':', '-'];

/**
 * देवनागरी अंक. Not the Arabic digits: with InScript or Remington active the
 * number row *produces* these, so a digit drill that asked for "2026" would be
 * asking for keys the layout does not have.
 */
export const DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/** Pairs that slow a Hindi typist down — a halant crossing between two keys. */
export const HARD_PAIRS = [
  'क्त', 'क्ष', 'त्र', 'ज्ञ', 'द्ध', 'ष्ट', 'स्त', 'न्त', 'प्र', 'श्र',
  'ह्य', 'द्व', 'ल्ल', 'ण्ड',
];

/** The physical rows, left and right hand, as a US keyboard lays them out. */
const ROWS = {
  [PracticeKind.HomeRow]: ['asdfg', 'hjkl;'],
  [PracticeKind.TopRow]: ['qwert', 'yuiop'],
  [PracticeKind.BottomRow]: ['zxcvb', 'nm,.'],
} as const;

/**
 * True for a mark that cannot stand alone — a matra, a halant, a nasal sign.
 *
 * Covers the Devanagari combining ranges: the signs above and below the line
 * (U+0900–U+0903), the dependent vowels and halant (U+093A–U+094D), the stress
 * and accent marks (U+0951–U+0957) and the two vocalic signs (U+0962–U+0963).
 */
export function isCombining(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  return (
    (c >= 0x0900 && c <= 0x0903) ||
    (c >= 0x093a && c <= 0x094d) ||
    (c >= 0x0951 && c <= 0x0957) ||
    (c >= 0x0962 && c <= 0x0963)
  );
}

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

function times<T>(n: number, make: () => T): T[] {
  return Array.from({ length: n }, make);
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** `min`..`max` items from `pool`, joined — a nonsense cluster to drill on. */
function group(min: number, max: number, pool: readonly string[]): string {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  return times(n, () => pick(pool)).join('');
}

/** A consonant with a matra on it: one syllable, two keys, and it renders. */
function syllable(bases: readonly string[], signs: readonly string[]): string {
  const base = pick(bases);
  return signs.length === 0 || Math.random() < 0.25 ? base : base + pick(signs);
}

/**
 * What a physical row produces on this layout, split into letters and marks.
 *
 * `resolve` is the same call the exam input makes for a keystroke, so what
 * comes back is exactly what the typist's own keyboard would put on screen —
 * which is the whole point of generating the row drill rather than shipping a
 * fixed one per layout.
 */
function rowOutputs(keymap: Keymap, keys: string): { bases: string[]; signs: string[] } {
  const bases: string[] = [];
  const signs: string[] = [];
  for (const key of keys) {
    const out = keymap.resolve(key, '');
    const text = out?.text;
    if (!text) continue;
    (isCombining(text[0]!) ? signs : bases).push(text);
  }
  return { bases, signs };
}

/**
 * A finger drill for one physical row, in the letters that row actually types.
 *
 * Hands are drilled apart before together, the way every tutor sequences it.
 * Where a row carries matras as well as consonants — InScript's home row has
 * five of each — the two are combined into syllables, because that is both how
 * the keys are pressed in practice and the only way the text renders as Hindi
 * rather than as a line of dotted circles.
 */
function rowDrill(keymap: Keymap, left: string, right: string): string {
  const l = rowOutputs(keymap, left);
  const r = rowOutputs(keymap, right);
  const both = { bases: [...l.bases, ...r.bases], signs: [...l.signs, ...r.signs] };
  // A layout may put no full letters on a row at all. Nothing can be built from
  // marks alone, so that hand's share falls back to the whole row's letters.
  const hand = (side: { bases: string[]; signs: string[] }) =>
    side.bases.length > 0 ? side : both;

  const tokens: string[] = [
    ...times(10, () => syllable(hand(l).bases, hand(l).signs)),
    ...times(10, () => syllable(hand(r).bases, hand(r).signs)),
    ...times(18, () =>
      times(2 + Math.floor(Math.random() * 2), () => syllable(both.bases, both.signs)).join(''),
    ),
  ];
  return tokens.join(' ');
}

/** Every row at once, for the drills that ask for the whole board. */
function allRowsDrill(keymap: Keymap): string {
  const all = { bases: [] as string[], signs: [] as string[] };
  for (const [left, right] of Object.values(ROWS)) {
    for (const keys of [left, right]) {
      const { bases, signs } = rowOutputs(keymap, keys);
      all.bases.push(...bases);
      all.signs.push(...signs);
    }
  }
  if (all.bases.length === 0) return alphabetDrill();
  return times(36, () =>
    times(2 + Math.floor(Math.random() * 3), () => syllable(all.bases, all.signs)).join(''),
  ).join(' ');
}

/**
 * The fallback when there is no layout to drill: the alphabet by वर्ग.
 *
 * Phonetic input has no fixed key per letter — the typist writes Roman and the
 * transliterator decides — so a "home row" means nothing there. Reciting the
 * consonant groups is what is left, and it is a real exercise in its own right.
 */
function alphabetDrill(): string {
  return shuffle(
    CONSONANT_GROUPS.flatMap((g) => [g.join(''), ...g.map((c) => c + pick(MATRAS))]),
  ).join(' ');
}

/**
 * A Devanagari drill passage.
 *
 * `keymap` is the layout in force — InScript, Remington, or null for phonetic
 * and plain QWERTY. Only the row drills need it; everything else is script
 * material, the same whichever way the keys are arranged.
 */
export function generateDevanagariDrill(kind: PracticeKind, keymap: Keymap | null): string {
  switch (kind) {
    case PracticeKind.HomeRow:
    case PracticeKind.TopRow:
    case PracticeKind.BottomRow: {
      const [left, right] = ROWS[kind];
      return keymap ? rowDrill(keymap, left, right) : alphabetDrill();
    }
    case PracticeKind.AllRows:
      return keymap ? allRowsDrill(keymap) : alphabetDrill();

    case PracticeKind.Matras:
      // Each matra against a rotating consonant, then inside a real word, so
      // the shape is learnt and then met where it actually occurs.
      return shuffle([
        ...MATRAS.flatMap((m) => [
          CONSONANTS.slice(0, 5).map((c) => c + m).join(''),
          pick(CONSONANTS) + m,
        ]),
        ...times(12, () => pick(WORDS)),
      ]).join(' ');

    case PracticeKind.HalfLetters:
      return shuffle([
        ...HALF_LETTERS.flatMap((h) => [h, h + pick(MATRAS)]),
        ...times(10, () => pick(WORDS)),
      ])
        .slice(0, 48)
        .join(' ');

    case PracticeKind.Conjuncts:
      return shuffle([
        ...CONJUNCTS.flatMap((c) => [c, c + pick(MATRAS)]),
        ...times(8, () => pick(LONG_WORDS)),
      ])
        .slice(0, 44)
        .join(' ');

    case PracticeKind.Vowels:
      return shuffle([
        ...VOWELS,
        ...VOWELS,
        ...times(14, () => pick(CONSONANTS) + pick(MATRAS)),
      ]).join(' ');

    case PracticeKind.Words:
      return times(45, () => pick(WORDS)).join(' ');
    case PracticeKind.LongWords:
      return times(22, () => pick(LONG_WORDS)).join(' ');
    case PracticeKind.Sentences:
      return times(5, () => pick(SENTENCES)).join(' ');
    case PracticeKind.Punctuation:
      return times(26, () => pick(WORDS) + pick(PUNCT)).join(' ');
    case PracticeKind.Numbers:
      return times(36, () => group(2, 5, DIGITS)).join(' ');
    case PracticeKind.Numpad:
      return times(24, () => `${group(1, 4, DIGITS)}${pick(['+', '-', '*', '/'])}${group(1, 3, DIGITS)}`).join(' ');
    case PracticeKind.Symbols:
      return times(40, () => group(2, 4, [...PUNCT, '%', '(', ')', '/'])).join(' ');
    case PracticeKind.Bigrams:
      return shuffle(
        HARD_PAIRS.flatMap((pair) => [pair.repeat(2), pair + pick(MATRAS), pick(WORDS)]),
      )
        .slice(0, 42)
        .join(' ');
    case PracticeKind.Mixed:
      return times(34, () => {
        const r = Math.random();
        if (r < 0.4) return pick(WORDS);
        if (r < 0.55) return pick(LONG_WORDS);
        if (r < 0.68) return group(2, 4, DIGITS);
        if (r < 0.8) return pick(WORDS) + pick(PUNCT);
        if (r < 0.9) return pick(CONJUNCTS) + pick(MATRAS);
        return pick(HALF_LETTERS);
      }).join(' ');

    // Devanagari has no letter case, and a shortcut is the same chord in every
    // script — both are left to the shared English drills, which is where the
    // Practice page sends them.
    case PracticeKind.Capitals:
    case PracticeKind.Shortcuts:
    case PracticeKind.Alternating:
    case PracticeKind.SameFinger:
    case PracticeKind.DataEntry:
      return times(40, () => pick(WORDS)).join(' ');

    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
