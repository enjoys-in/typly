import type { BackupBundle, FullResult, Repository } from '../ports';
import type { ShellStatus } from '@/core/ipc/shell';
import type {
  DocumentInput,
  DocumentRow,
  Keystroke,
  Mistake,
  SaveTestPayload,
  TestRow,
} from '@/core/types';

interface Bridge {
  platform: string;
  repoAvailable?: boolean;
  /** Runtime versions, shown in the About panel. Desktop only. */
  versions?: { electron: string; chrome: string; node: string };
  repo: { invoke(method: string, args: unknown[]): Promise<unknown> };
  fonts?: {
    read(): Promise<Record<string, string>>;
    write(slot: string, dataUrl: string): Promise<void>;
  };
  reminder?: {
    set(enabled: boolean, time: string): Promise<void>;
  };
  ai?: {
    invoke(channel: string, payload: unknown): Promise<{ status: number; body: unknown }>;
  };
  /** Tray / dock / taskbar integration and "Open with Typly". Desktop only. */
  shell?: {
    pendingFile(): Promise<{ name: string; bytes: Uint8Array } | null>;
    onOpenFile(handler: (file: { name: string; bytes: Uint8Array }) => void): () => void;
    onNavigate(handler: (route: string) => void): () => void;
    setStatus(status: ShellStatus): void;
    setProgress(fraction: number | null): void;
  };
}

declare global {
  interface Window {
    bridge?: Bridge;
  }
}

// Renderer-side Repository that forwards every call to the main-process
// better-sqlite3 store (electron/db.ts) over a single typed IPC channel.
export class ElectronRepository implements Repository {
  private call<T>(method: string, args: unknown[] = []): Promise<T> {
    const bridge = window.bridge;
    if (!bridge) return Promise.reject(new Error('Electron bridge unavailable'));
    return bridge.repo.invoke(method, args) as Promise<T>;
  }

  saveTest(payload: SaveTestPayload): Promise<number> {
    return this.call('saveTest', [payload]);
  }
  listHistory(): Promise<TestRow[]> {
    return this.call('listHistory');
  }
  getResult(id: number): Promise<FullResult | null> {
    return this.call('getResult', [id]);
  }
  saveDocument(doc: DocumentInput): Promise<number> {
    return this.call('saveDocument', [doc]);
  }
  listDocuments(): Promise<DocumentRow[]> {
    return this.call('listDocuments');
  }
  getDocument(id: number): Promise<DocumentRow | null> {
    return this.call('getDocument', [id]);
  }
  deleteDocument(id: number): Promise<void> {
    return this.call('deleteDocument', [id]);
  }
  getSetting(key: string): Promise<string | null> {
    return this.call('getSetting', [key]);
  }
  setSetting(key: string, value: string): Promise<void> {
    return this.call('setSetting', [key, value]);
  }
  aggregateMistakes(): Promise<Mistake[]> {
    return this.call('aggregateMistakes');
  }
  getKeystrokes(testId: number): Promise<Keystroke[]> {
    return this.call('getKeystrokes', [testId]);
  }
  recentKeystrokes(limit: number): Promise<Keystroke[]> {
    return this.call('recentKeystrokes', [limit]);
  }
  exportBackup(): Promise<BackupBundle> {
    return this.call('exportBackup');
  }
  importBackup(bundle: BackupBundle): Promise<void> {
    return this.call('importBackup', [bundle]);
  }
}
