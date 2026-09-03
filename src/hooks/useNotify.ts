import { useCallback, useMemo } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import { useSettingsStore } from '@/store/settingsStore';

export interface Notifier {
  /** Whether a notification sent right now would actually be shown. */
  allowed: boolean;
  /** Show one, if the user's switches allow it. */
  notify: (title: string, body?: string) => void;
  /** Ask for permission — but only when notifications could be used at all. */
  ensurePermission: () => Promise<boolean>;
}

/**
 * The one place that decides whether the app may interrupt someone.
 *
 * Three switches can silence a notification and they are checked here rather
 * than at each call site, because a notification added later would otherwise
 * quietly ignore whichever check its author forgot:
 *
 *  - the notifications preference, which the user turned on or off;
 *  - do not disturb, which holds everything without changing that preference;
 *  - `suppressed`, for a screen that must not be interrupted at all — exam-day
 *    mode passes it, since an alert during a mock exam is the whole problem.
 */
export function useNotify(suppressed = false): Notifier {
  const platform = usePlatform();
  const notify = useSettingsStore((s) => s.notify);
  const dnd = useSettingsStore((s) => s.dnd);
  const allowed = notify && !dnd && !suppressed;

  const send = useCallback(
    (title: string, body?: string) => {
      if (!allowed) return;
      platform.notifications.notify(title, body);
    },
    [allowed, platform],
  );

  const ensurePermission = useCallback(async () => {
    if (!allowed) return false;
    return platform.notifications.ensurePermission().catch(() => false);
  }, [allowed, platform]);

  return useMemo(
    () => ({ allowed, notify: send, ensurePermission }),
    [allowed, send, ensurePermission],
  );
}
