import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Crosshair,
  Dumbbell,
  GraduationCap,
  History as HistoryIcon,
  Info,
  Library,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Settings as SettingsIcon,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { appConfig } from '@/config/appConfig';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n/en';
import { firstName, initialOf } from '@/core/profile/profile';
import { AboutPanel } from './AboutPanel';
import { LanguageMenu } from './LanguageMenu';

interface Link {
  to: string;
  label: TKey;
  icon: LucideIcon;
  end?: boolean;
}

/**
 * The nav, in four bands.
 *
 * Ten flat links is a list you have to read; four short groups is a shape you
 * learn once. The first band is unlabelled on purpose — where you land and
 * where you start a test are not a category, they are the top of the app.
 * `heading: null` renders a plain rule instead of a caption, which is also what
 * every band falls back to on the collapsed rail.
 */
const GROUPS: { heading: TKey | null; links: Link[] }[] = [
  {
    heading: null,
    links: [
      { to: '/app', label: 'nav.dashboard', icon: LayoutDashboard, end: true },
      { to: '/app/new', label: 'nav.new', icon: PlusCircle },
    ],
  },
  {
    heading: 'nav.groupPractice',
    links: [
      { to: '/app/lessons', label: 'nav.lessons', icon: GraduationCap },
      { to: '/app/practice', label: 'nav.practice', icon: Dumbbell },
      { to: '/app/trainer', label: 'nav.trainer', icon: Crosshair },
      { to: '/app/library', label: 'nav.library', icon: Library },
    ],
  },
  {
    heading: 'nav.groupReview',
    links: [
      { to: '/app/history', label: 'nav.history', icon: HistoryIcon },
      { to: '/app/progress', label: 'nav.progress', icon: TrendingUp },
    ],
  },
  {
    heading: 'nav.groupApp',
    links: [
      { to: '/app/tools', label: 'nav.tools', icon: Wrench },
      { to: '/app/settings', label: 'nav.settings', icon: SettingsIcon },
    ],
  },
];

export function Sidebar() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const { account, setAccount } = useAuthStore();
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const setCollapsed = useSettingsStore((s) => s.setSidebarCollapsed);
  const [aboutOpen, setAboutOpen] = useState(false);
  const t = useT();
  const Logo = appConfig.logo;

  async function logout() {
    await platform.auth.logout();
    setAccount(null);
    navigate('/', { replace: true });
  }

  // Fall back to the old behaviour for accounts saved before profiles existed.
  const label = account?.name
    ? firstName(account.name)
    : account?.guest
      ? t('nav.guest')
      : account?.id;
  const initial = account?.name
    ? initialOf(account.name)
    : account?.guest
      ? 'G'
      : (account?.id[0]?.toUpperCase() ?? '?');

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-line bg-surface px-3 py-3 transition-[width] duration-200 ease-out ${
        collapsed ? 'w-16' : 'w-[15rem]'
      }`}
    >
      {/* Brand + the collapse control. Collapsed, the logo tile becomes the
          expand button so the rail never costs more than one icon of width. */}
      <div
        className={`mb-5 flex shrink-0 items-center ${collapsed ? 'justify-center' : 'gap-2.5 px-1'}`}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title={t('nav.expand')}
            aria-label={t('nav.expand')}
            aria-expanded={false}
            className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-control outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
          >
            <span className="brand-gradient absolute inset-0 rounded-control transition-opacity group-hover:opacity-0" />
            <Logo size={20} className="relative text-white group-hover:hidden" />
            <PanelLeftOpen size={18} className="relative hidden text-fg group-hover:block" />
          </button>
        ) : (
          <>
            <span className="brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-white shadow-e2">
              <Logo size={19} />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[15px] font-bold tracking-tight">{appConfig.name}</p>
              <p className="truncate text-[11px] text-fg-subtle">{t('brand.tagline')}</p>
            </div>
            <IconAction
              icon={PanelLeftClose}
              label={t('nav.collapse')}
              onClick={() => setCollapsed(true)}
            />
          </>
        )}
      </div>

      {/* The one part that may not fit: `min-h-0` is what lets a flex child
          actually shrink below its content, without which the overflow escapes
          the sidebar entirely. */}
      <nav
        aria-label={t('nav.label')}
        className="dt-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"
      >
        {GROUPS.map((group, gi) => (
          <div key={group.heading ?? `g${gi}`} className="flex flex-col gap-0.5">
            {/* A caption when there is room for one, a rule when there is not,
                and nothing at all above the first band. */}
            {gi > 0 &&
              (collapsed || !group.heading ? (
                <span aria-hidden className="mx-2 my-2 h-px bg-line" />
              ) : (
                <span className="mt-4 mb-1 px-3 text-[10.5px] font-semibold tracking-[0.1em] text-fg-subtle uppercase">
                  {t(group.heading)}
                </span>
              ))}
            {group.links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={collapsed ? t(label) : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-control text-[13.5px] font-medium transition-[background-color,color] duration-150 ${
                    collapsed ? 'h-10 justify-center' : 'gap-2.5 px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-accent-soft font-semibold text-accent-soft-fg'
                      : 'text-fg-muted hover:bg-surface-hover hover:text-fg'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Left marker carries the active state when labels are hidden. */}
                    {isActive && (
                      <span
                        aria-hidden
                        className="bg-accent absolute top-1/2 -left-3 h-4 w-[3px] -translate-y-1/2 rounded-r-full"
                      />
                    )}
                    <Icon
                      size={17}
                      className={`shrink-0 transition-colors ${isActive ? 'text-accent-text' : 'text-fg-subtle group-hover:text-fg-muted'}`}
                    />
                    {!collapsed && <span className="truncate">{t(label)}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Language sits with About: both are about the app rather than the
          practice, and both have to be reachable from the collapsed rail. */}
      <div className="flex shrink-0 flex-col gap-1 pt-3">
        <LanguageMenu collapsed={collapsed} />
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          title={collapsed ? t('nav.about') : undefined}
          className={`group flex w-full cursor-pointer items-center rounded-control text-[13.5px] font-medium text-fg-muted outline-none transition-colors duration-150 hover:bg-surface-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-ring ${
            collapsed ? 'h-10 justify-center' : 'gap-2.5 px-3 py-2'
          }`}
        >
          <Info size={17} className="shrink-0 text-fg-subtle group-hover:text-fg-muted" />
          {!collapsed && t('nav.about')}
        </button>
      </div>

      {/* Who is signed in, as one card with the sign-out inside it. Expanded,
          the button is an icon at the end of the row rather than a full-width
          destructive strip under the name — nobody needs "Log out" to be the
          widest target in the sidebar. */}
      <div className="mt-3 shrink-0 border-t border-line pt-3">
        <div
          className={`flex items-center rounded-control bg-surface-2 ring-1 ring-line ${
            collapsed ? 'justify-center p-1.5' : 'gap-2.5 p-2'
          }`}
          title={collapsed ? (label ?? '') : undefined}
        >
          <span className="brand-accent-gradient flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-e1">
            {initial}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-fg">
              {label}
            </span>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              title={t('nav.logout')}
              aria-label={t('nav.logout')}
              className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-inner text-fg-subtle outline-none transition-colors hover:bg-danger-soft hover:text-danger-text focus-visible:ring-2 focus-visible:ring-accent-ring"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={logout}
            title={t('nav.logout')}
            aria-label={t('nav.logout')}
            className="mt-1 flex h-10 w-full cursor-pointer items-center justify-center rounded-control text-fg-subtle outline-none transition-colors hover:bg-danger-soft hover:text-danger-text focus-visible:ring-2 focus-visible:ring-accent-ring"
          >
            <LogOut size={17} className="shrink-0" />
          </button>
        )}
      </div>

      {aboutOpen && <AboutPanel onClose={() => setAboutOpen(false)} />}
    </aside>
  );
}

function IconAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-inner text-fg-subtle outline-none transition-colors hover:bg-surface-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-ring"
    >
      <Icon size={16} />
    </button>
  );
}
