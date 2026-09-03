import { useState } from 'react';
import { CalendarClock, CalendarPlus, Check, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { boardsByCategory, profileFor, shortNameFor } from '@/core/scoring/examProfiles';
import { daysToProjection, type Readiness } from '@/core/exam/readiness';
import { isTargetDate, type ExamTarget } from '@/core/exam/target';
import { ExamBoard, Lang } from '@/core/constants';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ProgressBar } from '@/ui/ProgressBar';
import { Stat } from '@/ui/Stat';
import { useDateFormat } from '@/hooks/useDateFormat';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n/en';

interface Props {
  target: ExamTarget | null;
  /** Null until there is a target to measure against. */
  readiness: Readiness | null;
  /** What to offer first when nothing is set — the practice defaults. */
  defaultBoard: ExamBoard;
  defaultLang: Lang;
  onSave: (target: ExamTarget) => void;
  onClear: () => void;
}

/** Which verdict gets which line, so the copy lives with the dictionary. */
const VERDICT_KEY: Record<Readiness['verdict'], TKey> = {
  passed: 'countdown.verdictPassed',
  noData: 'countdown.verdictNoData',
  ready: 'countdown.verdictReady',
  onTrack: 'countdown.verdictOnTrack',
  behind: 'countdown.verdictBehind',
};

const VERDICT_TONE: Record<Readiness['verdict'], string> = {
  passed: 'text-fg-muted',
  noData: 'text-fg-muted',
  ready: 'text-accent-text',
  onTrack: 'text-accent-text',
  behind: 'text-danger-text',
};

/**
 * The exam being prepared for, and whether the current rate of improvement
 * gets there in time.
 *
 * Every number here already existed in the app — past attempts, and the
 * cut-off of the chosen exam — but only ever as a record of what happened.
 * Pointing them forward is what makes a daily reminder worth acting on: not
 * "practise today", but "you are four words short and there are 68 days left".
 */
export function ExamCountdownCard({
  target,
  readiness,
  defaultBoard,
  defaultLang,
  onSave,
  onClear,
}: Props) {
  const t = useT();
  const d = useDateFormat();
  const [editing, setEditing] = useState(false);

  if (!target || !readiness || editing) {
    return (
      <TargetForm
        target={target}
        defaultBoard={defaultBoard}
        defaultLang={defaultLang}
        onCancel={target ? () => setEditing(false) : null}
        onSave={(next) => {
          setEditing(false);
          onSave(next);
        }}
      />
    );
  }

  const { daysLeft, verdict } = readiness;
  const progress = readiness.requiredWpm > 0 ? (readiness.netWpm / readiness.requiredWpm) * 100 : 0;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-fg-muted uppercase">
            <CalendarClock size={13} /> {shortNameFor(target.board)} ·{' '}
            {t(`lang.${target.lang}`)}
          </p>
          <p className="text-2xl font-bold tabular-nums">{daysLine(daysLeft, t)}</p>
          <p className="text-xs text-fg-muted">{d.date(target.date)}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil size={14} /> {t('countdown.change')}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear}>
            <Trash2 size={14} /> {t('countdown.clear')}
          </Button>
        </div>
      </div>

      {/* Where you are against what the exam asks for. */}
      <div className="flex flex-wrap gap-6 border-t border-line pt-4">
        <Stat
          label={t('countdown.yourSpeed')}
          value={`${readiness.netWpm}`}
          hint={t('countdown.needed', { value: readiness.requiredWpm })}
          accent
        />
        <Stat
          label={t('countdown.yourAccuracy')}
          value={`${readiness.accuracy}%`}
          hint={t('countdown.needed', { value: `${readiness.requiredAccuracy}%` })}
        />
        {readiness.trendPerDay !== null && (
          <Stat
            label={t('countdown.trend')}
            value={`${readiness.trendPerDay > 0 ? '+' : ''}${readiness.trendPerDay}`}
            hint={t('countdown.perDay')}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <ProgressBar value={progress} />
        <p className={`flex items-start gap-1.5 text-sm ${VERDICT_TONE[verdict]}`}>
          {verdict === 'ready' ? (
            <Check size={15} className="mt-0.5 shrink-0" />
          ) : (
            <TrendingUp size={15} className="mt-0.5 shrink-0" />
          )}
          <span>{t(VERDICT_KEY[verdict], verdictParams(readiness, d.date))}</span>
        </p>
      </div>

      {readiness.attempts > 0 && (
        <p className="text-xs text-fg-subtle">
          {readiness.minutesPerDay > 0
            ? t('countdown.habit', {
                minutes: readiness.minutesPerDay,
                days: readiness.activeDays,
              })
            : t('countdown.habitNone')}
        </p>
      )}
    </Card>
  );
}

/** "68 days left", and the two days that deserve their own words. */
function daysLine(daysLeft: number, t: (key: TKey, params?: Record<string, string | number>) => string): string {
  if (daysLeft < 0) return t('countdown.gone');
  if (daysLeft === 0) return t('countdown.today');
  if (daysLeft === 1) return t('countdown.tomorrow');
  return t('countdown.daysLeft', { days: daysLeft });
}

/**
 * Everything a verdict line might want to say. Unused placeholders are simply
 * not present in the sentence that gets picked.
 */
function verdictParams(
  readiness: Readiness,
  formatDate: (value: string) => string,
): Record<string, string | number> {
  return {
    wpm: readiness.wpmGap,
    accuracy: readiness.accuracyGap,
    date: readiness.projectedDate ? formatDate(readiness.projectedDate) : '',
    days: readiness.projectedDate ? daysToProjection(readiness.projectedDate) : 0,
    perDay: readiness.neededPerDay ?? 0,
    minutes: readiness.minutesPerDay,
  };
}

/** Setting or changing the target: which exam, and when. */
function TargetForm({
  target,
  defaultBoard,
  defaultLang,
  onSave,
  onCancel,
}: {
  target: ExamTarget | null;
  defaultBoard: ExamBoard;
  defaultLang: Lang;
  onSave: (target: ExamTarget) => void;
  /** Null while there is nothing to go back to. */
  onCancel: (() => void) | null;
}) {
  const t = useT();
  const [board, setBoard] = useState<ExamBoard>(target?.board ?? defaultBoard);
  const [lang, setLang] = useState<Lang>(target?.lang ?? defaultLang);
  const [date, setDate] = useState(target?.date ?? '');
  const valid = isTargetDate(date);

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <CalendarPlus size={16} className="text-accent-text" /> {t('countdown.setTitle')}
        </h2>
        <p className="mt-1 text-xs text-fg-muted">{t('countdown.setLead')}</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-56 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">{t('countdown.exam')}</span>
          <select
            value={board}
            onChange={(e) => setBoard(e.target.value as ExamBoard)}
            aria-label={t('countdown.exam')}
            className="select"
          >
            {boardsByCategory().map((group) => (
              <optgroup key={group.category} label={group.category}>
                {group.boards.map((option) => (
                  <option key={option} value={option}>
                    {profileFor(option).name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">{t('countdown.lang')}</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            aria-label={t('countdown.lang')}
            className="select w-36"
          >
            {Object.values(Lang).map((option) => (
              <option key={option} value={option}>
                {t(`lang.${option}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">{t('countdown.date')}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label={t('countdown.date')}
            className="select w-44"
          />
        </label>
        <div className="flex gap-2">
          <Button onClick={() => valid && onSave({ board, date, lang })} disabled={!valid}>
            {t('countdown.save')}
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              {t('countdown.cancel')}
            </Button>
          )}
        </div>
      </div>

      {date !== '' && !valid && <p className="text-xs text-danger-text">{t('countdown.badDate')}</p>}
    </Card>
  );
}
