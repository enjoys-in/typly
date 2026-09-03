import { LANG_SCRIPT, Script, type Lang } from '../constants';

export function scriptOf(lang: Lang): Script {
  return LANG_SCRIPT[lang];
}

/** Devanagari covers Hindi and Marathi — both use InScript, Remington and the legacy fonts. */
export function isDevanagari(lang: Lang): boolean {
  return scriptOf(lang) === Script.Devanagari;
}

export function isLatin(lang: Lang): boolean {
  return scriptOf(lang) === Script.Latin;
}
