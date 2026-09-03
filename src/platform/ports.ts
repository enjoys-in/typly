import type {
  DocumentInput,
  DocumentRow,
  GrammarIssue,
  Keystroke,
  SaveTestPayload,
  TestResult,
  TestRow,
  Mistake,
} from '@/core/types';
import type { AiSettings, CoachFeedback, CoachInput } from '@/core/coach/types';
import type { Profile } from '@/core/profile/profile';
import type { Lang, SourceType } from '@/core/constants';
import type { ShellRoute, ShellStatus } from '@/core/ipc/shell';

export interface PickedFile {
  name: string;
  bytes: Uint8Array;
}

export interface FilePicker {
  pick(kind: SourceType): Promise<PickedFile | null>;
}

export interface PdfPage {
  text: string;
  scanned: boolean;
}

export interface PdfReader {
  extractText(bytes: Uint8Array): Promise<{ pages: PdfPage[] }>;
}

export interface OcrEngine {
  recognize(image: Blob | Uint8Array, lang: Lang, onProgress?: (p: number) => void): Promise<string>;
}

export interface FullResult {
  row: TestRow;
  result: TestResult;
  mistakes: Mistake[];
  keystrokes: Keystroke[];
}

export interface BackupBundle {
  app: string;
  version: number;
  exportedAt: string;
  counts: { tests: number; documents: number };
  tables: Record<string, unknown[]>;
}

export interface Repository {
  saveTest(payload: SaveTestPayload): Promise<number>;
  listHistory(): Promise<TestRow[]>;
  getResult(id: number): Promise<FullResult | null>;
  saveDocument(doc: DocumentInput): Promise<number>;
  listDocuments(): Promise<DocumentRow[]>;
  getDocument(id: number): Promise<DocumentRow | null>;
  /** Removes a paragraph; tests that used it keep their scores but lose the link. */
  deleteDocument(id: number): Promise<void>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  aggregateMistakes(): Promise<Mistake[]>;
  /** The keystroke log of one test, for replay and racing. Empty if not stored. */
  getKeystrokes(testId: number): Promise<Keystroke[]>;
  /** Keystrokes of the most recent `limit` tests, flattened for timing analysis. */
  recentKeystrokes(limit: number): Promise<Keystroke[]>;
  exportBackup(): Promise<BackupBundle>;
  importBackup(bundle: BackupBundle): Promise<void>;
}

export interface Cache {
  get<T>(key: string): Promise<T | null>;
  put<T>(key: string, value: T, ttlSec?: number): Promise<void>;
}

export interface Account {
  id: string;
  guest: boolean;
  plan?: string;
  /** Optional on the type so accounts stored before profiles existed stay valid. */
  name?: string;
  email?: string;
}

export interface Auth {
  current(): Promise<Account | null>;
  /** A name is asked for up front; the email is optional and unlocks extras. */
  continueAsGuest(profile: Profile): Promise<Account>;
  login(email: string, password: string): Promise<Account>;
  /** Merge changes into the stored account, e.g. from the Settings profile card. */
  updateProfile(patch: Partial<Profile>): Promise<Account | null>;
  logout(): Promise<void>;
}

export interface SpellChecker {
  ready(): Promise<boolean>;
  check(word: string): boolean;
  suggest(word: string): string[];
}

export interface GrammarChecker {
  available(): boolean;
  check(text: string, lang: Lang): Promise<GrammarIssue[]>;
  dispose(): void;
}

export interface AiCoach {
  available(): boolean;
  analyze(input: CoachInput, settings: AiSettings, signal?: AbortSignal): Promise<CoachFeedback>;
}

/** Where a permission request stands, so the UI can explain itself. */
export type NotificationPermission = 'unsupported' | 'default' | 'granted' | 'denied';

export interface Notifications {
  available(): boolean;
  /** Current state, without prompting. */
  permission(): NotificationPermission;
  ensurePermission(): Promise<boolean>;
  notify(title: string, body?: string): void;
}

export type SoundCue = 'key' | 'error' | 'complete';

export interface Sound {
  available(): boolean;
  play(cue: SoundCue): void;
  vibrate(pattern: number[]): void;
}

export interface Tts {
  available(): boolean;
  speak(text: string, lang?: Lang, onEnd?: () => void): void;
  stop(): void;
}

/** A file the OS handed to the app ("Open with Typly", or a launch argument). */
export interface OpenedFile {
  name: string;
  bytes: Uint8Array;
}

/**
 * The desktop shell around the app — system tray, dock/taskbar and file
 * associations. Every method is a no-op on the web, so callers never branch on
 * the platform.
 */
export interface Shell {
  /** True only where a real OS shell is wired up (the desktop build). */
  available(): boolean;
  /** A file that arrived before the UI was listening, consumed once. */
  takeOpenedFile(): Promise<OpenedFile | null>;
  /** Files opened while the app is already running. Returns an unsubscribe. */
  onOpenFile(handler: (file: OpenedFile) => void): () => void;
  /** Routes chosen from the tray, dock menu or jump list. */
  onNavigate(handler: (route: ShellRoute) => void): () => void;
  /** Publish what the tray menu, tooltip and dock badge should say. */
  setStatus(status: ShellStatus): void;
  /** 0..1 while a test runs, or null to clear the taskbar/dock progress bar. */
  setProgress(fraction: number | null): void;
}

export interface Platform {
  files: FilePicker;
  pdf: PdfReader;
  ocr: OcrEngine;
  repo: Repository;
  cache: Cache;
  auth: Auth;
  spell: SpellChecker;
  grammar: GrammarChecker;
  coach: AiCoach;
  notifications: Notifications;
  sound: Sound;
  tts: Tts;
  shell: Shell;
}
