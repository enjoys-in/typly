import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useAuthStore } from '@/store/authStore';
import type { Profile } from '@/core/profile/profile';
import { AuthCard } from '@/components/landing/AuthCard';
import { BrandPanel } from '@/components/landing/BrandPanel';

export function Login() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const { account, setAccount } = useAuthStore();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    platform.auth
      .current()
      .then((a) => a && setAccount(a))
      .finally(() => setChecked(true));
  }, [platform, setAccount]);

  useEffect(() => {
    if (account) navigate('/app', { replace: true });
  }, [account, navigate]);

  async function continueAsGuest(profile: Profile) {
    setBusy(true);
    try {
      setAccount(await platform.auth.continueAsGuest(profile));
    } finally {
      setBusy(false);
    }
  }

  // Hold the screen blank until the stored session resolves, so returning users
  // don't see the landing flash before the redirect.
  if (!checked || account) return <div className="h-full bg-canvas" />;

  return (
    <div className="flex h-full flex-col bg-canvas">
      <TopBar />
      {/* Two panes side by side on wide windows; stacked and scrollable when narrow. */}
      <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <div className="grid min-h-full lg:h-full lg:grid-cols-[1.05fr_1fr]">
          <BrandPanel />
          <AuthCard onGuest={continueAsGuest} busy={busy} />
        </div>
      </div>
    </div>
  );
}

/** Slim window strip: drag handle on desktop, status line everywhere. */
function TopBar() {
  return (
    <header className="drag-region flex h-10 shrink-0 items-center justify-end border-b border-line px-4">
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-fg-subtle">
        <WifiOff size={12} />
        Works offline
      </span>
    </header>
  );
}
