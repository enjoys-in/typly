// lucide dropped its brand glyphs, so each link gets the nearest generic icon.
import { Briefcase, Code2, Globe, Monitor, Sparkles, X, type LucideIcon } from 'lucide-react';
import { APP_VERSION, appConfig, type AboutLink } from '@/config/appConfig';
import { isElectron } from '@/platform/detect';
import { useChromeStore } from '@/store/chromeStore';
import { Modal } from '@/ui/Modal';
import { useT } from '@/i18n';

const TITLE_ID = 'about-panel-title';

interface Props {
  onClose: () => void;
}

/** Runtime versions the desktop preload exposes; absent in the browser. */
function runtimeLine(): string | null {
  if (typeof window === 'undefined') return null;
  const versions = window.bridge?.versions;
  if (!versions) return null;
  return `Electron ${versions.electron} · Chromium ${versions.chrome} · Node ${versions.node}`;
}

/** Who made this, what it is, and where to find them. */
export function AboutPanel({ onClose }: Props) {
  const t = useT();
  const setWhatsNewOpen = useChromeStore((s) => s.setWhatsNewOpen);
  const { about, name, tagline } = appConfig;
  const Logo = appConfig.logo;
  const runtime = runtimeLine();
  const links: { icon: LucideIcon; link: AboutLink }[] = [
    { icon: Globe, link: about.website },
    { icon: Code2, link: about.github },
    { icon: Briefcase, link: about.linkedin },
  ];

  return (
    <Modal onClose={onClose} labelledBy={TITLE_ID} size="lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-white">
            <Logo size={22} />
          </span>
          <div>
            <h2 id={TITLE_ID} className="text-lg font-bold">
              {name}
            </h2>
            <p className="text-sm text-fg-muted">
              {tagline} · v{APP_VERSION} · {isElectron() ? 'Desktop' : 'Web'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('about.close')}
          className="cursor-pointer rounded-control p-1 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <X size={18} />
        </button>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-fg-muted">{about.summary}</p>

      <button
        type="button"
        onClick={() => {
          // One dialog at a time: this panel steps aside for the release notes.
          onClose();
          setWhatsNewOpen(true);
        }}
        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-control border border-line px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:border-accent-border hover:bg-accent-soft hover:text-accent-soft-fg"
      >
        <Sparkles size={14} className="shrink-0" />
        {t('whatsNew.title')}
      </button>

      <div className="mt-5 space-y-2 border-t border-line pt-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">
          {t('about.builtBy')}
        </p>
        <p className="text-sm font-semibold">{about.author}</p>
        <ul className="flex flex-wrap gap-2 pt-1">
          {links
            .filter(({ link }) => link.url !== '')
            .map(({ icon: Icon, link }) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-control border border-line px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:border-accent-border hover:bg-accent-soft hover:text-accent-soft-fg"
                >
                  <Icon size={14} className="shrink-0" />
                  {link.label}
                </a>
              </li>
            ))}
        </ul>
      </div>

      <div className="mt-5 space-y-1.5 border-t border-line pt-5 text-xs text-fg-subtle">
        {runtime && (
          <p className="flex items-center gap-2">
            <Monitor size={13} className="shrink-0" />
            {runtime}
          </p>
        )}
        <p>{about.copyright}</p>
      </div>
    </Modal>
  );
}
