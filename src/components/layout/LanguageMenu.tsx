import { useEffect, useRef, useState } from 'react';
import { Check, Languages } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { UI_LANGS, UI_LANG_LABEL, useT, type UiLang } from '@/i18n';

interface Props {
  /** Icon-only rail: the trigger shrinks and the menu opens beside it. */
  collapsed: boolean;
}

/**
 * The interface language, in the sidebar next to About.
 *
 * It lives in Settings too, but switching language is something people do
 * before they know where Settings is — and someone who has landed in the wrong
 * language needs the way out to be visible, not three screens away. The menu
 * opens to the side so it clears the rail whether the sidebar is collapsed or
 * not, and it reads as a menu of radio choices to a screen reader.
 */
export function LanguageMenu({ collapsed }: Props) {
  const t = useT();
  const uiLang = useSettingsStore((s) => s.uiLang);
  const setUiLang = useSettingsStore((s) => s.setUiLang);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // A menu that outlives a click elsewhere is a menu in the way.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function choose(lang: UiLang) {
    setUiLang(lang);
    setOpen(false);
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        title={collapsed ? t('nav.language') : undefined}
        aria-label={t('nav.language')}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`group flex w-full cursor-pointer items-center rounded-control text-[13.5px] font-medium outline-none transition-colors duration-150 hover:bg-surface-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-ring ${
          open ? 'bg-surface-hover text-fg' : 'text-fg-muted'
        } ${collapsed ? 'h-10 justify-center' : 'gap-2.5 px-3 py-2'}`}
      >
        <Languages
          size={17}
          className="shrink-0 text-fg-subtle transition-colors group-hover:text-fg-muted"
        />
        {!collapsed && (
          <>
            <span className="truncate">{t('nav.language')}</span>
            {/* The current choice, as a chip. It is the answer to the question
                the row asks, so it should not read as more body text. */}
            <span className="ml-auto shrink-0 rounded-full bg-surface-3 px-2 py-0.5 text-[10.5px] font-semibold text-fg-muted">
              {UI_LANG_LABEL[uiLang]}
            </span>
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('nav.language')}
          // The offset clears the sidebar's own padding as well as the
          // trigger, so the menu never sits half over the rail it came from.
          className="absolute bottom-0 left-full z-30 ml-5 min-w-44 rounded-panel border border-line bg-surface p-1 shadow-e3"
        >
          {UI_LANGS.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={code === uiLang}
              onClick={() => choose(code)}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-inner px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-ring ${
                code === uiLang ? 'font-semibold text-fg' : 'text-fg-muted'
              }`}
            >
              <Check
                size={14}
                aria-hidden="true"
                className={`shrink-0 ${code === uiLang ? 'text-accent-text' : 'invisible'}`}
              />
              {UI_LANG_LABEL[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
