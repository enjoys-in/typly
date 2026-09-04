import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { examBase, useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useIncomingStore } from '@/store/incomingStore';
import { featuresFor } from '@/core/profile/profile';
import {
  boardsByCategory,
  dictationFor,
  isKdph,
  profileFor,
} from '@/core/scoring/examProfiles';
import { seriesFrom } from '@/core/library/parts';
import { paperSeries, type PaperTemplate } from '@/core/exam/paper';
import { pacerAvailable } from '@/core/exam/pacer';
import type { PaperSection } from '@/core/types';
import { useAsync } from '@/hooks/useAsync';
import {
  DEFAULT_DURATIONS_MIN,
  Difficulty,
  ExamBoard,
  ExamMode,
  ExamSkin,
  GUEST_MAX_DURATION_MIN,
  Lang,
  MAX_DURATION_MIN,
  MAX_READING_SEC,
  TimingMode,
} from '@/core/constants';
import { Button } from '@/ui/Button';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { Card } from '@/ui/Card';
import { Toggle } from '@/ui/Toggle';
import { PaperPicker } from '@/components/exam/PaperPicker';
import { useT } from '@/i18n';
import { useDateFormat } from '@/hooks/useDateFormat';

export function ExamSetup() {
  const navigate = useNavigate();
  const platform = usePlatform();
  const draft = useExamStore((s) => s.draft);
  const setConfig = useExamStore((s) => s.setConfig);
  const startSeries = useExamStore((s) => s.startSeries);
  const settings = useSettingsStore();
  const account = useAuthStore((s) => s.account);
  const challenge = useIncomingStore((s) => s.challenge);
  // An email lifts the guest session cap — the address is how someone tells the
  // app who they are, and long mock exams are the reward for doing so.
  const unlocked = featuresFor(account);
  const maxMin = !account?.guest || unlocked.longSessions ? MAX_DURATION_MIN : GUEST_MAX_DURATION_MIN;
  const durationMin = Math.round(settings.durationSec / 60);
  const [ghostTestId, setGhostTestId] = useState<number | null>(null);
  // Dictation is on by default for a profile that has one — that *is* the test.
  const [dictateOn, setDictateOn] = useState(true);
  const t = useT();
  const d = useDateFormat();

  const difficultyOptions: SegmentedOption<Difficulty>[] = Object.values(Difficulty).map((d) => ({
    value: d,
    label: t(`difficulty.${d}`),
  }));
  const modeOptions: SegmentedOption<ExamMode>[] = Object.values(ExamMode).map((m) => ({
    value: m,
    label: t(`examMode.${m}`),
  }));
  const timingOptions: SegmentedOption<TimingMode>[] = [
    { value: TimingMode.Countdown, label: t('timing.countdown') },
    { value: TimingMode.Stopwatch, label: t('timing.stopwatch') },
  ];
  const skinOptions: SegmentedOption<ExamSkin>[] = [
    { value: ExamSkin.Modern, label: t('skin.modern') },
    { value: ExamSkin.ExamClient, label: t('skin.examClient') },
  ];

  const profile = profileFor(settings.board);
  const dictation = dictationFor(settings.board);
  const kdph = isKdph(settings.board);

  // Saved paragraphs, so a multi-section paper can fill its other sections
  // from the library rather than asking for an import mid-setup.
  const library = useAsync(() => platform.repo.listDocuments(), [platform]);

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

  // A challenge names the exam and the clock it was set under. Adopting both is
  // the whole point — a head-to-head on different rules is not a comparison.
  useEffect(() => {
    if (!challenge) return;
    settings.setBoard(challenge.board);
    if (challenge.durationSec > 0) settings.setDurationSec(challenge.durationSec);
    // Only on arrival; the controls below stay free to override.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge]);

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

  function baseConfig() {
    // A Stenographer profile brings its own dictation; the switch above can turn
    // it off, which turns the run back into a plain typing test.
    const dictating = dictation && dictateOn ? dictation : null;
    return {
      ...examBase(settings),
      // With dictation on, the clock is the exam's own transcription window —
      // the briefing promises those minutes, so the timer has to give them.
      durationSec: dictating
        ? Math.min(dictating.transcriptionMinutes * 60, maxMin * 60)
        : Math.min(settings.durationSec, maxMin * 60),
      dictation: dictating,
    };
  }

  function start() {
    if (!draft) return;
    const base = baseConfig();
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
      paper: draft.paper === true,
      ghostTestId,
    });
    navigate('/app/exam');
  }

  /** A multi-section paper: one series, each section with its own settings. */
  function startPaper(template: PaperTemplate, sections: PaperSection[]) {
    startSeries(paperSeries(sections), { ...baseConfig(), board: template.board });
    navigate('/app/exam');
  }

  /** The first saved paragraph in a section's language, or null if there is none. */
  function passageForSection(section: PaperTemplate['sections'][number]): string | null {
    return library.data?.find((doc) => doc.lang === section.lang)?.content ?? null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('setup.title')}</h1>
      {challenge && (
        <Card className="border-accent-border bg-accent-soft">
          <p className="text-sm font-semibold">{t('challenge.incomingTitle')}</p>
          <p className="mt-1 text-sm text-fg-muted">
            {t('challenge.incomingBody', {
              name: challenge.score.name || t('challenge.challenger'),
              wpm: challenge.score.netWpm,
              accuracy: challenge.score.accuracy,
            })}
          </p>
        </Card>
      )}

      {draft.paper && (
        <Card className="border-accent-border bg-accent-soft">
          <p className="text-sm font-semibold">{t('setup.paperTitle')}</p>
          <p className="mt-1 text-sm text-fg-muted">
            {t('setup.paperBody')}
          </p>
        </Card>
      )}

      {split && (
        <Card className="border-accent-border bg-accent-soft">
          <p className="text-sm font-semibold">
            {t('setup.partOf', {
              title: draft.title,
              index: split.startIndex + 1,
              total: split.parts.length,
            })}
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            {t('setup.partsApply')}{' '}
            {remaining > 1 ? t('setup.partsRemaining', { count: remaining }) : t('setup.partsLast')}
          </p>
        </Card>
      )}
      <Card className="space-y-5">
        <Field label={t('setup.examProfile')}>
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
            {t('setup.source', { source: profile.source })}
            {/* A data-entry post's bar is depressions per hour; showing it as
                WPM would show the wrong number. */}
            {kdph
              ? t('setup.targetKdph', {
                  kdph: profile.rules.minKdph.toLocaleString(),
                  accuracy: profile.rules.minAccuracy,
                })
              : profile.rules.minWpm > 0 &&
                t('setup.target', {
                  wpm: profile.rules.minWpm,
                  accuracy: profile.rules.minAccuracy,
                })}
          </p>
        </Field>

        <Field label={t('setup.language')}>
          <select
            value={settings.lang}
            onChange={(e) => settings.setLang(e.target.value as Lang)}
            className="select"
          >
            {Object.values(Lang).map((l) => (
              <option key={l} value={l}>
                {t(`lang.${l}`)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('setup.difficulty')}>
          <Segmented
            options={difficultyOptions}
            value={settings.difficulty}
            onChange={settings.setDifficulty}
            ariaLabel={t('setup.difficultyAria')}
          />
        </Field>

        <Field label={t('setup.mode')}>
          <Segmented
            options={modeOptions}
            value={settings.examMode}
            onChange={settings.setExamMode}
            ariaLabel={t('setup.modeAria')}
          />
        </Field>

        <Field label={t('setup.timing')}>
          <Segmented
            options={timingOptions}
            value={settings.timing}
            onChange={settings.setTiming}
            ariaLabel={t('setup.timingAria')}
          />
        </Field>

        {settings.timing === TimingMode.Countdown && (
          <Field label={t('setup.duration')}>
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
                <span className="text-sm text-fg-subtle">{t('setup.or')}</span>
                <input
                  type="number"
                  min={1}
                  max={maxMin}
                  value={durationMin}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  aria-label={t('setup.durationAria')}
                  className="select w-24"
                />
                <span className="text-sm text-fg-muted">{t('setup.minutes')}</span>
              </div>
              <p className="text-xs text-fg-muted">
                {maxMin === MAX_DURATION_MIN
                  ? t('setup.fullCap', { minutes: MAX_DURATION_MIN })
                  : t('setup.guestCap', { minutes: GUEST_MAX_DURATION_MIN })}
              </p>
            </div>
          </Field>
        )}

        <Field label={t('skin.label')}>
          <Segmented
            options={skinOptions}
            value={settings.examSkin}
            onChange={settings.setExamSkin}
            ariaLabel={t('skin.label')}
          />
          <p className="mt-1 text-xs text-fg-muted">{t('skin.hint')}</p>
        </Field>

        {dictation && (
          <Field label={t('setup.dictationLabel')}>
            <div className="space-y-3 rounded-panel border border-accent-border bg-accent-soft p-4">
              <Toggle
                label={t('setup.dictationToggle', { wpm: dictation.wpm })}
                hint={t('setup.dictationHint', {
                  wpm: dictation.wpm,
                  minutes: dictation.transcriptionMinutes,
                })}
                checked={dictateOn}
                onChange={setDictateOn}
              />
            </div>
          </Field>
        )}

        <Field label={t('setup.pacing')}>
          <div className="space-y-3 rounded-panel border border-line p-4">
            <Toggle
              label={t('pacer.toggle')}
              hint={t('pacer.toggleHint')}
              checked={settings.pacer}
              onChange={settings.setPacer}
              disabled={!pacerAvailable(profile.rules)}
            />
            <Toggle
              label={t('pressure.toggle')}
              hint={t('pressure.toggleHint')}
              checked={settings.pressure}
              onChange={settings.setPressure}
              disabled={settings.timing !== TimingMode.Countdown}
            />
          </div>
        </Field>

        {/* Only offered where there is a paragraph to build the paper on. */}
        {!draft.paper && (
          <PaperPicker
            passage={draft.passage}
            passageFor={passageForSection}
            onStart={startPaper}
          />
        )}

        <Field label={t('setup.mockExam')}>
          <div className="space-y-3 rounded-panel border border-line p-4">
            <Toggle
              label={t('setup.briefingToggle')}
              hint={t('setup.briefingHint')}
              checked={settings.briefing}
              onChange={settings.setBriefing}
            />
            <Toggle
              label={t('setup.examDayToggle')}
              hint={t('setup.examDayHint')}
              checked={settings.examDay}
              onChange={settings.setExamDay}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-fg">{t('setup.readingLabel')}</span>
              <input
                type="number"
                min={0}
                max={MAX_READING_SEC / 60}
                value={Math.round(settings.readingSec / 60)}
                onChange={(e) => setReadingMinutes(Number(e.target.value))}
                aria-label={t('setup.readingAria')}
                className="select w-20"
              />
              <span className="text-sm text-fg-muted">{t('setup.readingHint')}</span>
            </div>
          </div>
        </Field>

        {rivals.data && rivals.data.length > 0 && (
          <Field label={t('setup.ghostTitle')}>
            <select
              value={ghostTestId ?? ''}
              onChange={(e) => setGhostTestId(e.target.value ? Number(e.target.value) : null)}
              className="select"
            >
              <option value="">{t('setup.ghostNone')}</option>
              {rivals.data.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.netWpm} WPM · {row.accuracy}% · {d.dateShort(row.createdAt)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-fg-muted">
              {t('setup.ghostHint')}
            </p>
          </Field>
        )}

        <Field label={t('setup.behaviour')}>
          <div className="space-y-3 rounded-panel border border-line p-4">
            <Toggle
              label={t('setup.allowBackspace')}
              hint={t('setup.allowBackspaceHint')}
              checked={settings.backspaceEnabled}
              onChange={settings.setBackspaceEnabled}
            />
            <Toggle
              label={t('setup.allowSpace')}
              hint={t('setup.allowSpaceHint')}
              checked={settings.spaceEnabled}
              onChange={settings.setSpaceEnabled}
            />
            <Toggle
              label={t('setup.allowEnter')}
              hint={t('setup.allowEnterHint')}
              checked={settings.enterEnabled}
              onChange={settings.setEnterEnabled}
            />
            <Toggle
              label={t('setup.examLock')}
              hint={t('setup.examLockHint')}
              checked={settings.examLock}
              onChange={settings.setExamLock}
            />
          </div>
        </Field>

        <div className="flex justify-end">
          <Button onClick={start}>{t('setup.startExam')}</Button>
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
