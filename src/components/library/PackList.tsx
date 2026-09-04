import { BookOpen, Check, Download } from 'lucide-react';
import { useState } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import { useAsync } from '@/hooks/useAsync';
import {
  PACKS,
  encodeSeeded,
  packDocument,
  parseSeeded,
  type PackId,
} from '@/core/library/packs';
import { LANG_LABEL, SETTING_KEY } from '@/core/constants';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

interface Props {
  /** Called after an import, so the library list can refresh itself. */
  onImported: () => void;
}

/**
 * Bundled passage packs.
 *
 * Typly's users are not only preparing for a typing test — they have a general
 * knowledge paper to sit as well. Practising on "the quick brown fox" throws
 * that overlap away; practising on polity, economy, an editorial or a real
 * office-memorandum format means the hour counts twice.
 *
 * Bundled per release, never fetched: the app is offline-first, and a pack that
 * needs a network is a pack half the users never see.
 */
export function PackList({ onImported }: Props) {
  const t = useT();
  const platform = usePlatform();
  const [busy, setBusy] = useState<PackId | null>(null);

  const seeded = useAsync(
    async () => parseSeeded(await platform.repo.getSetting(SETTING_KEY.PacksSeeded)),
    [platform],
  );

  async function importPack(id: PackId) {
    const pack = PACKS.find((p) => p.id === id);
    if (!pack) return;
    setBusy(id);
    try {
      await platform.repo.saveDocument(await packDocument(pack));
      const next = new Set(seeded.data ?? []);
      next.add(id);
      await platform.repo.setSetting(SETTING_KEY.PacksSeeded, encodeSeeded(next));
      seeded.reload();
      onImported();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <BookOpen size={16} className="shrink-0 text-fg-subtle" />
          {t('packs.title')}
        </h2>
        <p className="mt-0.5 text-sm text-fg-muted">{t('packs.hint')}</p>
      </div>

      <ul className="space-y-2">
        {PACKS.map((pack) => {
          const done = seeded.data?.has(pack.id) ?? false;
          return (
            <li
              key={pack.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-inner border border-line px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{pack.title}</p>
                <p className="truncate text-[11px] text-fg-muted">
                  {LANG_LABEL[pack.lang]}
                  {pack.subject && ` · ${pack.subject}`} · {pack.blurb}
                </p>
              </div>
              <Button
                size="sm"
                variant={done ? 'ghost' : 'secondary'}
                disabled={busy === pack.id}
                onClick={() => void importPack(pack.id)}
              >
                {done ? <Check size={14} /> : <Download size={14} />}
                {t(busy === pack.id ? 'packs.importing' : done ? 'packs.again' : 'packs.import')}
              </Button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
