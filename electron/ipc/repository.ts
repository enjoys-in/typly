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
  'getSetting',
  'setSetting',
  'aggregateMistakes',
  'exportBackup',
  'importBackup',
]);

export function registerRepoIpc(db: SqliteRepository): void {
  ipcMain.handle(IpcChannel.RepoInvoke, (_event, method: string, args: unknown[]) => {
    if (!METHODS.has(method)) throw new Error(`Unknown repo method: ${method}`);
    const fn = (db as unknown as Record<string, (...a: unknown[]) => unknown>)[method];
    return fn.apply(db, Array.isArray(args) ? args : []);
  });
}
