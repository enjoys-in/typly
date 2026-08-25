import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import { PassageView } from '@/components/exam/PassageView';
import { TypingInput } from '@/components/exam/TypingInput';
import { Keyboard } from '@/components/exam/Keyboard';
import { PressedKey } from '@/components/exam/PressedKey';
import { ZoomControl } from '@/components/exam/ZoomControl';
import { LiveStats } from '@/components/exam/LiveStats';
import { LayoutSwitcher, type ExamLayout } from '@/components/exam/LayoutSwitcher';
import { Timer } from '@/components/exam/Timer';
import { Button } from '@/ui/Button';
import {
  ArrowRight,
  Activity,
  Keyboard as KeyboardIcon,
  Maximize,
  Minimize,
  Pause,
  Play,
  SquareDot,
} from 'lucide-react';
import { useCountdown } from'@/hooks/useCountdown';
import { useStopwatch } from'@/hooks/useStopwatch';
import { useWakeLock } from'@/hooks/useWakeLock';
import { useActivityMonitor } from'@/hooks/useActivityMonitor';
import { useFullscreen } from'@/hooks/useFullscreen';
import { useConfirm } from '@/ui/Confirm';
import { evaluate, buildTimeline, countBackspaces, countDeletes } from '@/core/typing/typingEngine';
import { findMistakes, countWords } from '@/core/typing/diff';
import { score, applyDifficulty, applyMode } from '@/core/scoring/scoring';
import { profileFor } from '@/core/scoring/examProfiles';
import { resolveLessonTargets } from '@/core/lessons/customLessons';
import { inscriptChar } from '@/core/text/inscript';
import type { Keystroke } from '@/core/types';
import { EXAM_MODE_LABEL, ExamMode, HindiFont, IDLE_SECONDS, InputMethod, Lang, TimingMode } from '@/core/constants';
import { FONT_FAMILY, isLegacyFont } from '@/ui/fonts';
export function TypingExam() {
  const navigate = useNavigate();
  const platform = usePlatform();
  const confirm = useConfirm();
  const config = useExamStore((s) => s.config);
  const setFinished = useExamStore((s) => s.setFinished);
  const series = useExamStore((s) => s.series);
  const notify = useSettingsStore((s) => s.notify);
  const sound = useSettingsStore((s) => s.sound);
  const showKeyboard = useSettingsStore((s) => s.showKeyboard);
  const inputMethod = useSettingsStore((s) => s.inputMethod);
  const hindiFont = useSettingsStore((s) => s.hindiFont);  const setShowKeyboard = useSettingsStore((s) => s.setShowKeyboard);
  const showKeys = useSettingsStore((s) => s.showKeys);
  const setShowKeys = useSettingsStore((s) => s.setShowKeys);
  const examZoom = useSettingsStore((s) => s.examZoom);
  const showStats = useSettingsStore((s) => s.showStats);
  const setShowStats = useSettingsStore((s) => s.setShowStats);
  const setExamZoom = useSettingsStore((s) => s.setExamZoom);

  const [typed, setTyped] = useState('');
  const [running, setRunning] = useState(true);
  const [paused, setPaused] = useState(false);
  const [layout, setLayout] = useState<ExamLayout>('split');
  const [lastKey, setLastKey] = useState('');
  const keystrokes = useRef<Keystroke[]>([]);
  const startAt = useRef<number>(Date.now());
  const typedRef = useRef('');
  const done = useRef(false);
  const awayPrompting = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(rootRef);

  const isCountdown = config?.timing === TimingMode.Countdown;
  // Non-stop mode (locked exams) forbids pausing.
  const nonStop = config?.examLock ?? false;
  const active = running && !paused;
  const countdown = useCountdown(config?.durationSec ?? 0, active && isCountdown);
  const stopwatch = useStopwatch(active && !isCountdown);
  const elapsedMs = isCountdown ? countdown.elapsedMs : stopwatch.elapsedMs;

  useEffect(() => {
    if (!config) navigate('/app/new', { replace: true });
  }, [config, navigate]);

  const finish = useCallback(
    async (reason: 'manual' | 'time' | 'complete' | 'away' = 'manual') => {
      if (done.current || !config) return;
      done.current = true;
      setRunning(false);

      // Read the latest typed text from the ref — state may not have committed yet.
      const finalTyped = typedRef.current;

      // Nothing typed → an abandoned attempt; don't record a zero-score test.
      if (finalTyped.length === 0) {
        navigate('/app', { replace: true });
        return;
      }

      const { correctChars, incorrectChars } = evaluate(config.passage, finalTyped);
      const mistakes = findMistakes(config.passage, finalTyped);
      const wrongWords = mistakes.length;
      const rules = applyMode(
        applyDifficulty(profileFor(config.board).rules, config.difficulty),
        config.examMode,
      );
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
        const raw = (await platform.repo.getSetting('completedLessons')) ?? '[]';
        let done: string[] = [];
        try {
          done = JSON.parse(raw);
        } catch {
          done = [];
        }
        if (!done.includes(lesson.id)) {
          await platform.repo.setSetting('completedLessons', JSON.stringify([...done, lesson.id]));
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
      };

      const savedId = await platform.repo.saveTest(payload).catch(() => null);
      setFinished({ payload, result, mistakes, savedId });
      navigate('/app/result');
    },
    [config, elapsedMs, platform, setFinished, navigate, notify, sound],
  );

  useEffect(() => {
    if (isCountdown && countdown.expired && active) void finish('time');
  }, [isCountdown, countdown.expired, active, finish]);

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
      if (notify) platform.notifications.notify('Still there?', 'You have been idle during the test.');
    },
    onAway: () => {
      if (!active) return;
      // Locked exams force-submit when the user leaves — but only after they confirm.
      if (config?.examLock) {
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
      if (notify) platform.notifications.notify('You left the test', 'Return to the tab to keep going.');
    },
  });

  // Stable across keystrokes; reads current length from a ref instead of `typed`.
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!config) return;
      ping();
      if (e.key.length !== 1 && e.key !== 'Backspace' && e.key !== 'Delete') return;
      setLastKey(e.key);
      const index = typedRef.current.length;
      const expected = config.passage[index] ?? '';
      // InScript remaps the physical key, so compare against the Devanagari it produces.
      const inscriptActive = inputMethod === InputMethod.InScript && config.lang === Lang.Hi;
      const produced = inscriptActive && e.key.length === 1 ? inscriptChar(e.key) : null;
      const logged = produced ?? e.key;
      const correct = produced !== null ? expected !== '' && produced.startsWith(expected) : e.key === expected;
      if (sound && e.key.length === 1) platform.sound.play(correct ? 'key' : 'error');
      keystrokes.current.push({
        t: Date.now() - startAt.current,
        key: logged,
        expected,
        correct,
        index,
      });
    },
    [config, ping, sound, platform, inputMethod],
  );

  const onChange = useCallback(
    (next: string) => {
      typedRef.current = next;
      setTyped(next);
      ping();
      if (config && next.length >= config.passage.length) void finish('complete');
    },
    [config, finish, ping],
  );

  const togglePause = useCallback(() => {
    if (nonStop) return;
    setPaused((p) => !p);
  }, [nonStop]);

  if (!config) return null;
  const profile = profileFor(config.board);
  const isSplit = layout === 'split';
  const blind = config.examMode === ExamMode.Blind;
  const enforceCorrect = config.examMode === ExamMode.ErrorFree;
  const phonetic = inputMethod === InputMethod.Phonetic && config.lang === Lang.Hi;
  const inscript = inputMethod === InputMethod.InScript && config.lang === Lang.Hi;
  // Hindi font applies to the passage, input, and (for legacy remapping fonts) keys.
  const hindiFontActive = config.lang === Lang.Hi && hindiFont !== HindiFont.System;
  const fontFamily = hindiFontActive ? FONT_FAMILY[hindiFont] : undefined;
  const keyFontFamily = hindiFontActive && isLegacyFont(hindiFont) ? fontFamily : undefined;
  // Stacked puts passage, input, keyboard and stats in one column, so the full
  // keyboard is dropped there to keep the passage readable.
  const keyboardVisible = showKeyboard && isSplit && !blind;
  const statsVisible = showStats && !blind;

  return (
    <div
      ref={rootRef}
      className={`flex flex-col gap-5 ${
        fullscreen.isFullscreen
          ?'h-screen overflow-auto bg-canvas p-6'
          :'h-[calc(100vh-4rem)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">{profile.name}</h1>
          {series && (
            <span className="rounded-full bg-surface-3 px-2.5 py-1 text-xs font-semibold text-fg-muted">
              Test {series.index + 1} of {series.items.length}
            </span>
          )}
          {config.examMode !== ExamMode.Standard && (
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-soft-fg">
              {EXAM_MODE_LABEL[config.examMode]}
            </span>
          )}
          <LayoutSwitcher layout={layout} onChange={setLayout} />

          {/* Hiding the keyboard hands its ~300px to the passage. */}
          <ToggleChip
            active={keyboardVisible}
            disabled={!isSplit}
            onClick={() => setShowKeyboard(!showKeyboard)}
            title={
              !isSplit
                ? 'The keyboard is off in Stacked so the passage keeps the height'
                : showKeyboard
                  ? 'Hide the on-screen keyboard'
                  : 'Show the on-screen keyboard'
            }
          >
            <KeyboardIcon size={14} />
            {keyboardVisible ? 'Hide keyboard' : 'Show keyboard'}
          </ToggleChip>

          {/* Redundant while the full keyboard is up, so it is disabled there. */}
          <ToggleChip
            active={!keyboardVisible && showKeys}
            disabled={keyboardVisible}
            onClick={() => setShowKeys(!showKeys)}
            title={
              keyboardVisible
                ? 'Hide the keyboard first — the full keyboard already shows keys'
                : showKeys
                  ? 'Stop showing the pressed key'
                  : 'Show only the key you press'
            }
          >
            <SquareDot size={14} />
            Show keys
          </ToggleChip>

          <ToggleChip
            active={showStats}
            onClick={() => setShowStats(!showStats)}
            title={showStats ? 'Hide the live metrics panel' : 'Show the live metrics panel'}
          >
            <Activity size={14} />
            {showStats ? 'Hide stats' : 'Show stats'}
          </ToggleChip>

          {fullscreen.supported && (
            <ToggleChip
              active={fullscreen.isFullscreen}
              onClick={fullscreen.toggle}
              title={fullscreen.isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {fullscreen.isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </ToggleChip>
          )}
        </div>
        {isCountdown ? (
          <Timer remainingSec={countdown.remainingSec} />
        ) : (
          <Timer elapsedMs={stopwatch.elapsedMs} />
        )}
      </div>

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
            toolbar={<ZoomControl zoom={examZoom} onChange={setExamZoom} />}
          />
          <TypingInput
            typed={typed}
            disabled={!active}
            pasteAllowed={profile.rules.pasteAllowed}
            backspaceEnabled={config.backspaceEnabled}
            spaceEnabled={config.spaceEnabled}
            enterEnabled={config.enterEnabled}
            enforceCorrect={enforceCorrect}
            expectedChar={config.passage[typed.length]}
            phonetic={phonetic}
            inscript={inscript}
            fontFamily={fontFamily}
            fontScale={examZoom}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
          {keyboardVisible ? (
            <Keyboard
              nextChar={config.passage[typed.length]}
              fontFamily={inscript ? undefined : keyFontFamily}
              inscript={inscript}
            />
          ) : (
            showKeys && <PressedKey pressed={lastKey} />
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
            targetWpm={profile.rules.minWpm}
            targetAccuracy={profile.rules.minAccuracy}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between">
        {nonStop ? (
          <span className="text-xs font-semibold text-danger-text">Non-stop mode · pausing disabled</span>
        ) : (
          <Button variant="secondary" onClick={togglePause}>
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

/** Header chip: a toggle that reads as pressed/unpressed rather than a button. */
function ToggleChip({
  active,
  disabled = false,
  onClick,
  title,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-control border px-2.5 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-ring disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-accent-border bg-accent-soft text-accent-soft-fg'
          : 'border-line text-fg-muted hover:bg-surface-hover hover:text-fg'
      }`}
    >
      {children}
    </button>
  );
}
