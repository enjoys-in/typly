import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import type { TestRow } from '@/core/types';
import {
  formatDuration,
  practiceDays,
  practiceTotals,
  type PracticeBucket,
  type PracticeDay,
} from '@/core/analysis/practiceTime';
import { PRACTICE_DAYS } from '@/core/constants';
import { Card } from '@/ui/Card';
import { Stat } from '@/ui/Stat';
import { useT } from '@/i18n';
import { useDateFormat } from '@/hooks/useDateFormat';

/**
 * How much practice, and when.
 *
 * The rest of the progress page answers "how fast am I"; this answers "am I
 * actually putting the hours in", which is the question behind every typing
 * cut-off. Three periods across the top — today, this week, this month — and
 * then the per-day history underneath, because a total is exactly the number
 * that hides a fortnight of nothing followed by one long Sunday.
 */
export function PracticeTimeCard({ rows }: { rows: TestRow[] }) {
  const t = useT();
  const totals = useMemo(() => practiceTotals(rows), [rows]);
  const days = useMemo(() => practiceDays(rows, PRACTICE_DAYS), [rows]);
  const peak = days.reduce((max, day) => Math.max(max, day.seconds), 0);

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-accent-text" />
        <h2 className="font-semibold">{t('practice.timeTitle')}</h2>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Period label={t('practice.today')} bucket={totals.today} accent />
        <Period label={t('progress.thisWeek')} bucket={totals.week} />
        <Period label={t('progress.thisMonth')} bucket={totals.month} />
        <Period label={t('practice.allTime')} bucket={totals.allTime} />
      </div>

      <DayBars days={days} peak={peak} />

      <p className="text-xs text-fg-muted">
        {totals.activeDays > 0
          ? t('practice.perActiveDay', {
              time: formatDuration(totals.perActiveDay),
              days: totals.activeDays,
            })
          : t('practice.noneYet')}
      </p>
    </Card>
  );
}

/** One period: the time first, because that is the reading; the count under it. */
function Period({
  label,
  bucket,
  accent,
}: {
  label: string;
  bucket: PracticeBucket;
  accent?: boolean;
}) {
  const t = useT();
  return (
    <Stat
      label={label}
      value={formatDuration(bucket.seconds)}
      hint={t('practice.testCount', { count: bucket.tests })}
      accent={accent}
    />
  );
}

/**
 * Minutes typed per day, most recent on the right.
 *
 * Empty days are drawn as an empty track rather than skipped — the gaps are
 * half of what a practice history has to show. Today is tinted differently so
 * the bar that is still growing is not read as a finished one.
 */
function DayBars({ days, peak }: { days: PracticeDay[]; peak: number }) {
  const t = useT();
  const d = useDateFormat();
  const scale = Math.max(peak, 60);
  const today = days[days.length - 1]?.date;

  return (
    <div>
      <div className="flex justify-between text-[10px] text-fg-subtle">
        <span>{t('practice.perDay', { days: days.length })}</span>
        <span className="tabular-nums">
          {t('practice.peakDay', { time: formatDuration(peak) })}
        </span>
      </div>
      {/* Fixed-height track, so each bar's percentage height resolves. */}
      <div className="mt-1 flex h-28 items-end justify-center gap-1.5 border-b border-line">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex h-full flex-1 flex-col justify-end"
            title={`${d.dateShort(day.date)} · ${formatDuration(day.seconds)} · ${t(
              'practice.testCount',
              { count: day.tests },
            )}`}
          >
            <div
              className={`w-full rounded-t transition-[height] duration-300 ${
                day.seconds === 0
                  ? 'bg-surface-3'
                  : day.date === today
                    ? 'bg-accent2-soft-fg'
                    : 'bg-accent'
              }`}
              style={{
                height: day.seconds === 0 ? '2px' : `${Math.max(4, (day.seconds / scale) * 100)}%`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-center gap-1.5">
        {days.map((day) => (
          <span
            key={day.date}
            className="flex-1 truncate text-center text-[9px] tabular-nums text-fg-subtle"
          >
            {day.date.slice(8)}
          </span>
        ))}
      </div>
    </div>
  );
}
