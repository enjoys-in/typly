import { Check, Monitor, Moon, Palette, Sun } from 'lucide-react';
import { THEMES, type ThemeName } from '@/config/appConfig';
import { useThemeStore } from '@/store/themeStore';
import { useThemeModeStore, type ThemeMode } from '@/store/themeMode';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { Card } from '@/ui/Card';

const LABEL: Record<ThemeName, string> = {
  emerald: 'Emerald',
  indigo: 'Indigo',
  sunset: 'Sunset',
  ocean: 'Ocean',
};

const MODE_OPTIONS: SegmentedOption<ThemeMode>[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor, title: 'Follow the OS setting' },
];

export function ThemeCard() {
  const { theme, setTheme } = useThemeStore();
  const { mode, setMode } = useThemeModeStore();
  const names = Object.keys(THEMES) as ThemeName[];

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette size={18} className="text-accent-text" />
        <h2 className="font-semibold">Appearance</h2>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-fg-muted">Theme</p>
        <Segmented
          options={MODE_OPTIONS}
          value={mode}
          onChange={setMode}
          full
          ariaLabel="Colour theme"
        />
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <p className="text-sm font-medium text-fg-muted">Accent colour</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {names.map((name) => {
            const t = THEMES[name];
            const active = theme === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setTheme(name)}
                aria-pressed={active}
                className={`group flex cursor-pointer flex-col gap-2 rounded-panel border p-3 text-left outline-none transition-colors focus-visible:ring-4 focus-visible:ring-accent-ring ${
                  active
                    ? 'border-accent-border bg-accent-soft'
                    : 'border-line hover:bg-surface-hover'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-5 w-5 shrink-0 rounded-full"
                    style={{ backgroundImage: `linear-gradient(135deg, ${t.primaryFrom}, ${t.primaryTo})` }}
                  />
                  <span
                    className="h-5 w-5 shrink-0 rounded-full"
                    style={{ backgroundImage: `linear-gradient(135deg, ${t.accentFrom}, ${t.accentTo})` }}
                  />
                  {active && <Check size={15} className="ml-auto text-accent-soft-fg" />}
                </span>
                <span className="text-xs font-semibold">{LABEL[name]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-fg-muted">
        The accent recolours every primary action, stat and highlight. Error and failure colours
        stay fixed so they remain readable in both themes.
      </p>
    </Card>
  );
}
