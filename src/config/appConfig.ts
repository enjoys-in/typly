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

/** A single row in the About panel's link list; blank URLs are not rendered. */
export interface AboutLink {
  label: string;
  url: string;
}

export interface AboutInfo {
  /** Who built it. */
  author: string;
  /** One paragraph on what the app is for. */
  summary: string;
  /** Rights line shown at the foot of the panel. */
  copyright: string;
  website: AboutLink;
  github: AboutLink;
  /** Left blank until a profile URL is set — the panel skips empty links. */
  linkedin: AboutLink;
}

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
  /** Credits and links shown in the About panel. */
  about: AboutInfo;
}

export const appConfig: AppConfig = {
  name: 'Typly',
  shortName: 'Typly',
  tagline: 'Exam practice',
  logo: Keyboard,
  theme: 'emerald',
  about: {
    author: 'enjoys',
    summary:
      'Offline-first typing-exam practice for Indian competitive exams. Bring any passage — paste it, or import an image, PDF or document — and practise against the exact scoring your exam uses, with per-mistake analysis, replays and targeted drills. Everything stays on your device.',
    copyright: '© 2026 enjoys. All rights reserved.',
    website: { label: 'enjoys.in', url: 'https://enjoys.in' },
    github: { label: 'github.com/enjoys-in', url: 'https://github.com/enjoys-in' },
    linkedin: { label: 'LinkedIn', url: '' },
  },
};

/** The app version, injected at build time from package.json. */
export const APP_VERSION: string = __APP_VERSION__;

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
