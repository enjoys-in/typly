import type { Platform } from '../ports';
import { createBrowserPlatform } from '../browser';
import { ElectronRepository } from './repository';

// Desktop platform = the browser adapters (OCR, PDF, spell, grammar, etc. all run
// in the Chromium renderer). The canonical store is better-sqlite3 (main process)
// via IPC when available, otherwise the renderer's IndexedDB store as a fallback.
export function createElectronPlatform(): Platform {
  const base = createBrowserPlatform();
  if (window.bridge?.repoAvailable) return { ...base, repo: new ElectronRepository() };
  return base;
}
