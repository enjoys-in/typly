import { useMemo } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { dateFormatterFor, type DateFormatter } from '@/core/format/datetime';

/**
 * The date formatter for the current interface language. Components take this
 * instead of writing their own format strings, so every timestamp in the app
 * reads the same way and follows the chosen language.
 */
export function useDateFormat(): DateFormatter {
  const uiLang = useSettingsStore((s) => s.uiLang);
  return useMemo(() => dateFormatterFor(uiLang), [uiLang]);
}
