import { Suspense, useEffect, type CSSProperties } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { usePlatform } from '@/platform/PlatformContext';
import { useChromeStore } from '@/store/chromeStore';
import { usePracticeReminder } from '@/hooks/usePracticeReminder';
import { useSampleLibrary } from '@/hooks/useSampleLibrary';
import { useShellBridge } from '@/hooks/useShellBridge';
import { loadStoredFonts, loadDesktopFontCache } from '@/ui/fonts';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { WhatsNew } from '@/components/whatsnew/WhatsNew';
import { PageSkeleton } from '@/ui/Skeleton';
import { needsTitlebarInset } from '@/platform/detect';
import { TITLEBAR_INSET } from '@/core/ipc/shell';
import { useT } from '@/i18n';

export function AppShell() {
  const { pathname } = useLocation();
  const platform = usePlatform();
  // Exam-day mode asks for the app's furniture to be taken away.
  const bare = useChromeStore((s) => s.bare);
  const t = useT();

  usePracticeReminder();
  // A signed-in (or guest) account gets the demo paragraph on first open.
  useSampleLibrary();
  // Tray / dock / jump-list routes in, practice status out, files opened with
  // Typly routed to New Test. Inert on the web.
  useShellBridge();

  // Re-register previously uploaded Hindi fonts on load.
  useEffect(() => {
    void loadStoredFonts((key) => platform.repo.getSetting(key));
    void loadDesktopFontCache();
  }, [platform]);
  // macOS paints the window buttons over the page, so the content has to start
  // below them. Published as a custom property as well as real layout space,
  // because anything sizing itself against the viewport — the exam screen — has
  // to subtract the same amount.
  const inset = needsTitlebarInset() ? TITLEBAR_INSET : 0;

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ '--titlebar-inset': `${inset}px` } as CSSProperties}
    >
      {/* First stop for a keyboard user: past the whole sidebar in one press. */}
      <a href="#main" className="sr-only skip-link">
        {t('nav.skipToContent')}
      </a>
      {/* Clearance for the traffic lights — and the only grip for dragging the
          window, since a hidden title bar leaves nowhere else to grab it. */}
      {inset > 0 && (
        <div
          aria-hidden
          className="shrink-0"
          style={{ height: inset, WebkitAppRegion: 'drag' } as CSSProperties}
        />
      )}
      <div className="flex min-h-0 flex-1">
        {!bare && <Sidebar />}
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 overflow-y-auto outline-none">
          {/* The vertical padding here is load-bearing: the exam screen sizes
              itself as 100vh minus 4rem, which is exactly this py-8. Capped and
              centred so a page does not stretch to 2000px on a wide display. */}
          <div
            className={
              bare
                ? 'px-4 py-4'
                : 'mx-auto w-full max-w-[104rem] px-6 py-8 sm:px-8'
            }
          >
            {/* Suspense sits inside the shell so a route change only skeletons
                the content area — the sidebar never flashes. Keyed on the path
                so each navigation gets a fresh boundary. */}
            <Suspense key={pathname} fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
      {/* Once per install, pointed at the sidebar links — never over an exam. */}
      {!bare && <OnboardingTour />}
      {/* Once per release, and reachable from About any time after that. */}
      {!bare && <WhatsNew />}
    </div>
  );
}
