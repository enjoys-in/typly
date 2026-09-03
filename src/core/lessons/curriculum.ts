import { PracticeKind } from '../constants';
import { generateDrill } from '../practice/generators';

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
}

// Ordered curriculum — lessons unlock sequentially as earlier ones are completed.
export const LESSONS: Lesson[] = [
  { id: 'b1', title: 'Home row', description: 'Anchor a-s-d-f / j-k-l-;', level: SkillLevel.Beginner, kind: PracticeKind.HomeRow, targetWpm: 15, targetAccuracy: 90 },
  { id: 'b2', title: 'Home row speed', description: 'Same keys, a little faster', level: SkillLevel.Beginner, kind: PracticeKind.HomeRow, targetWpm: 22, targetAccuracy: 92 },
  { id: 'b3', title: 'Top row', description: 'Reach up to q-w-e-r-t / y-u-i-o-p', level: SkillLevel.Beginner, kind: PracticeKind.TopRow, targetWpm: 18, targetAccuracy: 90 },
  { id: 'b4', title: 'Bottom row', description: 'Reach down to z-x-c-v-b / n-m', level: SkillLevel.Beginner, kind: PracticeKind.BottomRow, targetWpm: 18, targetAccuracy: 90 },
  { id: 'b5', title: 'All rows', description: 'Finger ladders across the board', level: SkillLevel.Beginner, kind: PracticeKind.AllRows, targetWpm: 20, targetAccuracy: 90 },
  { id: 'b6', title: 'Common words', description: 'Frequent short words', level: SkillLevel.Beginner, kind: PracticeKind.Words, targetWpm: 22, targetAccuracy: 92 },
  { id: 'b7', title: 'Capital letters', description: 'Shift + letter reaches', level: SkillLevel.Beginner, kind: PracticeKind.Capitals, targetWpm: 22, targetAccuracy: 92 },

  { id: 'i1', title: 'Word flow', description: 'Longer word runs', level: SkillLevel.Intermediate, kind: PracticeKind.Words, targetWpm: 35, targetAccuracy: 94 },
  { id: 'i2', title: 'Shift mastery', description: 'Title, ALL CAPS and CamelCase', level: SkillLevel.Intermediate, kind: PracticeKind.Capitals, targetWpm: 30, targetAccuracy: 93 },
  { id: 'i3', title: 'Punctuation', description: 'Commas, periods, and marks', level: SkillLevel.Intermediate, kind: PracticeKind.Punctuation, targetWpm: 30, targetAccuracy: 93 },
  { id: 'i4', title: 'Numbers', description: 'Number-row accuracy', level: SkillLevel.Intermediate, kind: PracticeKind.Numbers, targetWpm: 26, targetAccuracy: 93 },
  { id: 'i5', title: 'Numpad basics', description: 'Digits and + - * / operators', level: SkillLevel.Intermediate, kind: PracticeKind.Numpad, targetWpm: 26, targetAccuracy: 92 },
  { id: 'i6', title: 'Sentences', description: 'Real sentence rhythm', level: SkillLevel.Intermediate, kind: PracticeKind.Sentences, targetWpm: 34, targetAccuracy: 94 },
  { id: 'i7', title: 'Top row fluency', description: 'Upper reaches without looking down', level: SkillLevel.Intermediate, kind: PracticeKind.TopRow, targetWpm: 32, targetAccuracy: 94 },
  { id: 'i8', title: 'Bottom row fluency', description: 'The hardest reaches, at pace', level: SkillLevel.Intermediate, kind: PracticeKind.BottomRow, targetWpm: 30, targetAccuracy: 93 },
  { id: 'i9', title: 'Mixed case words', description: 'Shift mid-word without losing rhythm', level: SkillLevel.Intermediate, kind: PracticeKind.Capitals, targetWpm: 34, targetAccuracy: 94 },
  { id: 'i10', title: 'Figures in text', description: 'Numbers inside ordinary words', level: SkillLevel.Intermediate, kind: PracticeKind.Numbers, targetWpm: 30, targetAccuracy: 94 },
  { id: 'i11', title: 'Marks and pauses', description: 'Punctuation at sentence pace', level: SkillLevel.Intermediate, kind: PracticeKind.Punctuation, targetWpm: 34, targetAccuracy: 94 },
  { id: 'i12', title: 'Steady words', description: 'Longer runs, even rhythm', level: SkillLevel.Intermediate, kind: PracticeKind.Words, targetWpm: 40, targetAccuracy: 95 },

  { id: 'a1', title: 'Special characters', description: 'Symbols and punctuation', level: SkillLevel.Advanced, kind: PracticeKind.Symbols, targetWpm: 26, targetAccuracy: 92 },
  { id: 'a2', title: 'Numpad speed', description: 'Digits, decimals and operators', level: SkillLevel.Advanced, kind: PracticeKind.Numpad, targetWpm: 34, targetAccuracy: 94 },
  { id: 'a3', title: 'Shortcuts', description: 'Modifier + key combos', level: SkillLevel.Advanced, kind: PracticeKind.Shortcuts, targetWpm: 26, targetAccuracy: 92 },
  { id: 'a4', title: 'Full keyboard', description: 'Sustained all-row reaches', level: SkillLevel.Advanced, kind: PracticeKind.AllRows, targetWpm: 40, targetAccuracy: 95 },
  { id: 'a5', title: 'Fluent sentences', description: 'Sustained sentence speed', level: SkillLevel.Advanced, kind: PracticeKind.Sentences, targetWpm: 45, targetAccuracy: 95 },
  { id: 'a6', title: 'Symbol accuracy', description: 'Shifted symbols without a second look', level: SkillLevel.Advanced, kind: PracticeKind.Symbols, targetWpm: 32, targetAccuracy: 95 },
  { id: 'a7', title: 'Data entry', description: 'Numpad at working speed', level: SkillLevel.Advanced, kind: PracticeKind.Numpad, targetWpm: 42, targetAccuracy: 96 },
  { id: 'a8', title: 'Editor fluency', description: 'Shortcuts without breaking flow', level: SkillLevel.Advanced, kind: PracticeKind.Shortcuts, targetWpm: 32, targetAccuracy: 94 },
  { id: 'a9', title: 'Exam pace', description: 'Sentence speed at the SSC cut-off', level: SkillLevel.Advanced, kind: PracticeKind.Sentences, targetWpm: 50, targetAccuracy: 96 },
  { id: 'a10', title: 'Mixed content', description: 'Words, numbers and marks together', level: SkillLevel.Advanced, kind: PracticeKind.Punctuation, targetWpm: 42, targetAccuracy: 95 },
  { id: 'a11', title: 'Whole keyboard, fast', description: 'Every row, no hesitation', level: SkillLevel.Advanced, kind: PracticeKind.AllRows, targetWpm: 48, targetAccuracy: 96 },
  { id: 'a12', title: 'Court pace', description: '92% accuracy, the court-exam standard', level: SkillLevel.Advanced, kind: PracticeKind.Sentences, targetWpm: 55, targetAccuracy: 97 },
];

export function findLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function lessonPassage(lesson: Lesson, isMac = false): string {
  return generateDrill(lesson.kind, isMac);
}

// A lesson is passed when the run meets both its speed and accuracy targets.
export function lessonPassed(lesson: Lesson, netWpm: number, accuracy: number): boolean {
  return netWpm >= lesson.targetWpm && accuracy >= lesson.targetAccuracy;
}
