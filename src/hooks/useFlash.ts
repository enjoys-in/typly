import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A boolean that turns itself off again — for momentary feedback (a rejected
 * keystroke, a copied value). Re-triggering restarts the window rather than
 * stacking timers.
 */
export function useFlash(ms = 220): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const timer = useRef(0);

  const flash = useCallback(() => {
    window.clearTimeout(timer.current);
    setOn(true);
    timer.current = window.setTimeout(() => setOn(false), ms);
  }, [ms]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return [on, flash];
}
