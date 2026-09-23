import { describe, expect, test } from 'bun:test';
import { InputMethod, Lang, PracticeKind } from '../constants';
import { keymapFor } from '../text/keymaps';
import {
  ALL_LESSONS,
  HINDI_LESSONS,
  LESSONS,
  SkillLevel,
  findLesson,
  lessonPassage,
  lessonPassed,
  lessonsFor,
} from './curriculum';

const INSCRIPT = keymapFor(InputMethod.InScript, Lang.Hi);
const ROMAN_LETTER = /[A-Za-z]/u;
const DEVANAGARI = /[ऀ-ॿ]/u;
const LEVELS = Object.values(SkillLevel);

describe('the two ladders', () => {
  test('a language gets the ladder for its own script', () => {
    expect(lessonsFor(Lang.En)).toBe(LESSONS);
    expect(lessonsFor(Lang.Hi)).toBe(HINDI_LESSONS);
    // Marathi is typed on the same layouts, with the same matras and conjuncts.
    expect(lessonsFor(Lang.Mr)).toBe(HINDI_LESSONS);
  });

  test('a script with no ladder of its own falls back rather than showing none', () => {
    expect(lessonsFor(Lang.Ta)).toBe(LESSONS);
  });

  test('every id is unique across both ladders, because progress is keyed on it', () => {
    const ids = ALL_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('an id from either ladder resolves, so a finished run can be credited', () => {
    for (const lesson of ALL_LESSONS) expect(findLesson(lesson.id)?.id).toBe(lesson.id);
    expect(findLesson('nope')).toBeUndefined();
  });

  test('each ladder covers all three levels', () => {
    for (const ladder of [LESSONS, HINDI_LESSONS]) {
      for (const level of LEVELS) {
        expect(ladder.some((l) => l.level === level)).toBe(true);
      }
    }
  });

  test('each ladder is ordered by level, since lessons unlock in sequence', () => {
    for (const ladder of [LESSONS, HINDI_LESSONS]) {
      const order = ladder.map((l) => LEVELS.indexOf(l.level));
      expect([...order].sort((a, b) => a - b)).toEqual(order);
    }
  });

  test('every lesson is tagged with the language it teaches', () => {
    expect(LESSONS.every((l) => l.lang === Lang.En)).toBe(true);
    expect(HINDI_LESSONS.every((l) => l.lang === Lang.Hi)).toBe(true);
  });
});

describe('the Devanagari ladder', () => {
  test('it teaches what the papers grade: matras, half letters, conjuncts', () => {
    const kinds = new Set(HINDI_LESSONS.map((l) => l.kind));
    expect(kinds.has(PracticeKind.Matras)).toBe(true);
    expect(kinds.has(PracticeKind.HalfLetters)).toBe(true);
    expect(kinds.has(PracticeKind.Conjuncts)).toBe(true);
  });

  test('it never asks for capitals, which Devanagari does not have', () => {
    expect(HINDI_LESSONS.some((l) => l.kind === PracticeKind.Capitals)).toBe(false);
  });

  test('its titles are in Devanagari', () => {
    for (const lesson of HINDI_LESSONS) {
      expect(lesson.title).toMatch(DEVANAGARI);
      expect(ROMAN_LETTER.test(lesson.title)).toBe(false);
    }
  });

  test('its targets stay under the English ladder, as the real cut-offs do', () => {
    // SSC pairs 35 w.p.m. in English with 30 in Hindi, because a Hindi word
    // costs more keystrokes. A ladder that demanded the same numbers would be
    // holding Hindi candidates to a bar their own exam does not set.
    for (const level of LEVELS) {
      const top = (rows: typeof LESSONS) =>
        Math.max(...rows.filter((l) => l.level === level).map((l) => l.targetWpm));
      expect(top(HINDI_LESSONS)).toBeLessThanOrEqual(top(LESSONS));
    }
  });

  test('every target is a real pass mark, not a placeholder', () => {
    for (const lesson of ALL_LESSONS) {
      expect(lesson.targetWpm).toBeGreaterThan(0);
      expect(lesson.targetAccuracy).toBeGreaterThanOrEqual(90);
      expect(lesson.targetAccuracy).toBeLessThanOrEqual(100);
    }
  });
});

describe('lessonPassage', () => {
  test('every lesson in both ladders produces a passage in its own script', () => {
    for (const lesson of ALL_LESSONS) {
      const text = lessonPassage(lesson, { isMac: false, keymap: INSCRIPT });
      expect(text.length).toBeGreaterThan(20);
      if (lesson.lang === Lang.Hi) {
        expect(text).toMatch(DEVANAGARI);
        expect(ROMAN_LETTER.test(text)).toBe(false);
      }
    }
  });

  test('a Devanagari lesson still has something to type with no layout selected', () => {
    for (const lesson of HINDI_LESSONS) {
      const text = lessonPassage(lesson, { keymap: null });
      expect(text.length).toBeGreaterThan(20);
      expect(ROMAN_LETTER.test(text)).toBe(false);
    }
  });
});

describe('lessonPassed', () => {
  const lesson = HINDI_LESSONS[0]!;

  test('both targets have to be met', () => {
    expect(lessonPassed(lesson, lesson.targetWpm, lesson.targetAccuracy)).toBe(true);
    expect(lessonPassed(lesson, lesson.targetWpm - 1, lesson.targetAccuracy)).toBe(false);
    expect(lessonPassed(lesson, lesson.targetWpm, lesson.targetAccuracy - 1)).toBe(false);
  });
});
