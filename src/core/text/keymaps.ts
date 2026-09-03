import { InputMethod, type Lang } from '../constants';
import type { Keymap } from './keymap';
import { INSCRIPT } from './inscript';
import { REMINGTON } from './remington';
import { isDevanagari } from './scripts';

// The remapping layouts, by input method. Methods with no table (QWERTY types
// itself; Phonetic transliterates whole words) are absent.
const KEYMAPS: Partial<Record<InputMethod, Keymap>> = {
  [InputMethod.InScript]: INSCRIPT,
  [InputMethod.Remington]: REMINGTON,
};

/** True when the method is selectable — a keymap method needs installed data. */
export function isMethodAvailable(method: InputMethod): boolean {
  const keymap = KEYMAPS[method];
  return keymap ? keymap.size > 0 : true;
}

/**
 * The keymap to type with, or null when the language/method combination needs
 * no remapping. This is the single place the UI asks "how do keys translate?".
 */
export function keymapFor(method: InputMethod, lang: Lang): Keymap | null {
  if (!isDevanagari(lang)) return null;
  const keymap = KEYMAPS[method];
  return keymap && keymap.size > 0 ? keymap : null;
}

/** True when the method transliterates Roman input instead of remapping keys. */
export function isPhonetic(method: InputMethod, lang: Lang): boolean {
  return method === InputMethod.Phonetic && isDevanagari(lang);
}
