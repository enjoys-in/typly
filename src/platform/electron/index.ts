import type { Platform } from '../ports';
import { createBrowserPlatform } from '../browser';
import { ElectronRepository } from './repository';
import { ElectronShell } from './shell';

// Desktop platform = the browser adapters (OCR, PDF, spell, grammar, etc. all run
// in the Chromium renderer), plus the OS shell (tray, dock, file associations).
// The canonical store is better-sqlite3 (main process) via IPC when available,
// otherwise the renderer's IndexedDB store as a fallback.
export function createElectronPlatform(): Platform {
  const base = { ...createBrowserPlatform(), shell: new ElectronShell() };
  if (window.bridge?.repoAvailable) return { ...base, repo: new ElectronRepository() };
  return base;
}
