export function isElectron(): boolean {
  return typeof window !== 'undefined' && Boolean((window as { bridge?: unknown }).bridge);
}

// True on macOS (browser or Electron renderer) — used to pick Cmd- vs Ctrl-based drills.
export function isMacOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || '';
  return /mac/i.test(platform);
}

/**
 * True only in the macOS desktop build, where the window buttons are drawn over
 * the content and the layout has to leave room for them. A Mac *browser* has no
 * such buttons, so `isMacOS()` alone is the wrong test.
 */
export function needsTitlebarInset(): boolean {
  return isElectron() && isMacOS() && !isQuickDrill();
}

/**
 * True when the renderer was opened as the quick-drill overlay rather than the
 * full app. The desktop shell passes `?quick=1`; the flag is read once, at
 * boot, because the window's role cannot change while it is open.
 */
export function isQuickDrill(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('quick') === '1';
}
