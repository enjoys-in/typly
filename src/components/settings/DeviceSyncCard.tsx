import { useCallback, useEffect, useState } from 'react';
import { Radio, ShieldAlert, Wifi } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useSettingsStore } from '@/store/settingsStore';
import { bundleCounts, minutesLeft, SYNC_OFF, type SyncState } from '@/core/sync/lan';
import type { BackupBundle } from '@/core/types';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { QrCode } from '@/ui/QrCode';
import { useT } from '@/i18n';

/** How often the "closes in" line is recomputed. */
const TICK_MS = 15_000;

/**
 * Pairing with another device over the local network.
 *
 * This is the offline-first promise taken literally: the two devices talk to
 * each other on the Wi-Fi they are already on, with no account and no server in
 * between. The desktop app publishes one snapshot for a few minutes, the other
 * device scans the code and pulls it — or hands one back the same way.
 */
export function DeviceSyncCard() {
  const t = useT();
  const platform = usePlatform();
  const uiLang = useSettingsStore((s) => s.uiLang);
  const available = platform.sync.available();

  const [state, setState] = useState<SyncState>(SYNC_OFF);
  const [starting, setStarting] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Expiry is decided in the main process; this only keeps the countdown honest.
  useEffect(() => {
    if (state.kind !== 'pairing') return;
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, [state.kind]);

  const receive = useCallback(
    async (bundle: BackupBundle) => {
      try {
        await platform.repo.importBackup(bundle);
        setNote(t('sync.received', bundleCounts(bundle)));
      } catch {
        setNote(t('sync.receiveFailed'));
      }
    },
    [platform, t],
  );

  useEffect(() => {
    if (!available) return;
    const offState = platform.sync.onState(setState);
    const offIncoming = platform.sync.onIncoming((bundle) => void receive(bundle));
    // The code is only useful while it is on screen, and it is a live socket
    // holding a copy of the user's data — so leaving this page closes it.
    return () => {
      offState();
      offIncoming();
      void platform.sync.stop();
    };
  }, [available, platform, receive]);

  async function start() {
    setStarting(true);
    setNote(null);
    try {
      const bundle = await platform.repo.exportBackup();
      setState(await platform.sync.start(bundle, uiLang));
      setNow(Date.now());
    } finally {
      setStarting(false);
    }
  }

  async function stop() {
    await platform.sync.stop();
    setState(SYNC_OFF);
    setNote(t('sync.closed'));
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Wifi size={18} className="text-accent-text" />
        <h2 className="font-semibold">{t('sync.title')}</h2>
      </div>
      <p className="text-xs text-fg-muted">{t('sync.lead')}</p>

      {!available ? (
        <p className="text-xs text-fg-subtle">{t('sync.desktopOnly')}</p>
      ) : state.kind === 'pairing' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-5">
            <QrCode value={state.session.url} size={176} label={t('sync.qrLabel')} />
            <div className="min-w-0 space-y-2">
              <p className="text-sm text-fg-muted">{t('sync.scan')}</p>
              <p className="font-mono text-sm break-all">{state.session.address}</p>
              <p className="text-xs text-fg-subtle tabular-nums">
                {t('sync.closesIn', { minutes: minutesLeft(state.session.expiresAt, now) })}
              </p>
            </div>
          </div>
          <p className="flex max-w-2xl items-start gap-2 text-xs text-fg-muted">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            {t('sync.warning')}
          </p>
          <Button variant="secondary" onClick={stop}>
            {t('sync.stop')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={start} disabled={starting} aria-busy={starting}>
            <Radio size={16} /> {t(starting ? 'sync.starting' : 'sync.start')}
          </Button>
          {state.kind === 'error' && (
            <span className="text-xs text-danger-text">
              {t(state.message === 'offline' ? 'sync.offline' : 'sync.unavailable')}
            </span>
          )}
        </div>
      )}

      {note && <p className="text-xs text-fg-muted">{note}</p>}
    </Card>
  );
}
