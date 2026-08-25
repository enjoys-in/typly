import { create } from 'zustand';
import type { Repository } from '@/platform/ports';
import {
  Difficulty,
  EXAM_ZOOM_DEFAULT,
  EXAM_ZOOM_MAX,
  EXAM_ZOOM_MIN,
  ExamBoard,
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
  /** Font applied to Hindi passages (Mangal/Kruti Dev/custom upload). */
  hindiFont: HindiFont;
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
  // Clamped here so callers can pass raw step arithmetic.
  setExamZoom: (examZoom) =>
    set({ examZoom: Math.min(EXAM_ZOOM_MAX, Math.max(EXAM_ZOOM_MIN, examZoom)) }),
}));

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
