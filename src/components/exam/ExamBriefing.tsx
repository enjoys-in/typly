import { AlarmClock, BookOpen, Check, Gauge, Play, Target, X } from 'lucide-react';
import type { ExamConfig, ExamProfile, ScoringRules } from '@/core/types';
import { EXAM_MODE_LABEL, LANG_LABEL, TimingMode } from '@/core/constants';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

interface Props {
  config: ExamConfig;
  profile: ExamProfile;
  /** Rules after difficulty and mode are applied — what will actually be graded. */
  rules: ScoringRules;
  onStart: () => void;
}

function minutes(sec: number): string {
  return sec % 60 === 0 ? `${sec / 60} min` : `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

/**
 * The instructions page a real skill test opens with: what is being measured,
 * the cut-off, and which keys are allowed — read before the clock exists.
 */
export function ExamBriefing({ config, profile, rules, onStart }: Props) {
  const t = useT();
  const allowed: { label: string; on: boolean }[] = [
    { label: t('briefing.backspace'), on: config.backspaceEnabled },
    { label: t('briefing.space'), on: config.spaceEnabled },
    { label: t('briefing.enter'), on: config.enterEnabled },
    { label: t('briefing.paste'), on: rules.pasteAllowed },
  ];

  return (
    <Card className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">
          {t('briefing.heading')}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
        <p className="text-sm text-fg-muted">{profile.source}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Item icon={AlarmClock} label={t('briefing.duration')}>
          {config.timing === TimingMode.Countdown
            ? minutes(config.durationSec)
            : 'Untimed (stopwatch)'}
        </Item>
        <Item icon={BookOpen} label={t('briefing.readingTime')}>
          {config.readingSec > 0 ? minutes(config.readingSec) : t('briefing.none')}
        </Item>
        <Item icon={Gauge} label={t('briefing.speedCutoff')}>
          {rules.minWpm > 0 ? `${rules.minWpm} net WPM` : t('briefing.notGraded')}
        </Item>
        <Item icon={Target} label={t('briefing.accuracyCutoff')}>
          {rules.minAccuracy > 0 ? `${rules.minAccuracy}%` : t('briefing.notGraded')}
        </Item>
      </div>

      <div className="space-y-3 rounded-panel border border-line p-4">
        <p className="text-sm font-semibold">{t('briefing.allowed')}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {allowed.map(({ label, on }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              {on ? (
                <Check size={15} className="shrink-0 text-accent-text" />
              ) : (
                <X size={15} className="shrink-0 text-danger-text" />
              )}
              <span className={on ? 'text-fg' : 'text-fg-muted'}>{label}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-fg-muted">
          {LANG_LABEL[config.lang]} · {EXAM_MODE_LABEL[config.examMode]} mode
          {config.examLock && ' · non-stop: leaving the window submits the test'}
          {config.examDay && ' · exam day: no app around the test, and no pausing'}
        </p>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={onStart}>
          <Play size={16} />
          {t(config.readingSec > 0 ? 'briefing.beginReading' : 'briefing.beginTest')}
        </Button>
      </div>
    </Card>
  );
}

function Item({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Target;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-fg-subtle" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-wide text-fg-muted uppercase">{label}</p>
        <p className="text-sm font-semibold">{children}</p>
      </div>
    </div>
  );
}
