import { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useChromeStore } from '@/store/chromeStore';
import { useDateFormat } from '@/hooks/useDateFormat';
import { APP_VERSION } from '@/config/appConfig';
import { SETTING_KEY } from '@/core/constants';
import {
  CHANGELOG_DISMISSED,
  releasesFor,
  shouldShowChangelog,
} from '@/i18n/changelog';
import { Button } from '@/ui/Button';
import { Modal } from '@/ui/Modal';
import { useT } from '@/i18n';

const TITLE_ID = 'whats-new-title';

/**
 * What changed since the user was last here.
 *
 * It opens itself once per release and then gets out of the way: the "don't
 * show this again" box is ticked to begin with, so closing the panel without
 * reading it is also the answer to never being interrupted by it again. The
 * list stays reachable from the About panel either way.
 */
export function WhatsNew() {
  const t = useT();
  const d = useDateFormat();
  const platform = usePlatform();
  const open = useChromeStore((s) => s.whatsNewOpen);
  const setOpen = useChromeStore((s) => s.setWhatsNewOpen);
  const [silence, setSilence] = useState(true);
  // Asked once per mount, so the panel cannot reopen behind the user.
  const asked = useRef(false);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    void (async () => {
      const [seen, tour] = await Promise.all([
        platform.repo.getSetting(SETTING_KEY.ChangelogSeen),
        // Having been offered the tour is what marks someone as a returning
        // user, and only they have a "last time" for this to be new since.
        platform.repo.getSetting(SETTING_KEY.TourDone),
      ]);
      if (shouldShowChangelog(seen, APP_VERSION, tour !== null)) {
        setOpen(true);
        return;
      }
      // Start the clock for a first-time user, quietly.
      if (!seen) await platform.repo.setSetting(SETTING_KEY.ChangelogSeen, APP_VERSION);
    })().catch(() => {});
  }, [platform, setOpen]);

  if (!open) return null;

  /**
   * Closing records the answer: silenced for good, or acknowledged up to this
   * release — which is what makes the next release worth mentioning.
   */
  function close() {
    setOpen(false);
    void platform.repo
      .setSetting(SETTING_KEY.ChangelogSeen, silence ? CHANGELOG_DISMISSED : APP_VERSION)
      .catch(() => {});
  }

  return (
    <Modal onClose={close} labelledBy={TITLE_ID} size="lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-white">
            <Sparkles size={22} />
          </span>
          <div>
            <h2 id={TITLE_ID} className="text-lg font-bold">
              {t('whatsNew.title')}
            </h2>
            <p className="text-sm text-fg-muted">{t('whatsNew.lead')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={t('whatsNew.close')}
          className="cursor-pointer rounded-control p-1 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <X size={18} />
        </button>
      </div>

      <div className="scroll-area mt-5 max-h-[52vh] space-y-6 pr-1">
        {releasesFor(APP_VERSION).map((release) => (
          <section key={release.version} className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-sm font-semibold">
                {t('whatsNew.version', { version: release.version })}
              </h3>
              <span className="text-xs text-fg-subtle">{d.date(release.date)}</span>
            </div>
            <ul className="space-y-1.5">
              {release.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-fg-muted">
                  <span aria-hidden="true" className="text-accent-text">
                    ·
                  </span>
                  {t(item)}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={silence}
            onChange={(e) => setSilence(e.target.checked)}
            className="h-4 w-4 accent-[var(--brand-from)]"
          />
          {t('whatsNew.dontShow')}
        </label>
        <Button onClick={close}>{t('whatsNew.close')}</Button>
      </div>
    </Modal>
  );
}
