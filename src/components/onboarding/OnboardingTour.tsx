import { useCallback, useEffect, useState } from 'react';
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
 * Runs the walkthrough once per install. The flag is written as soon as the
 * tour opens, so a reload mid-tour does not start it again.
 */
export function OnboardingTour() {
  const platform = usePlatform();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    void platform.repo
      .getSetting(SETTING_KEY.TourDone)
      .then((done) => {
        if (!alive || done) return;
        // The sidebar has to be on screen before the first step can point at it.
        window.setTimeout(() => alive && setOpen(true), 600);
        return platform.repo.setSetting(SETTING_KEY.TourDone, 'true');
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [platform]);

  const close = useCallback(() => setOpen(false), []);

  return open ? <Tour steps={STEPS} onDone={close} /> : null;
}
