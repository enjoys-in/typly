import { ArrowRight, Layers } from 'lucide-react';
import type { DeckStats } from '@/core/review/review';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

interface Props {
  stats: DeckStats;
  onOpen: () => void;
}

/**
 * The queue, on the screen you land on.
 *
 * A count is the point. "Here are your worst keys" is a report and invites
 * nothing; "12 to review" is a number that goes down, which is the only reason
 * anyone opens a practice app on a day they had not planned to.
 *
 * Hidden entirely until there is a deck — a new user has no mistakes yet, and
 * an empty queue on a first run reads as a broken feature.
 */
export function ReviewCard({ stats, onOpen }: Props) {
  const t = useT();
  if (stats.total === 0) return null;

  const due = stats.due;

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${
            due > 0 ? 'brand-gradient text-white shadow-e2' : 'bg-surface-2 text-fg-subtle ring-1 ring-line ring-inset'
          }`}
        >
          <Layers size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
            {t('review.dashTitle')}
          </p>
          <p className="mt-0.5 text-[1.375rem] leading-none font-bold tracking-tight">
            {due === 0
              ? t('review.dashNone')
              : due === 1
                ? t('review.dashDueOne')
                : t('review.dashDue', { count: due })}
          </p>
          <p className="mt-1.5 text-[13px] text-fg-muted">{t('review.dashHint')}</p>
        </div>
      </div>
      <Button variant={due > 0 ? 'primary' : 'secondary'} onClick={onOpen}>
        {t('review.open')} <ArrowRight size={15} />
      </Button>
    </Card>
  );
}
