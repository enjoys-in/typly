import { create } from 'zustand';
import type { Repository } from '@/platform/ports';
import type { SeriesBase } from '@/core/types';
import {
  Difficulty,
  EXAM_ZOOM_DEFAULT,
  EXAM_ZOOM_MAX,
  EXAM_ZOOM_MIN,
  ExamBoard,
  MAX_READING_SEC,
  ExamMode,
  HindiFont,
  InputMethod,
  Lang,
  TimingMode,
} from '@/core/constants';

interface SettingsState {
  lang: Lang;
  board: ExamBoard;
  timing: TimingMode;
  durationSec: number;
  difficulty: Difficulty;
  backspaceEnabled: boolean;
  spaceEnabled: boolean;
  enterEnabled: boolean;
  examLock: boolean;
  notify: boolean;
  sound: boolean;
  showKeyboard: boolean;
  /** When the keyboard is hidden, show just the key that was pressed. */
  showKeys: boolean;
  /** Text scale for the passage and typing input. */
  examZoom: number;
  /** Live metrics panel beside/below the passage. */
  showStats: boolean;
  /** Icon-only sidebar, to give the content area the width. */
  sidebarCollapsed: boolean;
  /** Target number of tests to complete each day. */
  dailyGoal: number;
  /** Daily practice reminder while the app is open. */
  reminderEnabled: boolean;
  /** Local time (HH:MM) to fire the daily reminder. */
  reminderTime: string;
  /** Exam mode (standard, blind, error-free, accuracy, speed). */
  examMode: ExamMode;
  /** Input method (QWERTY, or Hindi phonetic transliteration). */
  inputMethod: InputMethod;
  /** Font applied to Devanagari passages (Mangal/Kruti Dev/custom upload). */
  hindiFont: HindiFont;
  /** Mock exam: show the rules briefing before the passage. */
  briefing: boolean;
  /** Mock exam: seconds to read the passage before the clock starts. */
  readingSec: number;
  /** Exam-day mode: no app furniture, no notifications, no pausing. */
  examDay: boolean;
  setLang: (lang: Lang) => void;
  setBoard: (board: ExamBoard) => void;
  setTiming: (timing: TimingMode) => void;
  setDurationSec: (durationSec: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setBackspaceEnabled: (v: boolean) => void;
  setSpaceEnabled: (v: boolean) => void;
  setEnterEnabled: (v: boolean) => void;
  setExamLock: (v: boolean) => void;
  setNotify: (v: boolean) => void;
  setSound: (v: boolean) => void;
  setShowKeyboard: (v: boolean) => void;
  setShowKeys: (v: boolean) => void;
  setExamZoom: (v: number) => void;
  setShowStats: (v: boolean) => void;
  setDailyGoal: (v: number) => void;
  setReminderEnabled: (v: boolean) => void;
  setReminderTime: (v: string) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setExamMode: (v: ExamMode) => void;
  setInputMethod: (v: InputMethod) => void;
  setHindiFont: (v: HindiFont) => void;
  setBriefing: (v: boolean) => void;
  setReadingSec: (v: number) => void;
  setExamDay: (v: boolean) => void;
}

/** The persisted slice — every field above except the setters. */
type Persisted = Omit<SettingsState, `set${string}`>;

const DEFAULTS: Persisted = {
  lang: Lang.En,
  board: ExamBoard.SscChsl,
  timing: TimingMode.Countdown,
  durationSec: 10 * 60,
  difficulty: Difficulty.Normal,
  backspaceEnabled: true,
  spaceEnabled: true,
  enterEnabled: true,
  examLock: false,
  notify: true,
  sound: false,
  showKeyboard: true,
  showKeys: true,
  examZoom: EXAM_ZOOM_DEFAULT,
  showStats: true,
  sidebarCollapsed: false,
  dailyGoal: 3,
  reminderEnabled: false,
  reminderTime: '19:00',
  examMode: ExamMode.Standard,
  inputMethod: InputMethod.Qwerty,
  hindiFont: HindiFont.System,
  briefing: false,
  readingSec: 0,
  examDay: false,
};

// Single row in the Dexie `settings` table, so preferences live in IndexedDB
// alongside documents and results (and travel with export/import backups)
// rather than in localStorage.
const STORE_KEY = 'userSettings';

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULTS,
  setLang: (lang) => set({ lang }),
  setBoard: (board) => set({ board }),
  setTiming: (timing) => set({ timing }),
  setDurationSec: (durationSec) => set({ durationSec }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setBackspaceEnabled: (backspaceEnabled) => set({ backspaceEnabled }),
  setSpaceEnabled: (spaceEnabled) => set({ spaceEnabled }),
  setEnterEnabled: (enterEnabled) => set({ enterEnabled }),
  setExamLock: (examLock) => set({ examLock }),
  setNotify: (notify) => set({ notify }),
  setSound: (sound) => set({ sound }),
  setShowKeyboard: (showKeyboard) => set({ showKeyboard }),
  setShowKeys: (showKeys) => set({ showKeys }),
  setShowStats: (showStats) => set({ showStats }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setDailyGoal: (dailyGoal) => set({ dailyGoal }),
  setReminderEnabled: (reminderEnabled) => set({ reminderEnabled }),
  setReminderTime: (reminderTime) => set({ reminderTime }),
  setExamMode: (examMode) => set({ examMode }),
  setInputMethod: (inputMethod) => set({ inputMethod }),
  setHindiFont: (hindiFont) => set({ hindiFont }),
  setBriefing: (briefing) => set({ briefing }),
  setExamDay: (examDay) => set({ examDay }),
  // Clamped here so callers can pass raw input.
  setReadingSec: (readingSec) =>
    set({ readingSec: Math.min(MAX_READING_SEC, Math.max(0, Math.round(readingSec) || 0)) }),
  setExamZoom: (examZoom) =>
    set({ examZoom: Math.min(EXAM_ZOOM_MAX, Math.max(EXAM_ZOOM_MIN, examZoom)) }),
}));

/**
 * The exam-settings half of an ExamConfig. Every entry point (setup, series,
 * drills) builds a run from this, so the mapping lives here once instead of
 * being retyped at each call site.
 */
export function examBase(s: SettingsState): SeriesBase {
  return {
    lang: s.lang,
    board: s.board,
    timing: s.timing,
    durationSec: s.durationSec,
    difficulty: s.difficulty,
    examMode: s.examMode,
    backspaceEnabled: s.backspaceEnabled,
    spaceEnabled: s.spaceEnabled,
    enterEnabled: s.enterEnabled,
    examLock: s.examLock,
    briefing: s.briefing,
    readingSec: s.readingSec,
    examDay: s.examDay,
    // Turned on by the New Test page, never remembered as a preference.
    paper: false,
    ghostTestId: null,
  };
}

/** Same, for generated drills — a practice drill is never a mock exam. */
export function drillBase(s: SettingsState): SeriesBase {
  return { ...examBase(s), briefing: false, readingSec: 0, examDay: false };
}

/**
 * Copies only keys that exist in DEFAULTS and match their type, so a stale or
 * hand-edited row cannot inject unknown fields or wrong types into the store.
 */
function sanitize(raw: unknown): Partial<Persisted> {
  if (typeof raw !== 'object' || raw === null) return {};
  const out: Record<string, unknown> = {};
  for (const [key, fallback] of Object.entries(DEFAULTS)) {
    const value = (raw as Record<string, unknown>)[key];
    if (value !== undefined && typeof value === typeof fallback) out[key] = value;
  }
  const zoom = out.examZoom;
  if (typeof zoom === 'number') {
    out.examZoom = Math.min(EXAM_ZOOM_MAX, Math.max(EXAM_ZOOM_MIN, zoom));
  }
  return out as Partial<Persisted>;
}

function snapshot(state: SettingsState): Persisted {
  const out = {} as Record<string, unknown>;
  for (const key of Object.keys(DEFAULTS)) out[key] = state[key as keyof SettingsState];
  return out as Persisted;
}

let persisting = false;

/**
 * Loads saved preferences from IndexedDB, then keeps writing them back on every
 * change. Call once at boot. Writes are only wired up after the read completes,
 * so hydration can never clobber a value the user just set.
 */
export async function hydrateSettings(repo: Repository): Promise<void> {
  if (persisting) return;
  try {
    const raw = await repo.getSetting(STORE_KEY);
    if (raw) useSettingsStore.setState(sanitize(JSON.parse(raw)));
  } catch {
    // Unreadable or corrupt row — carry on with defaults.
  }

  persisting = true;
  let queued: Persisted | null = null;
  let flushing = false;

  // Coalesce bursts (zoom stepping, toggling) into one write per tick.
  const flush = () => {
    flushing = false;
    const next = queued;
    queued = null;
    if (next) void repo.setSetting(STORE_KEY, JSON.stringify(next)).catch(() => {});
  };

  useSettingsStore.subscribe((state) => {
    queued = snapshot(state);
    if (flushing) return;
    flushing = true;
    queueMicrotask(flush);
  });
}
