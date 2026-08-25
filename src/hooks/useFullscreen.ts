import { useCallback, useEffect, useState, type RefObject } from 'react';

interface FullscreenApi {
  isFullscreen: boolean;
  supported: boolean;
  enter: () => void;
  exit: () => void;
  toggle: () => void;
}

// Wraps the Fullscreen API for one element; tracks state and degrades if unsupported.
export function useFullscreen(target: RefObject<HTMLElement | null>): FullscreenApi {
  const supported = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement != null);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const enter = useCallback(() => {
    const el = target.current;
    if (supported && el && document.fullscreenElement == null) {
      void el.requestFullscreen().catch(() => undefined);
    }
  }, [supported, target]);

  const exit = useCallback(() => {
    if (document.fullscreenElement != null) void document.exitFullscreen().catch(() => undefined);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement != null) exit();
    else enter();
  }, [enter, exit]);

  return { isFullscreen, supported, enter, exit, toggle };
}
