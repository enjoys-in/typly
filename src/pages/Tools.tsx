import { KrutiDevConverter } from '@/components/tools/KrutiDevConverter';
import { KeyboardHealthCheck } from '@/components/tools/KeyboardHealthCheck';
import { useT } from '@/i18n';

/**
 * The utilities that are not practice.
 *
 * Two things a Hindi typing aspirant needs and currently leaves the app for: a
 * Kruti Dev converter (otherwise found on whichever advert-covered website
 * ranks first) and a way to check a keyboard before trusting a mock to it —
 * which matters because a lot of this practice happens on shared lab and café
 * machines.
 */
export function Tools() {
  const t = useT();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('toolbox.title')}</h1>
        <p className="mt-1 text-fg-muted">{t('toolbox.subtitle')}</p>
      </div>

      <KeyboardHealthCheck />
      <KrutiDevConverter />
    </div>
  );
}
