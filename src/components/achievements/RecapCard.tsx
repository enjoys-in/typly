import { CalendarDays, Flame, Sparkles, TrendingUp } from 'lucide-react';
import type { MonthlyRecap } from '@/core/achievements/recap';
import { Card } from '@/ui/Card';
import { Stat } from '@/ui/Stat';
import { useT } from '@/i18n';
import { useDateFormat } from '@/hooks/useDateFormat';

interface Props {
  recap: MonthlyRecap;
}

/**
 * "Your September" — the reward ladder that does not run out.
 *
 * Ten badges topping out at a seven-day streak is exhausted inside a fortnight,
 * and after that there is nothing left to earn. A monthly recap has as many
 * rungs as there are months, and it is built entirely from history that was
 * already being stored.
 */
export function RecapCard({ recap }: Props) {
  const t = useT();
  const d = useDateFormat();

  if (recap.empty) {
    return (
      <Card className="space-y-1">
        <h2 className="font-semibold">{t('recap.title', { month: recap.label })}</h2>
        <p className="text-sm text-fg-muted">{t('recap.empty')}</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <CalendarDays size={16} className="shrink-0 text-fg-subtle" />
          {t('recap.title', { month: recap.label })}
        </h2>
        <p className="mt-0.5 text-sm text-fg-muted">
          {recap.gained === null
            ? t('recap.subtitleFirst', { tests: recap.tests, hours: recap.hours })
            : t(recap.gained >= 0 ? 'recap.subtitleUp' : 'recap.subtitleDown', {
                tests: recap.tests,
                hours: recap.hours,
                gained: Math.abs(recap.gained),
              })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label={t('recap.hours')} value={String(recap.hours)} hint={t('recap.hoursHint')} />
        <Stat label={t('recap.tests')} value={String(recap.tests)} hint={t('recap.passed', { count: recap.passed })} />
        <Stat
          label={t('recap.best')}
          value={String(recap.bestNet)}
          hint={t('recap.average', { value: recap.averageNet })}
          accent
        />
        <Stat
          label={t('recap.activeDays')}
          value={String(recap.activeDays)}
          hint={t('recap.bestStreak', { count: recap.bestStreak })}
        />
      </div>

      <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
        {recap.bestDay && (
          <Line icon={Flame} label={t('recap.bestDay')}>
            {t('recap.bestDayValue', {
              date: d.dateShort(`${recap.bestDay.day}T12:00:00`),
              tests: recap.bestDay.tests,
              wpm: recap.bestDay.bestNet,
            })}
          </Line>
        )}
        {recap.gained !== null && (
          <Line icon={TrendingUp} label={t('recap.gained')}>
            {t(recap.gained >= 0 ? 'recap.gainedUp' : 'recap.gainedDown', {
              value: Math.abs(recap.gained),
            })}
          </Line>
        )}
        {recap.keysFixed.length > 0 && (
          <Line icon={Sparkles} label={t('recap.keysFixed')}>
            <span className="font-mono">{recap.keysFixed.join(' ')}</span>
          </Line>
        )}
      </div>
    </Card>
  );
}

function Line({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Flame;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="mt-0.5 shrink-0 text-fg-subtle" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-wide text-fg-muted uppercase">{label}</p>
        <p className="text-sm">{children}</p>
      </div>
    </div>
  );
}
