import { create } from 'zustand';

/** 'system' follows the OS setting and keeps following it as it changes. */
export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'typly:mode';
const QUERY = '(prefers-color-scheme: dark)';

function stored(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    // Private mode / blocked storage — fall back to following the OS.
  }
  return 'system';
}

function systemPrefersDark(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** Resolve a mode to the concrete theme and stamp it on <html>. */
function stamp(mode: ThemeMode): void {
  const dark = mode === 'dark' || (mode === 'system' && systemPrefersDark());
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

interface ThemeModeState {
  mode: ThemeMode;
  /** The theme actually in effect, with 'system' already resolved. */
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

function resolve(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'dark' || (mode === 'system' && systemPrefersDark()) ? 'dark' : 'light';
}

export const useThemeModeStore = create<ThemeModeState>((set) => ({
  mode: stored(),
  resolved: resolve(stored()),
  setMode: (mode) => {
    stamp(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Preference is still applied for this session.
    }
    set({ mode, resolved: resolve(mode) });
  },
}));

/**
 * Re-stamp on OS changes while in 'system' mode. The inline script in index.html
 * has already stamped the initial value, so this only handles later changes.
 */
export function watchSystemTheme(): void {
  window.matchMedia(QUERY).addEventListener('change', () => {
    const { mode } = useThemeModeStore.getState();
    if (mode !== 'system') return;
    stamp(mode);
    useThemeModeStore.setState({ resolved: resolve(mode) });
  });
}
