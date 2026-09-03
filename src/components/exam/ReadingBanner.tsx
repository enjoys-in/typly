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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-accent-border bg-accent-soft px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-medium text-accent-soft-fg">
        <BookOpen size={16} className="shrink-0" />
        {t('reading.banner')}
      </p>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tabular-nums text-accent-soft-fg">
          {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, '0')}
        </span>
        <Button size="sm" onClick={onStart}>
          <Play size={14} /> {t('reading.startNow')}
        </Button>
      </div>
    </div>
  );
}
