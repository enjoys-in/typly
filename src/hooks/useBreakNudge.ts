import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { decideBreak, type BreakKind } from '@/core/reminder/breaks';

/** How often the session clock is checked against the break rules. */
const CHECK_MS = 30_000;

/**
 * Watches how long the app has been in use and surfaces a break prompt.
 *
 * The session clock starts when the hook mounts and is never reset by
 * navigation, because the wrists do not care which page you were on. Nothing is
 * ever shown while a run is in progress — a nudge landing mid-passage would
 * cost the attempt it was trying to protect — so a break that comes due during
 * a test simply waits for it to end.
 */
export function useBreakNudge(running: boolean): {
  due: BreakKind | null;
  dismiss: () => void;
} {
  const enabled = useSettingsStore((s) => s.breakNudges);
  const dnd = useSettingsStore((s) => s.dnd);
  const [due, setDue] = useState<BreakKind | null>(null);
  const startedAt = useRef(Date.now());
  const lastEye = useRef<number | null>(null);
  const lastPosture = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDue(null);
      return;
    }
    const check = () => {
      const decision = decideBreak({
        sessionMinutes: (Date.now() - startedAt.current) / 60_000,
        lastEyeMinute: lastEye.current,
        lastPostureMinute: lastPosture.current,
        running,
        dnd,
      });
      if (decision.due) setDue(decision.due);
    };
    check();
    const id = setInterval(check, CHECK_MS);
    return () => clearInterval(id);
  }, [enabled, running, dnd]);

  // Dismissing records the mark, which is what stops the same nudge repeating
  // on the next check thirty seconds later.
  const dismiss = useCallback(() => {
    const minute = Math.floor((Date.now() - startedAt.current) / 60_000);
    if (due === 'eye') lastEye.current = minute;
    if (due === 'posture') {
      lastPosture.current = minute;
      // A posture break involves looking up anyway, so it satisfies the eye
      // break too — otherwise the two arrive back to back.
      lastEye.current = minute;
    }
    setDue(null);
  }, [due]);

  return { due, dismiss };
}
