import { SETTING_KEY } from '../constants';
import { findLesson, SkillLevel } from './curriculum';

export const CUSTOM_LESSON_PREFIX = 'c-';

export interface CustomLesson {
  id: string;
  title: string;
  passage: string;
  level: SkillLevel;
  targetWpm: number;
  targetAccuracy: number;
  createdAt: string;
}

const KEY = SETTING_KEY.CustomLessons;

export async function loadCustomLessons(
  getSetting: (key: string) => Promise<string | null>,
): Promise<CustomLesson[]> {
  const raw = await getSetting(KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as CustomLesson[];
    if (!Array.isArray(list)) return [];
    // Lessons saved before categories existed default to Beginner.
    return list.map((l) => ({ ...l, level: l.level ?? SkillLevel.Beginner }));
  } catch {
    return [];
  }
}

export async function saveCustomLessons(
  setSetting: (key: string, value: string) => Promise<void>,
  list: CustomLesson[],
): Promise<void> {
  await setSetting(KEY, JSON.stringify(list));
}

export function newCustomLesson(input: {
  title: string;
  passage: string;
  level: SkillLevel;
  targetWpm: number;
  targetAccuracy: number;
}): CustomLesson {
  return {
    id: `${CUSTOM_LESSON_PREFIX}${Date.now().toString(36)}`,
    title: input.title,
    passage: input.passage,
    level: input.level,
    targetWpm: input.targetWpm,
    targetAccuracy: input.targetAccuracy,
    createdAt: new Date().toISOString(),
  };
}

// Resolve a run's lesson (curriculum or custom) to its completion targets.
export async function resolveLessonTargets(
  lessonId: string,
  getSetting: (key: string) => Promise<string | null>,
): Promise<{ id: string; targetWpm: number; targetAccuracy: number } | undefined> {
  const curated = findLesson(lessonId);
  if (curated) {
    return { id: curated.id, targetWpm: curated.targetWpm, targetAccuracy: curated.targetAccuracy };
  }
  if (lessonId.startsWith(CUSTOM_LESSON_PREFIX)) {
    const custom = (await loadCustomLessons(getSetting)).find((l) => l.id === lessonId);
    if (custom) {
      return { id: custom.id, targetWpm: custom.targetWpm, targetAccuracy: custom.targetAccuracy };
    }
  }
  return undefined;
}
