import { HindiFont } from '@/core/constants';

// A separate registered family per slot, so uploaded Mangal/Kruti Dev/custom
// fonts don't collide. Empty for System (no override).
export const UPLOADED_FAMILY: Record<HindiFont, string> = {
  [HindiFont.System]: '',
  [HindiFont.Mangal]: 'TyplyMangal',
  [HindiFont.KrutiDev]: 'TyplyKrutiDev',
  [HindiFont.Custom]: 'TyplyCustom',
};

// CSS stack per slot: prefer an uploaded font, then a locally installed one.
export const FONT_FAMILY: Record<HindiFont, string> = {
  [HindiFont.System]: '',
  [HindiFont.Mangal]: "'TyplyMangal', 'Mangal', serif",
  [HindiFont.KrutiDev]: "'TyplyKrutiDev', 'Kruti Dev 010', 'Kruti Dev 010 Regular', sans-serif",
  [HindiFont.Custom]: "'TyplyCustom', sans-serif",
};

// Legacy fonts remap Latin glyphs to Devanagari, so the on-screen keyboard uses them too.
export function isLegacyFont(font: HindiFont): boolean {
  return font === HindiFont.KrutiDev || font === HindiFont.Custom;
}

// Repo/cache key a slot's font bytes are stored under.
export function fontSettingKey(font: HindiFont): string {
  return `font:${font}`;
}

// Load a font from a data URL and register it under `family`.
export async function registerFontFromDataUrl(dataUrl: string, family: string): Promise<void> {
  if (!family || typeof document === 'undefined' || !('fonts' in document)) return;
  const buffer = await (await fetch(dataUrl)).arrayBuffer();
  const face = new FontFace(family, buffer);
  await face.load();
  document.fonts.add(face);
}

// Re-register every previously uploaded slot font from the persistent store.
export async function loadStoredFonts(
  getSetting: (key: string) => Promise<string | null>,
): Promise<void> {
  const slots = [HindiFont.Mangal, HindiFont.KrutiDev, HindiFont.Custom];
  await Promise.all(
    slots.map(async (slot) => {
      const data = await getSetting(fontSettingKey(slot));
      if (data) await registerFontFromDataUrl(data, UPLOADED_FAMILY[slot]);
    }),
  );
}

// Desktop only: mirror an uploaded font into the Electron on-disk font cache.
export async function cacheFontToDesktop(slot: HindiFont, dataUrl: string): Promise<void> {
  await window.bridge?.fonts?.write(slot, dataUrl);
}

// Desktop only: re-register fonts saved to the Electron on-disk font cache.
export async function loadDesktopFontCache(): Promise<void> {
  const cache = window.bridge?.fonts;
  if (!cache) return;
  const fonts = await cache.read();
  await Promise.all(
    Object.entries(fonts).map(([slot, dataUrl]) => {
      const family = UPLOADED_FAMILY[slot as HindiFont];
      return family ? registerFontFromDataUrl(dataUrl, family) : Promise.resolve();
    }),
  );
}
