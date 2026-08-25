import { useEffect, useRef, useState } from 'react';

export interface Countdown {
  elapsedMs: number;
  remainingSec: number;
  expired: boolean;
}

// Counts down from durationSec while `running`; reports elapsed + remaining + expiry.
export function useCountdown(durationSec: number, running: boolean): Countdown {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now() - elapsedMs;
    const id = setInterval(() => {
      if (startRef.current !== null) setElapsedMs(Date.now() - startRef.current);
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const remainingSec = Math.max(0, Math.ceil(durationSec - elapsedMs / 1000));
  return { elapsedMs, remainingSec, expired: remainingSec <= 0 };
}
