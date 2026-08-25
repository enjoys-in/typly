import { useEffect, useRef } from 'react';

// Keeps the screen (and thus the system) from auto-locking while `active`.
// Re-acquires the lock after tab visibility returns. No-ops where unsupported.
export function useWakeLock(active: boolean): void {
  const sentinel = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let cancelled = false;

    async function acquire() {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          void lock.release();
          return;
        }
        sentinel.current = lock;
      } catch {
        // Denied or not allowed (e.g. tab not visible) — ignore.
      }
    }

    function onVisible() {
      if (document.visibilityState === 'visible') void acquire();
    }

    void acquire();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel.current?.release();
      sentinel.current = null;
    };
  }, [active]);
}
