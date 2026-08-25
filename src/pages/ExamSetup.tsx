import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { boardsByCategory, profileFor } from '@/core/scoring/examProfiles';
import {
  DEFAULT_DURATIONS_MIN,
  Difficulty,
  DIFFICULTY_LABEL,
  ExamBoard,
  ExamMode,
  EXAM_MODE_LABEL,
  GUEST_MAX_DURATION_MIN,
  Lang,
  LANG_LABEL,
  MAX_DURATION_MIN,
  TimingMode,
} from '@/core/constants';
import { Button } from '@/ui/Button';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { Card } from '@/ui/Card';
import { Toggle } from '@/ui/Toggle';

const DIFFICULTY_OPTIONS: SegmentedOption<Difficulty>[] = Object.values(Difficulty).map((d) => ({
  value: d,
  label: DIFFICULTY_LABEL[d],
}));

const MODE_OPTIONS: SegmentedOption<ExamMode>[] = Object.values(ExamMode).map((m) => ({
  value: m,
  label: EXAM_MODE_LABEL[m],
}));

const TIMING_OPTIONS: SegmentedOption<TimingMode>[] = [
  { value: TimingMode.Countdown, label: 'Countdown' },
  { value: TimingMode.Stopwatch, label: 'Stopwatch' },
];

export function ExamSetup() {
  const navigate = useNavigate();
  const draft = useExamStore((s) => s.draft);
  const setConfig = useExamStore((s) => s.setConfig);
  const settings = useSettingsStore();
  const account = useAuthStore((s) => s.account);
  const maxMin = account?.guest ? GUEST_MAX_DURATION_MIN : MAX_DURATION_MIN;
  const durationMin = Math.round(settings.durationSec / 60);

  useEffect(() => {
    if (!draft) navigate('/app/new', { replace: true });
  }, [draft, navigate]);

  // Enforce the guest/plan duration cap.
  useEffect(() => {
    if (settings.durationSec > maxMin * 60) settings.setDurationSec(maxMin * 60);
  }, [maxMin, settings]);

  if (!draft) return null;

  function setMinutes(min: number) {
    const clamped = Math.min(maxMin, Math.max(1, Math.floor(min || 0)));
    settings.setDurationSec(clamped * 60);
  }

  function start() {
    if (!draft) return;
    setConfig({
      passage: draft.passage,
      title: draft.title,
      documentId: draft.documentId,
      lang: settings.lang,
      board: settings.board,
      timing: settings.timing,
      durationSec: Math.min(settings.durationSec, maxMin * 60),
      sourceType: draft.sourceType,
      difficulty: settings.difficulty,
      examMode: settings.examMode,
      backspaceEnabled: settings.backspaceEnabled,
      spaceEnabled: settings.spaceEnabled,
      enterEnabled: settings.enterEnabled,
      examLock: settings.examLock,
    });
    navigate('/app/exam');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Exam Setup</h1>
      <Card className="space-y-5">
        <Field label="Exam profile">
          <select
            value={settings.board}
            onChange={(e) => settings.setBoard(e.target.value as ExamBoard)}
            className="select"
          >
            {boardsByCategory().map((group) => (
              <optgroup key={group.category} label={group.category}>
                {group.boards.map((b) => (
                  <option key={b} value={b}>
                    {profileFor(b).name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="mt-1 text-xs text-fg-muted">
            Source: {profileFor(settings.board).source}
            {profileFor(settings.board).rules.minWpm > 0 &&
              ` · target ${profileFor(settings.board).rules.minWpm} WPM, ${profileFor(settings.board).rules.minAccuracy}% accuracy`}
          </p>
        </Field>

        <Field label="Language">
          <select
            value={settings.lang}
            onChange={(e) => settings.setLang(e.target.value as Lang)}
            className="select"
          >
            {Object.values(Lang).map((l) => (
              <option key={l} value={l}>
                {LANG_LABEL[l]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Difficulty">
          <Segmented
            options={DIFFICULTY_OPTIONS}
            value={settings.difficulty}
            onChange={settings.setDifficulty}
            ariaLabel="Difficulty"
          />
        </Field>

        <Field label="Mode">
          <Segmented
            options={MODE_OPTIONS}
            value={settings.examMode}
            onChange={settings.setExamMode}
            ariaLabel="Exam mode"
          />
        </Field>

        <Field label="Timing">
          <Segmented
            options={TIMING_OPTIONS}
            value={settings.timing}
            onChange={settings.setTiming}
            ariaLabel="Timing mode"
          />
        </Field>

        {settings.timing === TimingMode.Countdown && (
          <Field label="Duration (minutes)">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {DEFAULT_DURATIONS_MIN.filter((m) => m <= maxMin).map((m) => (
                  <Button
                    key={m}
                    size="sm"
                    className="min-w-10 tabular-nums"
                    variant={settings.durationSec === m * 60 ? 'primary' : 'secondary'}
                    onClick={() => setMinutes(m)}
                  >
                    {m}
                  </Button>
                ))}
                <span className="text-sm text-fg-subtle">or</span>
                <input
                  type="number"
                  min={1}
                  max={maxMin}
                  value={durationMin}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  aria-label="Custom duration in minutes"
                  className="select w-24"
                />
                <span className="text-sm text-fg-muted">min</span>
              </div>
              <p className="text-xs text-fg-muted">
                {account?.guest
                  ? `Guest mode: up to ${GUEST_MAX_DURATION_MIN} minutes.`
                  : `Custom duration up to ${MAX_DURATION_MIN} minutes.`}
              </p>
            </div>
          </Field>
        )}

        <Field label="Behavior">
          <div className="space-y-3 rounded-panel border border-line p-4">
            <Toggle
              label="Backspace / Delete"
              hint="Allow correcting mistakes during the test."
              checked={settings.backspaceEnabled}
              onChange={settings.setBackspaceEnabled}
            />
            <Toggle
              label="Space key"
              hint="Allow the space bar (disable for continuous-script drills)."
              checked={settings.spaceEnabled}
              onChange={settings.setSpaceEnabled}
            />
            <Toggle
              label="Enter key"
              hint="Allow new lines / paragraph breaks."
              checked={settings.enterEnabled}
              onChange={settings.setEnterEnabled}
            />
            <Toggle
              label="Exam lock"
              hint="Keeps the screen awake; leaving the tab prompts to submit the test."
              checked={settings.examLock}
              onChange={settings.setExamLock}
            />
          </div>
        </Field>

        <div className="flex justify-end">
          <Button onClick={start}>Start exam</Button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-fg-muted">{label}</span>
      {children}
    </label>
  );
}
