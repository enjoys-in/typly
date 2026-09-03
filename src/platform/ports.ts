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
import type { Lang, SourceType } from '@/core/constants';

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
}

export interface Auth {
  current(): Promise<Account | null>;
  continueAsGuest(): Promise<Account>;
  login(email: string, password: string): Promise<Account>;
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

export interface Notifications {
  available(): boolean;
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
}
