import { Lang, PracticeKind } from '../constants';
import { generateDrillFor } from '../practice/generators';
import { isDevanagari } from '../text/scripts';
import type { Keymap } from '../text/keymap';

export enum SkillLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  [SkillLevel.Beginner]: 'Beginner',
  [SkillLevel.Intermediate]: 'Intermediate',
  [SkillLevel.Advanced]: 'Advanced',
};

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: SkillLevel;
  kind: PracticeKind;
  targetWpm: number;
  targetAccuracy: number;
  /**
   * The script this lesson teaches. A ladder is per language because the skill
   * is: nothing about anchoring a-s-d-f transfers to a Remington keyboard, and
   * nothing about matras exists on a Roman one.
   */
  lang: Lang;
}

// Ordered curriculum — lessons unlock sequentially as earlier ones are completed.
export const LESSONS: Lesson[] = [
  { id: 'b1', title: 'Home row', description: 'Anchor a-s-d-f / j-k-l-;', level: SkillLevel.Beginner, kind: PracticeKind.HomeRow, targetWpm: 15, targetAccuracy: 90, lang: Lang.En },
  { id: 'b2', title: 'Home row speed', description: 'Same keys, a little faster', level: SkillLevel.Beginner, kind: PracticeKind.HomeRow, targetWpm: 22, targetAccuracy: 92, lang: Lang.En },
  { id: 'b3', title: 'Top row', description: 'Reach up to q-w-e-r-t / y-u-i-o-p', level: SkillLevel.Beginner, kind: PracticeKind.TopRow, targetWpm: 18, targetAccuracy: 90, lang: Lang.En },
  { id: 'b4', title: 'Bottom row', description: 'Reach down to z-x-c-v-b / n-m', level: SkillLevel.Beginner, kind: PracticeKind.BottomRow, targetWpm: 18, targetAccuracy: 90, lang: Lang.En },
  { id: 'b5', title: 'All rows', description: 'Finger ladders across the board', level: SkillLevel.Beginner, kind: PracticeKind.AllRows, targetWpm: 20, targetAccuracy: 90, lang: Lang.En },
  { id: 'b6', title: 'Common words', description: 'Frequent short words', level: SkillLevel.Beginner, kind: PracticeKind.Words, targetWpm: 22, targetAccuracy: 92, lang: Lang.En },
  { id: 'b7', title: 'Capital letters', description: 'Shift + letter reaches', level: SkillLevel.Beginner, kind: PracticeKind.Capitals, targetWpm: 22, targetAccuracy: 92, lang: Lang.En },

  { id: 'i1', title: 'Word flow', description: 'Longer word runs', level: SkillLevel.Intermediate, kind: PracticeKind.Words, targetWpm: 35, targetAccuracy: 94, lang: Lang.En },
  { id: 'i2', title: 'Shift mastery', description: 'Title, ALL CAPS and CamelCase', level: SkillLevel.Intermediate, kind: PracticeKind.Capitals, targetWpm: 30, targetAccuracy: 93, lang: Lang.En },
  { id: 'i3', title: 'Punctuation', description: 'Commas, periods, and marks', level: SkillLevel.Intermediate, kind: PracticeKind.Punctuation, targetWpm: 30, targetAccuracy: 93, lang: Lang.En },
  { id: 'i4', title: 'Numbers', description: 'Number-row accuracy', level: SkillLevel.Intermediate, kind: PracticeKind.Numbers, targetWpm: 26, targetAccuracy: 93, lang: Lang.En },
  { id: 'i5', title: 'Numpad basics', description: 'Digits and + - * / operators', level: SkillLevel.Intermediate, kind: PracticeKind.Numpad, targetWpm: 26, targetAccuracy: 92, lang: Lang.En },
  { id: 'i6', title: 'Sentences', description: 'Real sentence rhythm', level: SkillLevel.Intermediate, kind: PracticeKind.Sentences, targetWpm: 34, targetAccuracy: 94, lang: Lang.En },
  { id: 'i7', title: 'Top row fluency', description: 'Upper reaches without looking down', level: SkillLevel.Intermediate, kind: PracticeKind.TopRow, targetWpm: 32, targetAccuracy: 94, lang: Lang.En },
  { id: 'i8', title: 'Bottom row fluency', description: 'The hardest reaches, at pace', level: SkillLevel.Intermediate, kind: PracticeKind.BottomRow, targetWpm: 30, targetAccuracy: 93, lang: Lang.En },
  { id: 'i9', title: 'Mixed case words', description: 'Shift mid-word without losing rhythm', level: SkillLevel.Intermediate, kind: PracticeKind.Capitals, targetWpm: 34, targetAccuracy: 94, lang: Lang.En },
  { id: 'i10', title: 'Figures in text', description: 'Numbers inside ordinary words', level: SkillLevel.Intermediate, kind: PracticeKind.Numbers, targetWpm: 30, targetAccuracy: 94, lang: Lang.En },
  { id: 'i11', title: 'Marks and pauses', description: 'Punctuation at sentence pace', level: SkillLevel.Intermediate, kind: PracticeKind.Punctuation, targetWpm: 34, targetAccuracy: 94, lang: Lang.En },
  { id: 'i12', title: 'Steady words', description: 'Longer runs, even rhythm', level: SkillLevel.Intermediate, kind: PracticeKind.Words, targetWpm: 40, targetAccuracy: 95, lang: Lang.En },

  { id: 'a1', title: 'Special characters', description: 'Symbols and punctuation', level: SkillLevel.Advanced, kind: PracticeKind.Symbols, targetWpm: 26, targetAccuracy: 92, lang: Lang.En },
  { id: 'a2', title: 'Numpad speed', description: 'Digits, decimals and operators', level: SkillLevel.Advanced, kind: PracticeKind.Numpad, targetWpm: 34, targetAccuracy: 94, lang: Lang.En },
  { id: 'a3', title: 'Shortcuts', description: 'Modifier + key combos', level: SkillLevel.Advanced, kind: PracticeKind.Shortcuts, targetWpm: 26, targetAccuracy: 92, lang: Lang.En },
  { id: 'a4', title: 'Full keyboard', description: 'Sustained all-row reaches', level: SkillLevel.Advanced, kind: PracticeKind.AllRows, targetWpm: 40, targetAccuracy: 95, lang: Lang.En },
  { id: 'a5', title: 'Fluent sentences', description: 'Sustained sentence speed', level: SkillLevel.Advanced, kind: PracticeKind.Sentences, targetWpm: 45, targetAccuracy: 95, lang: Lang.En },
  { id: 'a6', title: 'Symbol accuracy', description: 'Shifted symbols without a second look', level: SkillLevel.Advanced, kind: PracticeKind.Symbols, targetWpm: 32, targetAccuracy: 95, lang: Lang.En },
  { id: 'a7', title: 'Data entry', description: 'Numpad at working speed', level: SkillLevel.Advanced, kind: PracticeKind.Numpad, targetWpm: 42, targetAccuracy: 96, lang: Lang.En },
  { id: 'a8', title: 'Editor fluency', description: 'Shortcuts without breaking flow', level: SkillLevel.Advanced, kind: PracticeKind.Shortcuts, targetWpm: 32, targetAccuracy: 94, lang: Lang.En },
  { id: 'a9', title: 'Exam pace', description: 'Sentence speed at the SSC cut-off', level: SkillLevel.Advanced, kind: PracticeKind.Sentences, targetWpm: 50, targetAccuracy: 96, lang: Lang.En },
  { id: 'a10', title: 'Mixed content', description: 'Words, numbers and marks together', level: SkillLevel.Advanced, kind: PracticeKind.Punctuation, targetWpm: 42, targetAccuracy: 95, lang: Lang.En },
  { id: 'a11', title: 'Whole keyboard, fast', description: 'Every row, no hesitation', level: SkillLevel.Advanced, kind: PracticeKind.AllRows, targetWpm: 48, targetAccuracy: 96, lang: Lang.En },
  { id: 'a12', title: 'Court pace', description: '92% accuracy, the court-exam standard', level: SkillLevel.Advanced, kind: PracticeKind.Sentences, targetWpm: 55, targetAccuracy: 97, lang: Lang.En },
];

/**
 * The Devanagari ladder — Hindi and Marathi.
 *
 * Not the English one translated. It opens on the layout's own home row (which
 * differs between InScript and Remington, so the drill is generated from
 * whichever is selected), and the middle of it is the three things Hindi typing
 * is actually graded on: matras, half letters and the conjuncts.
 *
 * The targets sit below the English ladder's on purpose. That is not a lower
 * standard, it is the standard: SSC pairs 35 w.p.m. in English with 30 in
 * Hindi — 10,500 key depressions an hour against 9,000 — because a Hindi word
 * takes more keys to type. The advanced rungs are pinned to the cut-offs that
 * actually exist rather than to round numbers.
 */
export const HINDI_LESSONS: Lesson[] = [
  { id: 'hb1', title: 'होम पंक्ति', description: 'बीच की पंक्ति पर उँगलियाँ जमाएँ', level: SkillLevel.Beginner, kind: PracticeKind.HomeRow, targetWpm: 12, targetAccuracy: 90, lang: Lang.Hi },
  { id: 'hb2', title: 'होम पंक्ति — गति', description: 'वही कुंजियाँ, थोड़ा तेज़', level: SkillLevel.Beginner, kind: PracticeKind.HomeRow, targetWpm: 18, targetAccuracy: 92, lang: Lang.Hi },
  { id: 'hb3', title: 'स्वर', description: 'अ से औ तक, और वही ध्वनियाँ मात्रा में', level: SkillLevel.Beginner, kind: PracticeKind.Vowels, targetWpm: 14, targetAccuracy: 90, lang: Lang.Hi },
  { id: 'hb4', title: 'ऊपरी पंक्ति', description: 'ऊपर की ओर पहुँच', level: SkillLevel.Beginner, kind: PracticeKind.TopRow, targetWpm: 15, targetAccuracy: 90, lang: Lang.Hi },
  { id: 'hb5', title: 'निचली पंक्ति', description: 'नीचे की ओर पहुँच', level: SkillLevel.Beginner, kind: PracticeKind.BottomRow, targetWpm: 15, targetAccuracy: 90, lang: Lang.Hi },
  { id: 'hb6', title: 'सभी पंक्तियाँ', description: 'पूरे कुंजीपटल पर उँगलियों की सीढ़ी', level: SkillLevel.Beginner, kind: PracticeKind.AllRows, targetWpm: 18, targetAccuracy: 90, lang: Lang.Hi },
  { id: 'hb7', title: 'मात्राएँ', description: 'हर मात्रा, बदलते व्यंजनों पर', level: SkillLevel.Beginner, kind: PracticeKind.Matras, targetWpm: 16, targetAccuracy: 90, lang: Lang.Hi },
  { id: 'hb8', title: 'सामान्य शब्द', description: 'रोज़ काम आने वाले छोटे शब्द', level: SkillLevel.Beginner, kind: PracticeKind.Words, targetWpm: 20, targetAccuracy: 92, lang: Lang.Hi },

  { id: 'hm1', title: 'शब्द प्रवाह', description: 'लंबी शब्द-श्रृंखलाएँ', level: SkillLevel.Intermediate, kind: PracticeKind.Words, targetWpm: 26, targetAccuracy: 93, lang: Lang.Hi },
  { id: 'hm2', title: 'मात्रा अभ्यास', description: 'मात्राएँ असली शब्दों के भीतर', level: SkillLevel.Intermediate, kind: PracticeKind.Matras, targetWpm: 24, targetAccuracy: 93, lang: Lang.Hi },
  { id: 'hm3', title: 'आधे अक्षर', description: 'व्यंजन, हलंत, व्यंजन — एक आकृति', level: SkillLevel.Intermediate, kind: PracticeKind.HalfLetters, targetWpm: 22, targetAccuracy: 92, lang: Lang.Hi },
  { id: 'hm4', title: 'विराम चिह्न', description: 'पूर्ण विराम, अल्प विराम और प्रश्न चिह्न', level: SkillLevel.Intermediate, kind: PracticeKind.Punctuation, targetWpm: 24, targetAccuracy: 93, lang: Lang.Hi },
  { id: 'hm5', title: 'देवनागरी अंक', description: '० से ९ तक, अंक पंक्ति पर', level: SkillLevel.Intermediate, kind: PracticeKind.Numbers, targetWpm: 22, targetAccuracy: 93, lang: Lang.Hi },
  { id: 'hm6', title: 'वाक्य', description: 'असली वाक्यों की लय', level: SkillLevel.Intermediate, kind: PracticeKind.Sentences, targetWpm: 26, targetAccuracy: 94, lang: Lang.Hi },
  { id: 'hm7', title: 'ऊपरी पंक्ति — प्रवाह', description: 'देखे बिना ऊपर की पहुँच', level: SkillLevel.Intermediate, kind: PracticeKind.TopRow, targetWpm: 24, targetAccuracy: 93, lang: Lang.Hi },
  { id: 'hm8', title: 'निचली पंक्ति — प्रवाह', description: 'सबसे कठिन पहुँच, गति के साथ', level: SkillLevel.Intermediate, kind: PracticeKind.BottomRow, targetWpm: 24, targetAccuracy: 93, lang: Lang.Hi },
  { id: 'hm9', title: 'संयुक्ताक्षर', description: 'क्ष, त्र, ज्ञ, श्र और उनके साथी', level: SkillLevel.Intermediate, kind: PracticeKind.Conjuncts, targetWpm: 22, targetAccuracy: 92, lang: Lang.Hi },
  { id: 'hm10', title: 'लंबे शब्द', description: 'कार्यालयी भाषा के लंबे शब्द', level: SkillLevel.Intermediate, kind: PracticeKind.LongWords, targetWpm: 26, targetAccuracy: 94, lang: Lang.Hi },

  { id: 'ha1', title: 'आधे अक्षर — गति', description: 'रुके बिना आधे अक्षर', level: SkillLevel.Advanced, kind: PracticeKind.HalfLetters, targetWpm: 28, targetAccuracy: 94, lang: Lang.Hi },
  { id: 'ha2', title: 'संयुक्ताक्षर — गति', description: 'कठिन समूह, पूरी गति पर', level: SkillLevel.Advanced, kind: PracticeKind.Conjuncts, targetWpm: 28, targetAccuracy: 94, lang: Lang.Hi },
  { id: 'ha3', title: 'सम्पूर्ण कुंजीपटल', description: 'हर पंक्ति, बिना झिझक', level: SkillLevel.Advanced, kind: PracticeKind.AllRows, targetWpm: 30, targetAccuracy: 95, lang: Lang.Hi },
  { id: 'ha4', title: 'वाक्य प्रवाह', description: 'लगातार वाक्य गति', level: SkillLevel.Advanced, kind: PracticeKind.Sentences, targetWpm: 32, targetAccuracy: 95, lang: Lang.Hi },
  { id: 'ha5', title: 'लंबे शब्द — गति', description: 'लंबे शब्द, समान लय', level: SkillLevel.Advanced, kind: PracticeKind.LongWords, targetWpm: 30, targetAccuracy: 95, lang: Lang.Hi },
  { id: 'ha6', title: 'कठिन जोड़े', description: 'जो जोड़े सबसे ज़्यादा समय लेते हैं', level: SkillLevel.Advanced, kind: PracticeKind.Bigrams, targetWpm: 28, targetAccuracy: 94, lang: Lang.Hi },
  { id: 'ha7', title: 'मिश्रित सामग्री', description: 'शब्द, अंक और चिह्न एक साथ', level: SkillLevel.Advanced, kind: PracticeKind.Mixed, targetWpm: 30, targetAccuracy: 94, lang: Lang.Hi },
  { id: 'ha8', title: 'एसएससी गति', description: 'हिंदी टंकण की ३० श.प्र.मि. कट-ऑफ', level: SkillLevel.Advanced, kind: PracticeKind.Sentences, targetWpm: 30, targetAccuracy: 95, lang: Lang.Hi },
  { id: 'ha9', title: 'न्यायालय गति', description: 'न्यायालय परीक्षाओं का स्तर', level: SkillLevel.Advanced, kind: PracticeKind.Sentences, targetWpm: 35, targetAccuracy: 96, lang: Lang.Hi },
  { id: 'ha10', title: 'विशेषज्ञ गति', description: 'कट-ऑफ से आगे, सुरक्षित अंतर के लिए', level: SkillLevel.Advanced, kind: PracticeKind.Sentences, targetWpm: 40, targetAccuracy: 96, lang: Lang.Hi },
];

/**
 * The ladder to show for a language. Devanagari languages share one: Hindi and
 * Marathi are typed on the same layouts, with the same matras and conjuncts.
 */
export function lessonsFor(lang: Lang): Lesson[] {
  return isDevanagari(lang) ? HINDI_LESSONS : LESSONS;
}

/** Both ladders — what an id lookup has to search, since ids are global. */
export const ALL_LESSONS: Lesson[] = [...LESSONS, ...HINDI_LESSONS];

export function findLesson(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

/**
 * The passage for one lesson.
 *
 * `keymap` matters for the row lessons and only for them: a Devanagari home row
 * is whatever the selected layout puts there, so the drill is built from the
 * typist's own keys rather than from an assumed layout.
 */
export function lessonPassage(
  lesson: Lesson,
  { isMac = false, keymap = null }: { isMac?: boolean; keymap?: Keymap | null } = {},
): string {
  return generateDrillFor(lesson.lang, lesson.kind, { isMac, keymap });
}

// A lesson is passed when the run meets both its speed and accuracy targets.
export function lessonPassed(lesson: Lesson, netWpm: number, accuracy: number): boolean {
  return netWpm >= lesson.targetWpm && accuracy >= lesson.targetAccuracy;
}
