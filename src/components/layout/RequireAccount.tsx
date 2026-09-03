import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePlatform } from '@/platform/PlatformContext';
import { FullPageLoader } from '@/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/i18n';

// Loads any existing account (guest or logged-in); redirects to Login if none.
export function RequireAccount({ children }: { children: ReactNode }) {
  const t = useT();
  const platform = usePlatform();
  const { account, setAccount } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    platform.auth.current().then((a) => {
      if (a) setAccount(a);
      setChecked(true);
    });
  }, [platform, setAccount]);

  if (!checked) return <FullPageLoader label={t('common.restoringSession')} />;
  if (!account) return <Navigate to="/" replace />;
  return <>{children}</>;
}
