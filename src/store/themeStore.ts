import { create } from 'zustand';
import { appConfig, applyTheme, isThemeName, type ThemeName } from '@/config/appConfig';

const STORAGE_KEY = 'typly:theme';

function stored(): ThemeName {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (isThemeName(raw)) return raw;
  } catch {
    // Private mode / blocked storage — fall back to the configured default.
  }
  return appConfig.theme;
}

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: stored(),
  setTheme: (theme) => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Preference is still applied for this session.
    }
    set({ theme });
  },
}));

/** Apply the persisted preset at boot, before first paint. */
export function initTheme(): void {
  applyTheme(stored());
}
