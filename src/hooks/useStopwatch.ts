import { useEffect, useRef, useState } from 'react';

// Counts up while `running` — the untimed/practice clock.
export function useStopwatch(running: boolean): { elapsedMs: number } {
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

  return { elapsedMs };
}
