import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import { useSettingsStore } from '@/store/settingsStore';
import { preflight, type PreflightCheck } from '@/core/exam/preflight';
import { HindiFont, type Lang } from '@/core/constants';
import { fontSettingKey } from '@/ui/fonts';

/**
 * Runs the pre-flight checks for a run that has not started yet.
 *
 * Two of the inputs cannot be read on demand. Caps Lock is only knowable from a
 * key event, so a listener watches for the first one; the uploaded-font check
 * needs a store read, so it is done once on mount. Everything else comes from
 * settings and is recomputed as they change.
 */
export function usePreflight(lang: Lang, fullscreen: boolean): {
  checks: PreflightCheck[];
  /** True until a key has been pressed and Caps Lock is actually known. */
  awaitingKey: boolean;
} {
  const platform = usePlatform();
  const inputMethod = useSettingsStore((s) => s.inputMethod);
  const hindiFont = useSettingsStore((s) => s.hindiFont);
  const [capsLock, setCapsLock] = useState<boolean | null>(null);
  const [fontLoaded, setFontLoaded] = useState(true);

  // `getModifierState` is only populated on a real key event, so the check
  // stays "unknown" — and says so — until the user presses something.
  const onKey = useCallback((event: KeyboardEvent) => {
    setCapsLock(event.getModifierState('CapsLock'));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [onKey]);

  useEffect(() => {
    if (hindiFont === HindiFont.System) {
      setFontLoaded(true);
      return;
    }
    let alive = true;
    void platform.repo
      .getSetting(fontSettingKey(hindiFont))
      .then((value) => alive && setFontLoaded(Boolean(value)))
      .catch(() => alive && setFontLoaded(false));
    return () => {
      alive = false;
    };
  }, [hindiFont, platform]);

  const checks = useMemo(
    () =>
      preflight({
        lang,
        inputMethod,
        hindiFont,
        fontLoaded,
        capsLock,
        osLayout: osLayout(),
        fullscreen,
      }),
    [lang, inputMethod, hindiFont, fontLoaded, capsLock, fullscreen],
  );

  return { checks, awaitingKey: capsLock === null };
}

/**
 * The OS keyboard layout, where the browser will say. `keyboard.getLayoutMap`
 * is Chromium-only and asynchronous, so the synchronous signal used here is the
 * navigator language list — enough to notice a Devanagari input method being
 * active, and null everywhere else rather than a guess.
 */
function osLayout(): string | null {
  if (typeof navigator === 'undefined') return null;
  const languages = navigator.languages ?? [navigator.language];
  return languages.some((tag) => /^(hi|mr|ne|sa)\b/i.test(tag)) ? 'devanagari' : null;
}
