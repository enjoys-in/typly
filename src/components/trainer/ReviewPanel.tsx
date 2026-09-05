import { CalendarCheck, CheckCircle2, Layers, Play } from 'lucide-react';
import { BOX_DAYS, MASTERED_BOX, type DeckStats, type ReviewItem } from '@/core/review/review';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

interface Props {
  due: ReviewItem[];
  stats: DeckStats;
  onStart: () => void;
}

/**
 * The review queue, as a queue.
 *
 * The heatmap next to this says "here is everything you have ever got wrong",
 * which is a diagnosis and never finishes. This says "here are ten things to do
 * today", which does — and a finishable list is the whole reason someone opens
 * the app on a day they do not want to sit a full mock.
 */
export function ReviewPanel({ due, stats, onStart }: Props) {
  const t = useT();

  if (stats.total === 0) return null;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-semibold">
            <Layers size={17} className="shrink-0 text-accent-text" />
            {t('review.title')}
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            {due.length > 0 ? t('review.dueHint', { count: due.length }) : t('review.clearHint')}
          </p>
        </div>
        {due.length > 0 && (
          <Button onClick={onStart}>
            <Play size={16} /> {t('review.start')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Tally label={t('review.due')} value={stats.due} tone="accent" />
        <Tally label={t('review.learning')} value={stats.learning} />
        <Tally label={t('review.mastered')} value={stats.mastered} />
      </div>

      {due.length > 0 ? (
        <div className="space-y-2 border-t border-line pt-4">
          <p className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-subtle uppercase">
            {t('review.today')}
          </p>
          <ul className="flex flex-wrap gap-2">
            {due.map((item) => (
              <li
                key={item.id}
                title={t('review.rung', { box: item.box + 1, of: MASTERED_BOX + 1 })}
                className="inline-flex items-center gap-2 rounded-control bg-surface-2 px-2.5 py-1.5 ring-1 ring-line ring-inset"
              >
                <span className="font-mono text-sm font-semibold">{item.value}</span>
                {/* The ladder, as pips. A card's position is the one thing a
                    review queue has to make visible, or every item looks
                    equally urgent and the schedule reads as arbitrary. */}
                <span aria-hidden className="flex gap-0.5">
                  {BOX_DAYS.map((_, rung) => (
                    <span
                      key={rung}
                      className={`h-1 w-1 rounded-full ${rung <= item.box ? 'bg-accent' : 'bg-edge'}`}
                    />
                  ))}
                </span>
                {item.lapses > 0 && (
                  <span className="text-[10px] font-semibold text-danger-text tabular-nums">
                    ×{item.lapses}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="flex items-center gap-2 border-t border-line pt-4 text-sm text-fg-muted">
          <CheckCircle2 size={15} className="shrink-0 text-accent-text" />
          {stats.mastered === stats.total ? t('review.allMastered') : t('review.nothingToday')}
        </p>
      )}

      <p className="flex items-start gap-2 text-xs leading-relaxed text-fg-subtle">
        <CalendarCheck size={13} className="mt-0.5 shrink-0" />
        {t('review.explainer')}
      </p>
    </Card>
  );
}

function Tally({ label, value, tone }: { label: string; value: number; tone?: 'accent' }) {
  return (
    <div className="rounded-panel bg-surface-2 p-3 ring-1 ring-line ring-inset">
      <p className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
        {label}
      </p>
      <p
        className={`mt-1 text-[1.5rem] leading-none font-bold tracking-tight tabular-nums ${
          tone === 'accent' && value > 0 ? 'text-accent-text' : 'text-fg'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
