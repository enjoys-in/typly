import type { Platform } from '../ports';
import { GrammarMode, Lang } from '@/core/constants';
import { useLanguageToolsStore } from '@/store/languageToolsStore';

const DB_NAME = 'typly';
const DICT_FILES = ['dictionaries/en.aff', 'dictionaries/en.dic', 'dictionaries/en.txt'].map(
  (p) => `${import.meta.env.BASE_URL}${p}`,
);

// Registers the PWA service worker (production only — in dev the app is served
// fresh, and a caching SW would fight HMR). Caches the app shell + language assets.
export function registerAssetCache(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
  });
}

// Pre-fetches dictionaries and forces Harper to load so its WASM is cached for
// offline use. Best-effort — failures are swallowed.
export async function warmLanguageData(platform: Platform): Promise<void> {
  await Promise.all(DICT_FILES.map((u) => fetch(u).catch(() => undefined)));
  // Only warm Harper's WASM in on-device mode — AI mode has nothing to cache.
  if (useLanguageToolsStore.getState().grammarMode === GrammarMode.Offline) {
    await platform.grammar.check('The cat sat.', Lang.En).catch(() => undefined);
  }
  await platform.spell.ready().catch(() => false);
}

// Removes downloaded language data: deletes the language-asset cache and frees the
// in-memory grammar engine so the WASM is re-fetched next time it is needed.
export async function clearLanguageData(platform: Platform): Promise<void> {
  platform.grammar.dispose();
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.includes('assets')).map((k) => caches.delete(k)));
  }
}

// Full uninstall: all caches (shell + language) + history/library (IndexedDB) +
// settings (localStorage). Callers should reload so a fresh, empty store opens.
export async function clearAllData(platform: Platform): Promise<void> {
  platform.grammar.dispose();
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('typly')) localStorage.removeItem(key);
  }
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
}

export async function estimateUsageBytes(): Promise<number | null> {
  if (!navigator.storage?.estimate) return null;
  const { usage } = await navigator.storage.estimate();
  return usage ?? null;
}
