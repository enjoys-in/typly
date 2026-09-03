import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useCountdown } from '@/hooks/useCountdown';
import { useStopwatch } from '@/hooks/useStopwatch';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useActivityMonitor } from '@/hooks/useActivityMonitor';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useAsync } from '@/hooks/useAsync';
import { useExamSnapshot } from '@/hooks/useExamSnapshot';
import { useConfirm } from '@/ui/Confirm';
import { Button } from '@/ui/Button';
import type { ExamConfig, ExamSnapshot, Keystroke } from '@/core/types';
import { evaluate, buildTimeline, countBackspaces, countDeletes } from '@/core/typing/typingEngine';
import { buildGhostTrack } from '@/core/typing/replay';
import { attemptedSlice, findMistakes, countWords } from '@/core/typing/diff';
import { score, applyDifficulty, applyMode } from '@/core/scoring/scoring';
import { profileFor } from '@/core/scoring/examProfiles';
import { resolveLessonTargets } from '@/core/lessons/customLessons';
import { markPartDone } from '@/core/library/progress';
import { keymapFor, isPhonetic } from '@/core/text/keymaps';
import { isDevanagari } from '@/core/text/scripts';
import {
  ExamMode,
  HindiFont,
  IDLE_SECONDS,
  SETTING_KEY,
  TimingMode,
} from '@/core/constants';
import { FONT_FAMILY, isLegacyFont } from '@/ui/fonts';
import { PassageView } from './PassageView';
import { TypingInput } from './TypingInput';
import { Keyboard } from './Keyboard';
import { PressedKey } from './PressedKey';
import { ZoomControl } from './ZoomControl';
import { LiveStats } from './LiveStats';
import { Timer } from './Timer';
import { ExamToolbar } from './ExamToolbar';
import { ExamBriefing } from './ExamBriefing';
import { ReadingBanner } from './ReadingBanner';
import { GhostBar } from './GhostBar';
import type { ExamLayout } from './LayoutSwitcher';

/** Briefing → reading → typing. A plain run starts at `typing`. */
type Phase = 'briefing' | 'reading' | 'typing';

function initialPhase(config: ExamConfig, resume: ExamSnapshot | null): Phase {
  if (resume) return 'typing'; // an interrupted run is already past the gates
  if (config.briefing) return 'briefing';
  return config.readingSec > 0 ? 'reading' : 'typing';
}

interface Props {
  config: ExamConfig;
  /** Progress of an interrupted attempt, already resolved by the page. */
  resume: ExamSnapshot | null;
}

/**
 * One typing attempt, from briefing to submission. Mounted only once its config
 * (and any restored progress) is known, so every clock and counter starts from
 * the right value.
 */
export function ExamRun({ config, resume }: Props) {
  const navigate = useNavigate();
  const platform = usePlatform();
  const confirm = useConfirm();
  const setFinished = useExamStore((s) => s.setFinished);
  const clearResume = useExamStore((s) => s.clearResume);
  const series = useExamStore((s) => s.series);
  const notify = useSettingsStore((s) => s.notify);
  const sound = useSettingsStore((s) => s.sound);
  const showKeyboard = useSettingsStore((s) => s.showKeyboard);
  const setShowKeyboard = useSettingsStore((s) => s.setShowKeyboard);
  const inputMethod = useSettingsStore((s) => s.inputMethod);
  const hindiFont = useSettingsStore((s) => s.hindiFont);
  const showKeys = useSettingsStore((s) => s.showKeys);
  const setShowKeys = useSettingsStore((s) => s.setShowKeys);
  const examZoom = useSettingsStore((s) => s.examZoom);
  const setExamZoom = useSettingsStore((s) => s.setExamZoom);
  const showStats = useSettingsStore((s) => s.showStats);
  const setShowStats = useSettingsStore((s) => s.setShowStats);

  const [phase, setPhase] = useState<Phase>(() => initialPhase(config, resume));
  // Captured once: the checkpoint is consumed below, but the run stays labelled.
  const [resumed] = useState(resume !== null);
  const [typed, setTyped] = useState(resume?.typed ?? '');
  const [running, setRunning] = useState(true);
  const [paused, setPaused] = useState(false);
  const [layout, setLayout] = useState<ExamLayout>('split');
  const [lastKey, setLastKey] = useState('');
  const [blocked, setBlocked] = useState(0);
  const keystrokes = useRef<Keystroke[]>(resume ? [...resume.keystrokes] : []);
  // Keystroke timestamps are relative to this. It is re-based the moment typing
  // actually starts, so time spent on the briefing or reading the passage does
  // not land in the replay, the timeline or the ghost track.
  const startAt = useRef<number>(Date.now() - (resume?.elapsedMs ?? 0));
  const typingStarted = useRef(initialPhase(config, resume) === 'typing');
  const typedRef = useRef(resume?.typed ?? '');
  const done = useRef(false);
  const awayPrompting = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(rootRef);

  const profile = profileFor(config.board);
  // The rules that will actually grade this run — the briefing shows the same
  // numbers the score is computed from.
  const rules = useMemo(
    () => applyMode(applyDifficulty(profile.rules, config.difficulty), config.examMode),
    [profile, config.difficulty, config.examMode],
  );

  const isCountdown = config.timing === TimingMode.Countdown;
  // Non-stop mode (locked exams) forbids pausing.
  const nonStop = config.examLock;
  const typing = phase === 'typing';
  const active = running && !paused && typing;
  const countdown = useCountdown(config.durationSec, active && isCountdown, resume?.elapsedMs ?? 0);
  const stopwatch = useStopwatch(active && !isCountdown, resume?.elapsedMs ?? 0);
  const elapsedMs = isCountdown ? countdown.elapsedMs : stopwatch.elapsedMs;
  const reading = useCountdown(config.readingSec, phase === 'reading');

  // The run being raced, reduced to progress-over-time.
  const ghost = useAsync(async () => {
    if (config.ghostTestId == null) return null;
    const full = await platform.repo.getResult(config.ghostTestId);
    if (!full || full.keystrokes.length === 0) return null;
    return { track: buildGhostTrack(full.keystrokes), wpm: full.row.netWpm };
  }, [config.ghostTestId, platform]);

  // The one way into the typing phase, from the briefing, the reading timer, or
  // the first keystroke — so the clock and the keystroke clock always agree.
  const startTyping = useCallback(() => {
    if (typingStarted.current) return;
    typingStarted.current = true;
    startAt.current = Date.now();
    setPhase('typing');
  }, []);

  const leaveBriefing = () => {
    if (config.readingSec > 0) setPhase('reading');
    else startTyping();
  };

  const clearSnapshot = useExamSnapshot({
    active: typing,
    config,
    read: () => ({ typed: typedRef.current, elapsedMs, keystrokes: keystrokes.current }),
  });

  const finish = useCallback(
    async (reason: 'manual' | 'time' | 'complete' | 'away' = 'manual') => {
      if (done.current) return;
      done.current = true;
      setRunning(false);
      await clearSnapshot();

      // Read the latest typed text from the ref — state may not have committed yet.
      const finalTyped = typedRef.current;

      // Nothing typed → an abandoned attempt; don't record a zero-score test.
      if (finalTyped.length === 0) {
        navigate('/app', { replace: true });
        return;
      }

      const { correctChars, incorrectChars } = evaluate(config.passage, finalTyped);
      // Only the part of the passage that was reached is compared, so an
      // unfinished (i.e. normal) attempt is not penalised for the untyped tail.
      const mistakes = findMistakes(attemptedSlice(config.passage, finalTyped), finalTyped);
      const wrongWords = mistakes.length;
      const totalMs = Math.max(elapsedMs, 1000);

      const result = score({
        charsTyped: finalTyped.length,
        correctChars,
        incorrectChars,
        correctWords: Math.max(0, countWords(finalTyped) - wrongWords),
        wrongWords,
        backspaces: countBackspaces(keystrokes.current),
        deletes: countDeletes(keystrokes.current),
        errors: mistakes.length,
        elapsedMs: totalMs,
        rules,
      });

      if (notify) {
        const title =
          reason === 'time' ? "Time's up" : reason === 'away' ? 'Exam submitted' : 'Test complete';
        platform.notifications.notify(
          title,
          `Net WPM ${result.netWpm} · Accuracy ${result.accuracy}%`,
        );
      }
      if (sound) platform.sound.play('complete');

      // Lesson (curriculum or custom): record completion when its targets are met.
      const lesson = config.lessonId
        ? await resolveLessonTargets(config.lessonId, (k) => platform.repo.getSetting(k))
        : undefined;
      if (lesson && result.netWpm >= lesson.targetWpm && result.accuracy >= lesson.targetAccuracy) {
        const raw = (await platform.repo.getSetting(SETTING_KEY.CompletedLessons)) ?? '[]';
        let completed: string[] = [];
        try {
          completed = JSON.parse(raw);
        } catch {
          completed = [];
        }
        if (!completed.includes(lesson.id)) {
          await platform.repo.setSetting(
            SETTING_KEY.CompletedLessons,
            JSON.stringify([...completed, lesson.id]),
          );
        }
      }

      const payload = {
        createdAt: new Date().toISOString(),
        documentId: config.documentId,
        lang: config.lang,
        sourceType: config.sourceType,
        examBoard: config.board,
        durationSec: Math.round(totalMs / 1000),
        passageLen: config.passage.length,
        result,
        mistakes,
        timeline: buildTimeline(keystrokes.current, totalMs),
        keystrokes: keystrokes.current,
      };

      const savedId = await platform.repo.saveTest(payload).catch(() => null);

      // One part of a split document: remember it, so the library and the
      // dashboard resume at the *next* passage rather than this one.
      if (config.documentId != null && config.partIndex != null) {
        await markPartDone(
          (key) => platform.repo.getSetting(key),
          (key, value) => platform.repo.setSetting(key, value),
          config.documentId,
          config.partIndex,
        ).catch(() => {});
      }

      setFinished({ payload, result, mistakes, savedId });
      navigate('/app/result');
    },
    [config, rules, elapsedMs, platform, setFinished, navigate, notify, sound, clearSnapshot],
  );

  useEffect(() => {
    if (isCountdown && countdown.expired && active) void finish('time');
  }, [isCountdown, countdown.expired, active, finish]);

  // Passage progress on the dock / taskbar icon, so a running test stays
  // visible from another window. Stepped to whole percent, so a fast typist
  // doesn't push an IPC message per keystroke.
  const progressPct = config.passage.length
    ? Math.floor((typed.length / config.passage.length) * 100)
    : 0;
  useEffect(() => {
    if (typing) platform.shell.setProgress(progressPct / 100);
  }, [typing, progressPct, platform]);
  // However the run ends — submitted, abandoned or navigated away from — the
  // icon goes back to normal.
  useEffect(() => {
    const shell = platform.shell;
    return () => shell.setProgress(null);
  }, [platform]);

  // Reading time is over — the clock takes over from here.
  useEffect(() => {
    if (phase === 'reading' && reading.expired) startTyping();
  }, [phase, reading.expired, startTyping]);

  // The checkpoint has been adopted into this run's state, so drop it — going
  // back to this page later must not restore an attempt a second time.
  useEffect(() => {
    if (resume) clearResume();
  }, [resume, clearResume]);

  // Ask for notification permission once when the exam mounts.
  useEffect(() => {
    if (notify) void platform.notifications.ensurePermission();
  }, [notify, platform]);

  // Locked exams warn before refresh/close (native browser prompt).
  useEffect(() => {
    if (!active || !nonStop) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active, nonStop]);

  // Exam lock: keep the screen/system awake while the test is running.
  useWakeLock(active && nonStop);

  // Idle + away detection with desktop notifications.
  const ping = useActivityMonitor({
    active,
    idleMs: IDLE_SECONDS * 1000,
    onIdle: () => {
      if (notify) {
        platform.notifications.notify('Still there?', 'You have been idle during the test.');
      }
    },
    onAway: () => {
      if (!active) return;
      // Locked exams force-submit when the user leaves — but only after they confirm.
      if (config.examLock) {
        if (awayPrompting.current) return;
        awayPrompting.current = true;
        void confirm({
          title: 'Leave the exam?',
          message: 'You left the exam window. Leaving will submit your test now.',
          confirmLabel: 'Submit now',
          cancelLabel: 'Keep going',
        }).then((ok) => {
          if (ok) void finish('away');
          else setTimeout(() => (awayPrompting.current = false), 800);
        });
        return;
      }
      if (notify) {
        platform.notifications.notify('You left the test', 'Return to the tab to keep going.');
      }
    },
  });

  const phonetic = isPhonetic(inputMethod, config.lang);
  const keymap = keymapFor(inputMethod, config.lang);

  // Stable across keystrokes; reads current length from a ref instead of `typed`.
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      ping();
      if (e.key.length !== 1 && e.key !== 'Backspace' && e.key !== 'Delete') return;
      startTyping();
      setLastKey(e.key);
      const index = typedRef.current.length;
      // A remapped layout produces different text than the physical key, and
      // may fold it into what precedes it — so both what was emitted and how
      // much it replaced are judged and logged.
      const output = keymap && e.key.length === 1 ? keymap.resolve(e.key, typedRef.current) : null;
      const replaced = output?.replace ?? 0;
      const expected = config.passage[index - replaced] ?? '';
      const logged = output?.text ?? e.key;
      const correct =
        output !== null ? expected !== '' && logged.startsWith(expected) : e.key === expected;
      if (sound && e.key.length === 1) platform.sound.play(correct ? 'key' : 'error');
      keystrokes.current.push({
        t: Date.now() - startAt.current,
        key: logged,
        expected,
        correct,
        index,
        ...(replaced > 0 ? { replaced } : {}),
      });
    },
    [config.passage, ping, sound, platform, keymap, startTyping],
  );

  const onChange = useCallback(
    (next: string) => {
      typedRef.current = next;
      setTyped(next);
      ping();
      if (next.length >= config.passage.length) void finish('complete');
    },
    [config.passage.length, finish, ping],
  );

  // A refused keystroke is silent otherwise, which reads as a broken input.
  const onBlocked = useCallback(
    (key: string) => {
      setBlocked((n) => n + 1);
      setLastKey(key);
      if (sound) platform.sound.play('error');
    },
    [sound, platform],
  );

  const togglePause = useCallback(() => {
    if (nonStop) return;
    setPaused((p) => !p);
  }, [nonStop]);


  const isSplit = layout === 'split';
  const blind = config.examMode === ExamMode.Blind;
  const enforceCorrect = config.examMode === ExamMode.ErrorFree;
  // Legacy Devanagari fonts apply to the passage, input, and the on-screen keys.
  const fontActive = isDevanagari(config.lang) && hindiFont !== HindiFont.System;
  const fontFamily = fontActive ? FONT_FAMILY[hindiFont] : undefined;
  const keyFontFamily = fontActive && isLegacyFont(hindiFont) ? fontFamily : undefined;
  // Stacked puts passage, input, keyboard and stats in one column, so the full
  // keyboard is dropped there to keep the passage readable.
  const keyboardVisible = showKeyboard && isSplit && !blind && typing;
  const statsVisible = showStats && !blind;

  if (phase === 'briefing') {
    return <ExamBriefing config={config} profile={profile} rules={rules} onStart={leaveBriefing} />;
  }

  return (
    <div
      ref={rootRef}
      className={`flex flex-col gap-5 ${
        fullscreen.isFullscreen ? 'h-screen overflow-auto bg-canvas p-6' : 'h-[calc(100vh-4rem)]'
      }`}
    >
      <ExamToolbar
        config={config}
        profile={profile}
        series={series}
        resumed={resumed}
        layout={layout}
        onLayout={setLayout}
        keyboardVisible={keyboardVisible}
        showKeyboard={showKeyboard}
        onShowKeyboard={setShowKeyboard}
        showKeys={showKeys}
        onShowKeys={setShowKeys}
        showStats={showStats}
        onShowStats={setShowStats}
        fullscreen={fullscreen}
        timer={
          isCountdown ? (
            <Timer remainingSec={countdown.remainingSec} />
          ) : (
            <Timer elapsedMs={stopwatch.elapsedMs} />
          )
        }
      />

      {phase === 'reading' && (
        <ReadingBanner remainingSec={reading.remainingSec} onStart={startTyping} />
      )}

      <div
        className={
          isSplit
            ? `grid min-h-0 flex-1 grid-cols-1 gap-5 ${statsVisible ? 'lg:grid-cols-[1fr_18rem]' : ''}`
            : 'flex min-h-0 flex-1 flex-col gap-5'
        }
      >
        <div className="relative flex min-h-0 flex-1 flex-col gap-4">
          <PassageView
            passage={config.passage}
            typed={typed}
            className="min-h-0 flex-1"
            fontScale={examZoom}
            blind={blind}
            fontFamily={fontFamily}
            caret={typing && !blind}
            toolbar={<ZoomControl zoom={examZoom} onChange={setExamZoom} />}
          />
          {ghost.data && typing && (
            <GhostBar
              track={ghost.data.track}
              ghostWpm={ghost.data.wpm}
              elapsedMs={elapsedMs}
              typedChars={typed.length}
              passageLength={config.passage.length}
            />
          )}
          <TypingInput
            typed={typed}
            disabled={!active && phase !== 'reading'}
            pasteAllowed={rules.pasteAllowed}
            backspaceEnabled={config.backspaceEnabled}
            spaceEnabled={config.spaceEnabled}
            enterEnabled={config.enterEnabled}
            enforceCorrect={enforceCorrect}
            expectedChar={config.passage[typed.length]}
            phonetic={phonetic}
            keymap={keymap}
            fontFamily={fontFamily}
            fontScale={examZoom}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onBlocked={onBlocked}
          />
          {keyboardVisible ? (
            <Keyboard
              nextChar={config.passage[typed.length]}
              fontFamily={keymap ? undefined : keyFontFamily}
              keymap={keymap}
            />
          ) : (
            showKeys && typing && <PressedKey pressed={lastKey} />
          )}
          {paused && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-panel bg-canvas/85 backdrop-blur-sm">
              <p className="text-xl font-bold">Paused</p>
              <Button onClick={togglePause}>
                <Play size={16} /> Resume
              </Button>
            </div>
          )}
        </div>
        <div className={`${statsVisible ? '' : 'hidden'} ${isSplit ? '' : 'shrink-0'}`}>
          <LiveStats
            passage={config.passage}
            typed={typed}
            elapsedMs={elapsedMs}
            targetWpm={rules.minWpm}
            targetAccuracy={rules.minAccuracy}
            blocked={blocked}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between">
        {nonStop ? (
          <span className="text-xs font-semibold text-danger-text">
            Non-stop mode · pausing disabled
          </span>
        ) : (
          <Button variant="secondary" onClick={togglePause} disabled={!typing}>
            {paused ? (
              <>
                <Play size={16} /> Resume
              </>
            ) : (
              <>
                <Pause size={16} /> Pause
              </>
            )}
          </Button>
        )}
        <Button onClick={() => void finish('manual')}>
          End &amp; submit
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
