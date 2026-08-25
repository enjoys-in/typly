import { useCallback, useEffect, useRef } from 'react';

interface Options {
  active: boolean;
  idleMs: number;
  onIdle: () => void;
  onAway: () => void;
}

// Fires `onIdle` once after `idleMs` without typing, and `onAway` when the user
// switches tab/window during the test. Call the returned `ping` on each keystroke.
export function useActivityMonitor({ active, idleMs, onIdle, onAway }: Options): () => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleFired = useRef(false);
  const onIdleRef = useRef(onIdle);
  const onAwayRef = useRef(onAway);
  onIdleRef.current = onIdle;
  onAwayRef.current = onAway;

  const ping = useCallback(() => {
    idleFired.current = false;
    if (timer.current) clearTimeout(timer.current);
    if (!active) return;
    timer.current = setTimeout(() => {
      idleFired.current = true;
      onIdleRef.current();
    }, idleMs);
  }, [active, idleMs]);

  useEffect(() => {
    if (!active) {
      if (timer.current) clearTimeout(timer.current);
      return;
    }
    ping();
    const onAwayEvent = () => onAwayRef.current();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') onAwayRef.current();
    };
    window.addEventListener('blur', onAwayEvent);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener('blur', onAwayEvent);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active, ping]);

  return ping;
}
