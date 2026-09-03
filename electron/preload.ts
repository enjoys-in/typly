import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannel, AI_CHANNELS } from '../src/core/ipc/channels';

// Whether the main process's native SQLite store loaded (else IndexedDB fallback).
const repoAvailable = ipcRenderer.sendSync(IpcChannel.RepoAvailable) === true;
const aiChannels = new Set<string>(AI_CHANNELS);

/**
 * One-way main→renderer subscription. The event object never crosses into the
 * renderer (it carries a sender the sandbox has no business with) — only the
 * payload does — and the returned function detaches the exact listener.
 */
function subscribe<T>(channel: string, handler: (payload: T) => void): () => void {
  const listener = (_event: unknown, payload: T) => handler(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.off(channel, listener);
}

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
  // OS shell: files opened with Typly, tray/dock navigation, and the practice
  // status the tray menu and dock badge are drawn from.
  shell: {
    pendingFile: () => ipcRenderer.invoke(IpcChannel.FilePending),
    onOpenFile: (handler: (file: { name: string; bytes: Uint8Array }) => void) =>
      subscribe(IpcChannel.FileOpened, handler),
    onNavigate: (handler: (route: string) => void) => subscribe(IpcChannel.ShellNavigate, handler),
    setStatus: (status: unknown) => ipcRenderer.send(IpcChannel.ShellStatus, status),
    setProgress: (fraction: number | null) => ipcRenderer.send(IpcChannel.ShellProgress, fraction),
    ready: () => ipcRenderer.send(IpcChannel.AppReady),
  },
  // Direct device-to-device sync over the local network (no server involved).
  // The bundle crosses as a string: the main process serves it verbatim.
  sync: {
    start: (bundle: string, lang: string) => ipcRenderer.invoke(IpcChannel.SyncStart, bundle, lang),
    stop: () => ipcRenderer.invoke(IpcChannel.SyncStop),
    onState: (handler: (state: unknown) => void) => subscribe(IpcChannel.SyncState, handler),
    onIncoming: (handler: (bundle: unknown) => void) => subscribe(IpcChannel.SyncIncoming, handler),
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
