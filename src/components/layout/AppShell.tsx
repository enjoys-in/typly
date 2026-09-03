import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { usePlatform } from '@/platform/PlatformContext';
import { usePracticeReminder } from '@/hooks/usePracticeReminder';
import { useSampleLibrary } from '@/hooks/useSampleLibrary';
import { useShellBridge } from '@/hooks/useShellBridge';
import { loadStoredFonts, loadDesktopFontCache } from '@/ui/fonts';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { PageSkeleton } from '@/ui/Skeleton';

export function AppShell() {
  const { pathname } = useLocation();
  const platform = usePlatform();

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
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="h-full flex-1 overflow-y-auto">
        <div className="px-6 py-8 sm:px-8">
          {/* Suspense sits inside the shell so a route change only skeletons the
              content area — the sidebar never flashes. Keyed on the path so each
              navigation gets a fresh boundary instead of reusing a resolved one. */}
          <Suspense key={pathname} fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      {/* Once per install, pointed at the sidebar links. */}
      <OnboardingTour />
    </div>
  );
}
