import { BookOpen, Play } from 'lucide-react';
import { Button } from '@/ui/Button';
import { useT } from '@/i18n';

interface Props {
  remainingSec: number;
  onStart: () => void;
}

/**
 * The reading window before a mock exam starts: the passage is on screen and
 * the clock is not running yet, exactly as in a real skill test.
 */
export function ReadingBanner({ remainingSec, onStart }: Props) {
  const t = useT();

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 rounded-panel border border-accent-border bg-accent-soft px-4 py-3 shadow-e1">
      <p className="flex items-center gap-2.5 text-[13.5px] font-semibold text-accent-soft-fg">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-accent-soft-fg/10 ring-1 ring-accent-border ring-inset">
          <BookOpen size={16} />
        </span>
        {t('reading.banner')}
      </p>
      <div className="flex items-center gap-3">
        {/* Same clock face as the run's, so the number the candidate is
            watching does not change shape when the test begins. */}
        <span className="font-mono text-[1.375rem] leading-none font-bold tracking-tight text-accent-soft-fg slashed-zero tabular-nums">
          {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, '0')}
        </span>
        <Button size="sm" onClick={onStart}>
          <Play size={14} /> {t('reading.startNow')}
        </Button>
      </div>
    </div>
  );
}
