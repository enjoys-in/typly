// Single source of truth for branding + theme.
// Change the app name, logo, tagline, or active theme here — nowhere else.

import { Keyboard, type LucideIcon } from 'lucide-react';

export interface ThemeTokens {
  /** Primary brand gradient (logo, table headers, primary accents). */
  primaryFrom: string;
  primaryTo: string;
  /** Secondary/accent gradient (highlights, badges). */
  accentFrom: string;
  accentTo: string;
}

/** Named theme presets. Add your own and point `appConfig.theme` at it. */
export const THEMES = {
  emerald: {
    primaryFrom: '#22c55e',
    primaryTo: '#0d9488',
    accentFrom: '#f97316',
    accentTo: '#ea580c',
  },
  indigo: {
    primaryFrom: '#6366f1',
    primaryTo: '#8b5cf6',
    accentFrom: '#ec4899',
    accentTo: '#db2777',
  },
  sunset: {
    primaryFrom: '#f97316',
    primaryTo: '#ec4899',
    accentFrom: '#8b5cf6',
    accentTo: '#6366f1',
  },
  ocean: {
    primaryFrom: '#0ea5e9',
    primaryTo: '#6366f1',
    accentFrom: '#14b8a6',
    accentTo: '#0d9488',
  },
} satisfies Record<string, ThemeTokens>;

export type ThemeName = keyof typeof THEMES;

export interface AppConfig {
  /** Full product name shown in headers and the browser tab. */
  name: string;
  /** Compact name for tight spaces. */
  shortName: string;
  /** One-line descriptor shown under the logo. */
  tagline: string;
  /** Logo icon (any lucide-react icon). */
  logo: LucideIcon;
  /** Active theme preset. */
  theme: ThemeName;
}

export const appConfig: AppConfig = {
  name: 'Typly',
  shortName: 'Typly',
  tagline: 'Exam practice',
  logo: Keyboard,
  theme: 'emerald',
};

export function activeTheme(): ThemeTokens {
  return THEMES[appConfig.theme];
}

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && value in THEMES;
}

/**
 * Push a preset's tokens to CSS variables. Every semantic colour role in
 * styles/index.css derives from these, so this recolours the whole app.
 */
export function applyTheme(name: ThemeName): void {
  const t = THEMES[name];
  const root = document.documentElement;
  root.style.setProperty('--brand-from', t.primaryFrom);
  root.style.setProperty('--brand-to', t.primaryTo);
  root.style.setProperty('--brand-accent-from', t.accentFrom);
  root.style.setProperty('--brand-accent-to', t.accentTo);
}

/** Apply the default preset and set the document title. Call once at boot. */
export function applyBranding(): void {
  applyTheme(appConfig.theme);
  document.title = `${appConfig.name} — ${appConfig.tagline}`;
}
