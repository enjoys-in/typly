import { useEffect, useState } from 'react';
import { Database, Download, Trash2 } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import {
  clearAllData,
  clearLanguageData,
  estimateUsageBytes,
  warmLanguageData,
} from '@/platform/browser/assetCache';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useConfirm } from '@/ui/Confirm';
import { useT } from '@/i18n';

function fmtMB(bytes: number | null): string {
  if (bytes == null) return '—';
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

// Lets the user cache language assets for offline use and cleanly uninstall them
// (or wipe all app data). Grammar (Harper) + dictionaries live in Cache Storage.
export function StorageCard() {
  const t = useT();
  const platform = usePlatform();
  const confirm = useConfirm();
  const [usage, setUsage] = useState<number | null>(null);
  const [busy, setBusy] = useState<'warm' | 'lang' | 'all' | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void estimateUsageBytes().then(setUsage);
  }, []);

  function refresh() {
    void estimateUsageBytes().then(setUsage);
  }

  async function download() {
    setBusy('warm');
    setStatus(null);
    try {
      await warmLanguageData(platform);
      setStatus('Language data downloaded — grammar and spelling now work offline.');
    } finally {
      setBusy(null);
      refresh();
    }
  }

  async function removeLang() {
    const ok = await confirm({
      title: 'Remove language data?',
      message:
        'Deletes the downloaded grammar model and dictionaries. They will re-download when needed.',
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!ok) return;
    setBusy('lang');
    setStatus(null);
    try {
      await clearLanguageData(platform);
      setStatus('Downloaded language data removed.');
    } finally {
      setBusy(null);
      refresh();
    }
  }

  async function wipe() {
    const ok = await confirm({
      title: t('storage.clearTitle'),
      message: t('storage.clearBody'),
      confirmLabel: t('storage.clearConfirm'),
      destructive: true,
    });
    if (!ok) return;
    setBusy('all');
    setStatus(null);
    try {
      await clearAllData(platform);
      location.reload();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Database size={18} className="text-accent-text" />
        <h2 className="font-semibold">{t('storage.title')}</h2>
        <span className="ml-auto text-xs text-fg-muted">Using ~{fmtMB(usage)}</span>
      </div>
      <p className="text-xs text-fg-muted">
        Grammar (Harper) and the spelling dictionaries download once and are cached on your device
        for offline use. You can remove them any time to free space.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={download} disabled={busy !== null} aria-busy={busy === 'warm'}>
          <Download size={16} /> {busy === 'warm' ? 'Downloading…' : 'Download for offline'}
        </Button>
        <Button variant="secondary" onClick={removeLang} disabled={busy !== null} aria-busy={busy === 'lang'}>
          <Trash2 size={16} /> {busy === 'lang' ? 'Removing…' : 'Remove language data'}
        </Button>
        <Button variant="secondary" onClick={wipe} disabled={busy !== null} aria-busy={busy === 'all'}>
          <Trash2 size={16} /> {t('storage.clearAll')}
        </Button>
      </div>
      {status && <p className="text-xs text-fg-muted">{status}</p>}
    </Card>
  );
}
