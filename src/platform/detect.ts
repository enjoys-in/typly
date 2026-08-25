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

