import { useEffect, useRef, useState } from 'react';

/** Someone who has asked for less motion gets the number, not the climb. */
function prefersStill(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** Decelerating, so the number lands rather than stopping dead. */
function easeOut(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

/**
 * Counts from zero up to `target` once, on mount and whenever the target moves.
 *
 * Reserved for the result screen. A figure that climbs is worth watching, which
 * is exactly why it has no place on a live run: the same treatment applied to
 * the WPM readout beside a passage would pull the eye off the text on every
 * keystroke.
 */
export function useCountUp(target: number, durationMs = 750, decimals = 0): number {
  const [value, setValue] = useState(() => (prefersStill() ? target : 0));
  const frame = useRef(0);

  useEffect(() => {
    if (prefersStill()) {
      setValue(target);
      return;
    }
    const round = (n: number) => Number(n.toFixed(decimals));
    const started = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - started) / durationMs, 1);
      setValue(round(target * easeOut(p)));
      // Landing exactly on the target matters: an eased approach can otherwise
      // finish a hundredth short and display 43.99 for 44.
      if (p < 1) frame.current = requestAnimationFrame(step);
      else setValue(round(target));
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, durationMs, decimals]);

  return value;
}
