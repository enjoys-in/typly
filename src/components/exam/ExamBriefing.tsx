import { AlarmClock, BookOpen, Check, Gauge, Play, Target, X } from 'lucide-react';
import type { ExamConfig, ExamProfile, ScoringRules } from '@/core/types';
import { EXAM_MODE_LABEL, LANG_LABEL, TimingMode } from '@/core/constants';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';

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
  const allowed: { label: string; on: boolean }[] = [
    { label: 'Backspace / Delete', on: config.backspaceEnabled },
    { label: 'Space bar', on: config.spaceEnabled },
    { label: 'Enter / new line', on: config.enterEnabled },
    { label: 'Paste', on: rules.pasteAllowed },
  ];

  return (
    <Card className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">
          Instructions
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
        <p className="text-sm text-fg-muted">{profile.source}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Item icon={AlarmClock} label="Duration">
          {config.timing === TimingMode.Countdown
            ? minutes(config.durationSec)
            : 'Untimed (stopwatch)'}
        </Item>
        <Item icon={BookOpen} label="Reading time">
          {config.readingSec > 0 ? minutes(config.readingSec) : 'None'}
        </Item>
        <Item icon={Gauge} label="Speed cut-off">
          {rules.minWpm > 0 ? `${rules.minWpm} net WPM` : 'Not graded'}
        </Item>
        <Item icon={Target} label="Accuracy cut-off">
          {rules.minAccuracy > 0 ? `${rules.minAccuracy}%` : 'Not graded'}
        </Item>
      </div>

      <div className="space-y-3 rounded-panel border border-line p-4">
        <p className="text-sm font-semibold">Allowed during the test</p>
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
          {config.readingSec > 0 ? 'Begin reading time' : 'Begin test'}
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
