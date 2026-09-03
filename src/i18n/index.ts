import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { en, type TKey } from './en';
import { hi } from './hi';

/** The languages the interface itself is available in. */
export const UI_LANGS = ['en', 'hi'] as const;
export type UiLang = (typeof UI_LANGS)[number];

export const UI_LANG_LABEL: Record<UiLang, string> = {
  en: 'English',
  hi: 'हिन्दी',
};

/** BCP-47 tags for `<html lang>`, which screen readers and fonts read. */
const HTML_LANG: Record<UiLang, string> = {
  en: 'en',
  hi: 'hi',
};

const DICTIONARIES: Record<UiLang, Record<TKey, string>> = { en, hi };

export function isUiLang(value: unknown): value is UiLang {
  return typeof value === 'string' && (UI_LANGS as readonly string[]).includes(value);
}

export type TParams = Record<string, string | number>;

/**
 * One interface string. Placeholders are `{named}`; anything not supplied is
 * left as-is rather than printed as "undefined", so a missing parameter is
 * visible in review instead of shipping as a broken sentence.
 */
export function translate(lang: UiLang, key: TKey, params?: TParams): string {
  const template = DICTIONARIES[lang][key] ?? en[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole,
  );
}

/** Keeps `<html lang>` in step with the chosen interface language. */
export function applyHtmlLang(lang: UiLang): void {
  if (typeof document !== 'undefined') document.documentElement.lang = HTML_LANG[lang];
}

/**
 * The translator for the current interface language. Components call `t('key')`
 * and re-render when the language changes, because the language comes from the
 * settings store.
 */
export function useT(): (key: TKey, params?: TParams) => string {
  const uiLang = useSettingsStore((s) => s.uiLang);
  return useCallback((key: TKey, params?: TParams) => translate(uiLang, key, params), [uiLang]);
}
