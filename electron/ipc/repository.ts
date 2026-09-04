import { ipcMain } from 'electron';
import type { SqliteRepository } from '../data/db';
import { IpcChannel } from '../../src/core/ipc/channels';

// Allowlisted Repository methods callable from the renderer over one channel.
const METHODS = new Set([
  'saveTest',
  'listHistory',
  'getResult',
  'saveDocument',
  'listDocuments',
  'getDocument',
  'deleteDocument',
  'getSetting',
  'setSetting',
  'aggregateMistakes',
  'getKeystrokes',
  'recentKeystrokes',
  'recentResults',
  'exportBackup',
  'importBackup',
]);

export function registerRepoIpc(db: SqliteRepository): void {
  ipcMain.handle(IpcChannel.RepoInvoke, (_event, method: string, args: unknown[]) => {
    if (!METHODS.has(method)) throw new Error(`Unknown repo method: ${method}`);
    const fn = (db as unknown as Record<string, ((...a: unknown[]) => unknown) | undefined>)[
      method
    ];
    // Allowlisted but absent means the store and the list have drifted apart.
    if (typeof fn !== 'function') throw new Error(`Repo method unavailable: ${method}`);
    return fn.apply(db, Array.isArray(args) ? args : []);
  });
}
