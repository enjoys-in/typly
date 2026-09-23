import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/ui/Button';
import { useT } from '@/i18n';

interface Props {
  /** Seconds to count. */
  seconds: number;
  /** Called once the count reaches zero, or when the typist skips it. */
  onDone: () => void;
}

/**
 * The three seconds between arriving at the test and the clock starting.
 *
 * Without it the run begins the instant the screen does: the timer is already
 * counting while the candidate is still looking for the home row, and those
 * seconds are charged to the score like typed ones. Every skill test gives a
 * "your test begins now" screen for the same reason.
 *
 * It covers the screen rather than sitting in a corner, and the backdrop is
 * blurred, so the passage behind it cannot be read ahead during the count —
 * three free seconds of reading would be a different exam.
 */
export function CountIn({ seconds, onDone }: Props) {
  const t = useT();
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) {
      onDone();
      return;
    }
    const id = setTimeout(() => setLeft((n) => n - 1), 1_000);
    return () => clearTimeout(id);
  }, [left, onDone]);

  return (
    <div
      // Inside the run's own root, not a portal: in full screen only that
      // subtree is painted, and an overlay outside it would simply not appear.
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-canvas/85 px-6 text-center backdrop-blur-md"
    >
      <p className="text-sm font-semibold tracking-[0.18em] text-fg-muted uppercase">
        {t('countIn.title')}
      </p>
      {/* Keyed on the number so each tick re-runs the animation, and announced
          on its own — the heading and the hint do not change, and a screen
          reader repeating them three times would drown out the count. */}
      <span
        key={left}
        aria-live="assertive"
        aria-atomic="true"
        className="count-in-tick font-mono text-[clamp(4rem,18vh,7.5rem)] leading-none font-bold text-accent-text slashed-zero tabular-nums"
      >
        {left}
      </span>
      <p className="max-w-sm text-[15px] leading-relaxed font-medium text-fg">
        {t('countIn.hint')}
      </p>
      <Button size="sm" variant="secondary" onClick={onDone}>
        <Play size={14} /> {t('countIn.startNow')}
      </Button>
      <p className="text-xs text-fg-subtle">{t('countIn.turnOff')}</p>
    </div>
  );
}
