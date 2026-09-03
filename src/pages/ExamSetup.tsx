import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { examBase, useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { featuresFor } from '@/core/profile/profile';
import { boardsByCategory, profileFor } from '@/core/scoring/examProfiles';
import { seriesFrom } from '@/core/library/parts';
import { useAsync } from '@/hooks/useAsync';
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
  MAX_READING_SEC,
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
  const platform = usePlatform();
  const draft = useExamStore((s) => s.draft);
  const setConfig = useExamStore((s) => s.setConfig);
  const startSeries = useExamStore((s) => s.startSeries);
  const settings = useSettingsStore();
  const account = useAuthStore((s) => s.account);
  // An email lifts the guest session cap — the address is how someone tells the
  // app who they are, and long mock exams are the reward for doing so.
  const unlocked = featuresFor(account);
  const maxMin = !account?.guest || unlocked.longSessions ? MAX_DURATION_MIN : GUEST_MAX_DURATION_MIN;
  const durationMin = Math.round(settings.durationSec / 60);
  const [ghostTestId, setGhostTestId] = useState<number | null>(null);

  // Past runs of this same paragraph — the only ones worth racing.
  const documentId = draft?.documentId ?? null;
  const rivals = useAsync(async () => {
    if (documentId == null) return [];
    const history = await platform.repo.listHistory();
    return history
      .filter((row) => row.documentId === documentId && row.grossWpm > 0)
      .sort((a, b) => b.netWpm - a.netWpm)
      .slice(0, 5);
  }, [documentId, platform]);

  useEffect(() => {
    if (!draft) navigate('/app/new', { replace: true });
  }, [draft, navigate]);

  // A stored paragraph carries its own language; adopt it so the input method,
  // font and speech match the script on screen. The select still overrides.
  useEffect(() => {
    if (draft && draft.lang !== settings.lang) settings.setLang(draft.lang);
    // Only on arrival — changing the select afterwards must stick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.lang]);

  // Enforce the guest/plan duration cap.
  useEffect(() => {
    if (settings.durationSec > maxMin * 60) settings.setDurationSec(maxMin * 60);
  }, [maxMin, settings]);

  if (!draft) return null;

  const split = draft.split && draft.split.parts.length > 1 ? draft.split : null;
  const remaining = split ? split.parts.length - split.startIndex : 0;

  function setReadingMinutes(min: number) {
    settings.setReadingSec(Math.min(MAX_READING_SEC, Math.max(0, min * 60)));
  }

  function setMinutes(min: number) {
    const clamped = Math.min(maxMin, Math.max(1, Math.floor(min || 0)));
    settings.setDurationSec(clamped * 60);
  }

  function start() {
    if (!draft) return;
    const base = {
      ...examBase(settings),
      durationSec: Math.min(settings.durationSec, maxMin * 60),
    };
    // A split document runs as a series: finishing one part starts the next,
    // and each finished part is recorded so the run can be picked up later.
    if (split) {
      startSeries(seriesFrom(draft), base);
      navigate('/app/exam');
      return;
    }
    setConfig({
      ...base,
      passage: draft.passage,
      title: draft.title,
      documentId: draft.documentId,
      sourceType: draft.sourceType,
      ghostTestId,
    });
    navigate('/app/exam');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Exam Setup</h1>
      {split && (
        <Card className="border-accent-border bg-accent-soft">
          <p className="text-sm font-semibold">
            {draft.title} · part {split.startIndex + 1} of {split.parts.length}
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            These settings apply to every part.{' '}
            {remaining > 1
              ? `The ${remaining} remaining passages run back-to-back, and each one you finish is remembered.`
              : 'This is the last passage in the document.'}
          </p>
        </Card>
      )}
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
                {maxMin === MAX_DURATION_MIN
                  ? `Custom duration up to ${MAX_DURATION_MIN} minutes.`
                  : `Up to ${GUEST_MAX_DURATION_MIN} minutes — add your email in Settings for full-length mock exams.`}
              </p>
            </div>
          </Field>
        )}

        <Field label="Mock exam">
          <div className="space-y-3 rounded-panel border border-line p-4">
            <Toggle
              label="Instructions before the test"
              hint="Open with the rules and cut-off, the way a real skill test does."
              checked={settings.briefing}
              onChange={settings.setBriefing}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-fg">Reading time</span>
              <input
                type="number"
                min={0}
                max={MAX_READING_SEC / 60}
                value={Math.round(settings.readingSec / 60)}
                onChange={(e) => setReadingMinutes(Number(e.target.value))}
                aria-label="Reading time in minutes"
                className="select w-20"
              />
              <span className="text-sm text-fg-muted">min before the clock starts (0 = none)</span>
            </div>
          </div>
        </Field>

        {rivals.data && rivals.data.length > 0 && (
          <Field label="Race a past run">
            <select
              value={ghostTestId ?? ''}
              onChange={(e) => setGhostTestId(e.target.value ? Number(e.target.value) : null)}
              className="select"
            >
              <option value="">No ghost</option>
              {rivals.data.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.netWpm} WPM · {row.accuracy}% · {format(new Date(row.createdAt), 'dd MMM')}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-fg-muted">
              Shows that run's progress live beside yours, so you can see the gap as you type.
            </p>
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
