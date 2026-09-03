import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import { SETTING_KEY } from '@/core/constants';
import { Tour, type TourStep } from './Tour';

/**
 * The three places a new user needs to know about. Targets are the sidebar
 * links, addressed by their route so the tour survives label changes.
 */
const STEPS: TourStep[] = [
  {
    target: 'a[href="#/app/new"]',
    title: 'Start with a passage',
    body: 'Paste text, or drop in an image, PDF or document — OCR runs on your machine. That becomes your typing test.',
  },
  {
    target: 'a[href="#/app/trainer"]',
    title: 'Drill your weak spots',
    body: 'After a few tests, the Trainer builds drills from your own results: the keys you get wrong, and the transitions that cost you time.',
  },
  {
    target: 'a[href="#/app/history"]',
    title: 'Watch it improve',
    body: 'Every attempt is saved with its mistakes and a full replay, so you can see exactly where the time went.',
  },
];

/**
 * Runs the walkthrough once per install.
 *
 * The flag is written when the tour is *finished or skipped*, not when it
 * opens. Writing it up front looked tidier but meant that any remount between
 * the read and the open — a re-render of the shell, an effect running twice —
 * left the flag set with the tour never having appeared.
 */
export function OnboardingTour() {
  const platform = usePlatform();
  const [open, setOpen] = useState(false);
  // Read by the unmount handler, which must not close over a stale `open`.
  const shown = useRef(false);
  shown.current = shown.current || open;

  const markDone = useCallback(() => {
    void platform.repo.setSetting(SETTING_KEY.TourDone, 'true').catch(() => {});
  }, [platform]);

  useEffect(() => {
    let alive = true;
    void platform.repo
      .getSetting(SETTING_KEY.TourDone)
      .then((done) => {
        if (alive && !done) setOpen(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [platform]);

  // Seen counts as done, whether it was finished, skipped, or simply left
  // behind by navigating on — nobody should meet this twice.
  useEffect(() => {
    return () => {
      if (shown.current) markDone();
    };
  }, [markDone]);

  const close = useCallback(() => {
    setOpen(false);
    markDone();
  }, [markDone]);

  return open ? <Tour steps={STEPS} onDone={close} /> : null;
}
