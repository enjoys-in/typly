import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannel, AI_CHANNELS } from '../src/core/ipc/channels';

// Whether the main process's native SQLite store loaded (else IndexedDB fallback).
const repoAvailable = ipcRenderer.sendSync(IpcChannel.RepoAvailable) === true;
const aiChannels = new Set<string>(AI_CHANNELS);

// Minimal, safe surface exposed to the sandboxed renderer. `window.bridge` marks
// the desktop runtime (see src/platform/detect.ts) and forwards Repository calls
// to the main-process better-sqlite3 store over one allowlisted IPC channel.
contextBridge.exposeInMainWorld('bridge', {
  platform: 'electron',
  repoAvailable,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  repo: {
    invoke: (method: string, args: unknown[]) => ipcRenderer.invoke(IpcChannel.RepoInvoke, method, args),
  },
  // On-disk font cache (userData/fonts) for uploaded Hindi fonts.
  fonts: {
    read: () => ipcRenderer.invoke(IpcChannel.FontsRead),
    write: (slot: string, dataUrl: string) => ipcRenderer.invoke(IpcChannel.FontsWrite, slot, dataUrl),
  },
  // Generic, allowlisted AI channel dispatch (coach / grammar / OCR).
  ai: {
    invoke: (channel: string, payload: unknown) =>
      aiChannels.has(channel)
        ? ipcRenderer.invoke(channel, payload)
        : Promise.reject(new Error(`Blocked channel: ${channel}`)),
  },
  // Main-process daily reminder — only meaningful when the SQLite store loaded.
  ...(repoAvailable
    ? {
        reminder: {
          set: (enabled: boolean, time: string) =>
            ipcRenderer.invoke(IpcChannel.ReminderSet, enabled, time),
        },
      }
    : {}),
});
