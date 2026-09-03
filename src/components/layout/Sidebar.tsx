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
  type LucideIcon,
} from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { appConfig } from '@/config/appConfig';
import { AboutPanel } from './AboutPanel';

const LINKS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/new', label: 'New Test', icon: PlusCircle },
  { to: '/app/lessons', label: 'Lessons', icon: GraduationCap },
  { to: '/app/practice', label: 'Practice', icon: Dumbbell },
  { to: '/app/trainer', label: 'Trainer', icon: Crosshair },
  { to: '/app/library', label: 'Library', icon: Library },
  { to: '/app/history', label: 'History', icon: HistoryIcon },
  { to: '/app/progress', label: 'Progress', icon: TrendingUp },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
];

export function Sidebar() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const { account, setAccount } = useAuthStore();
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const setCollapsed = useSettingsStore((s) => s.setSidebarCollapsed);
  const [aboutOpen, setAboutOpen] = useState(false);
  const Logo = appConfig.logo;

  async function logout() {
    await platform.auth.logout();
    setAccount(null);
    navigate('/', { replace: true });
  }

  const initial = account?.guest ? 'G' : (account?.id[0]?.toUpperCase() ?? '?');

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-line bg-surface p-3 transition-[width] duration-200 ease-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand + the collapse control. Collapsed, the logo tile becomes the
          expand button so the rail never costs more than one icon of width. */}
      <div className={`mb-6 flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-1'}`}>
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            aria-expanded={false}
            className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-control outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
          >
            <span className="brand-gradient absolute inset-0 rounded-control transition-opacity group-hover:opacity-0" />
            <Logo size={20} className="relative text-white group-hover:hidden" />
            <PanelLeftOpen size={18} className="relative hidden text-fg group-hover:block" />
          </button>
        ) : (
          <>
            <span className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-white">
              <Logo size={20} />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate font-bold">{appConfig.name}</p>
              <p className="truncate text-xs text-fg-muted">{appConfig.tagline}</p>
            </div>
            <IconAction
              icon={PanelLeftClose}
              label="Collapse sidebar"
              onClick={() => setCollapsed(true)}
            />
          </>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `relative flex items-center rounded-control text-sm font-medium transition-colors duration-150 ${
                collapsed ? 'h-10 justify-center' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-accent-soft text-accent-soft-fg'
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
                    className="bg-accent absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full"
                  />
                )}
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-3">
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          title={collapsed ? 'About' : undefined}
          className={`flex w-full cursor-pointer items-center rounded-control text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:bg-surface-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-ring ${
            collapsed ? 'h-10 justify-center' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <Info size={18} className="shrink-0" />
          {!collapsed && 'About'}
        </button>
      </div>

      <div className="border-t border-line pt-3">
        <div
          className={`mb-2 flex items-center ${collapsed ? 'justify-center' : 'gap-2 px-1'}`}
          title={collapsed ? (account?.guest ? 'Guest' : (account?.id ?? '')) : undefined}
        >
          <span className="brand-accent-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
            {initial}
          </span>
          {!collapsed && (
            <span className="truncate text-sm text-fg-muted">
              {account?.guest ? 'Guest' : account?.id}
            </span>
          )}
        </div>
        <button
          onClick={logout}
          title={collapsed ? 'Log out' : undefined}
          className={`flex w-full cursor-pointer items-center rounded-control text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:bg-danger-soft hover:text-danger-text focus-visible:ring-2 focus-visible:ring-accent-ring ${
            collapsed ? 'h-10 justify-center' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && 'Log out'}
        </button>
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
