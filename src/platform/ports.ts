import type {
  BackupBundle,
  DocumentInput,
  DocumentRow,
  GrammarIssue,
  Keystroke,
  SaveTestPayload,
  TestResult,
  TestRow,
  TimelinePoint,
  Mistake,
} from '@/core/types';

// Re-exported so the many callers that import it from here keep working.
export type { BackupBundle };
import type { AiSettings, CoachFeedback, CoachInput } from '@/core/coach/types';
import type { Profile } from '@/core/profile/profile';
import type { Lang, SourceType } from '@/core/constants';
import type { ShellRoute, ShellStatus } from '@/core/ipc/shell';
import type { SyncState } from '@/core/sync/lan';

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

/**
 * One past attempt, without its keystroke log.
 *
 * The longitudinal readings — a 30-day key heatmap and a fatigue curve — need
 * many attempts at once, and the keystroke log is by far the largest thing a
 * test stores. Shipping sixty of them across the desktop IPC boundary to draw
 * two charts would move tens of megabytes for data already summarised: the
 * mistakes give the heatmap its keys, and the stored per-minute timeline is
 * exactly what the fatigue curve plots.
 */
export interface TestSummary {
  row: TestRow;
  mistakes: Mistake[];
  timeline: TimelinePoint[];
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
  /**
   * The most recent `limit` tests as summaries — per test rather than
   * flattened, and without the keystroke logs. What a longitudinal report
   * needs: `recentKeystrokes` loses the boundary between runs, and a fatigue
   * curve or a per-day heatmap is meaningless without it.
   */
  recentSummaries(limit: number): Promise<TestSummary[]>;
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

/**
 * `hall` is the ambient noise of other people typing, used by pressure mode. It
 * is deliberately its own cue rather than a quieter `key`: it has to sit under
 * the typist's own feedback instead of competing with it.
 */
export type SoundCue = 'key' | 'error' | 'complete' | 'hall';

export interface Sound {
  available(): boolean;
  play(cue: SoundCue): void;
  vibrate(pattern: number[]): void;
}

/** How a passage should be spoken. Everything optional — plain reading needs none. */
export interface SpeakOptions {
  lang?: Lang;
  /**
   * Speech rate multiplier. Dictation drives this from a words-per-minute
   * target; ordinary "read aloud" leaves it at the voice's own pace.
   */
  rate?: number;
  onEnd?: () => void;
  onError?: () => void;
}

export interface Tts {
  available(): boolean;
  /**
   * `lang` and `onEnd` stay positional for the many plain callers; a dictation
   * passes `SpeakOptions` instead, which is the only form that can set a rate.
   */
  speak(text: string, lang?: Lang | SpeakOptions, onEnd?: () => void): void;
  stop(): void;
  /** True while something is being spoken, so a queue can wait for it. */
  speaking(): boolean;
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
  /** Do not disturb, switched from the tray. Returns an unsubscribe. */
  onSetDnd(handler: (dnd: boolean) => void): () => void;
  /** Publish what the tray menu, tooltip and dock badge should say. */
  setStatus(status: ShellStatus): void;
  /** 0..1 while a test runs, or null to clear the taskbar/dock progress bar. */
  setProgress(fraction: number | null): void;
  /** The interface is on screen — the launch splash can be taken down. */
  ready(): void;
}

/**
 * Moving practice data between two of the user's own devices over the network
 * they are both already on. Desktop only: serving anything requires a socket,
 * which a browser tab does not have — on the web every call is inert and
 * `available()` is false, so the UI can explain itself rather than break.
 */
export interface DeviceSync {
  available(): boolean;
  /** Publish a backup for pairing. `lang` picks the paired page's language. */
  start(bundle: BackupBundle, lang: string): Promise<SyncState>;
  stop(): Promise<void>;
  /** Pairing state changes, including expiry. Returns an unsubscribe. */
  onState(handler: (state: SyncState) => void): () => void;
  /** A backup pushed from the paired device. Returns an unsubscribe. */
  onIncoming(handler: (bundle: BackupBundle) => void): () => void;
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
  sync: DeviceSync;
}
