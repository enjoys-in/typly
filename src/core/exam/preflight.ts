/**
 * The checks that should happen before the clock starts, not after.
 *
 * Caps Lock left on, the OS input method fighting InScript, a Devanagari board
 * selected with no font uploaded for it — each of these silently ruins an
 * attempt, and each is detectable. Ten minutes are wasted discovering it at
 * character three. So they run as a short checklist in the briefing instead.
 */

import { HindiFont, InputMethod, Lang } from '../constants';
import { isDevanagari } from '../text/scripts';
import { isMethodAvailable } from '../text/keymaps';

export type CheckId =
  | 'capsLock'
  | 'inputMethod'
  | 'font'
  | 'layoutData'
  | 'keyboardLayout'
  | 'fullscreen';

export type CheckLevel = 'ok' | 'warn' | 'blocked';

export interface PreflightCheck {
  id: CheckId;
  level: CheckLevel;
}

export interface PreflightInput {
  lang: Lang;
  inputMethod: InputMethod;
  hindiFont: HindiFont;
  /** Whether a font has actually been uploaded into the selected slot. */
  fontLoaded: boolean;
  /** From the last key event — the browser only knows once a key is pressed. */
  capsLock: boolean | null;
  /** The OS keyboard layout, where the browser will say. */
  osLayout: string | null;
  fullscreen: boolean;
}

/**
 * Every check, in the order they are shown. Checks that cannot apply are
 * dropped rather than reported green — a Hindi font check on an English test is
 * noise, and a checklist people learn to skim is worse than none.
 */
export function preflight(input: PreflightInput): PreflightCheck[] {
  const checks: PreflightCheck[] = [];
  const devanagari = isDevanagari(input.lang);

  // Caps Lock is unknowable until a key is pressed, so "unknown" is a warning
  // to press one rather than a false all-clear.
  checks.push({
    id: 'capsLock',
    level: input.capsLock === null ? 'warn' : input.capsLock ? 'blocked' : 'ok',
  });

  if (devanagari) {
    // A remapping layout expects raw Latin keys. If the OS is already producing
    // Devanagari, every keystroke arrives pre-translated and nothing matches.
    const remapping =
      input.inputMethod === InputMethod.InScript || input.inputMethod === InputMethod.Remington;
    if (remapping) {
      checks.push({
        id: 'inputMethod',
        level: looksDevanagariLayout(input.osLayout) ? 'blocked' : 'ok',
      });
      checks.push({
        id: 'layoutData',
        level: isMethodAvailable(input.inputMethod) ? 'ok' : 'blocked',
      });
    }

    // A legacy font remaps Latin glyphs to Devanagari. Selected but not
    // uploaded, the passage renders as Roman gibberish.
    if (input.hindiFont !== HindiFont.System) {
      checks.push({ id: 'font', level: input.fontLoaded ? 'ok' : 'blocked' });
    }
  } else if (looksDevanagariLayout(input.osLayout)) {
    // The mirror image: an English test with a Devanagari OS layout active.
    checks.push({ id: 'keyboardLayout', level: 'warn' });
  }

  checks.push({ id: 'fullscreen', level: input.fullscreen ? 'ok' : 'warn' });
  return checks;
}

/** Layout names the OS reports for Indic input methods. */
const DEVANAGARI_LAYOUT = /deva|hindi|inscript|marathi|indic|remington/i;

function looksDevanagariLayout(layout: string | null): boolean {
  return layout !== null && DEVANAGARI_LAYOUT.test(layout);
}

/** True when nothing found would actually break the attempt. */
export function preflightClear(checks: PreflightCheck[]): boolean {
  return !checks.some((c) => c.level === 'blocked');
}
