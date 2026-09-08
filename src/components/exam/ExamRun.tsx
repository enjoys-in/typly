import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useNotify } from '@/hooks/useNotify';
import { useChromeStore } from '@/store/chromeStore';
import { useCountdown } from '@/hooks/useCountdown';
import { useStopwatch } from '@/hooks/useStopwatch';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useActivityMonitor } from '@/hooks/useActivityMonitor';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useAsync } from '@/hooks/useAsync';
import { useExamSnapshot } from '@/hooks/useExamSnapshot';
import { useConfirm } from '@/ui/Confirm';
import { useAuthStore } from '@/store/authStore';
import { useBreakNudge } from '@/hooks/useBreakNudge';
import { Button } from '@/ui/Button';
import type {
  ExamConfig,
  ExamSnapshot,
  GrammarIssue,
  Keystroke,
  Mistake,
  PaperResult,
  TestResult,
} from '@/core/types';
import { evaluate, buildTimeline, countBackspaces, countDeletes } from '@/core/typing/typingEngine';
import { buildGhostTrack } from '@/core/typing/replay';
import { attemptedSlice, findMistakes, countWords } from '@/core/typing/diff';
import { score, applyDifficulty, applyMode } from '@/core/scoring/scoring';
import {
  findMisspellings,
  liveWordCount,
  misspellingMistakes,
  scoreFreeform,
} from '@/core/scoring/freeform';
import { profileFor } from '@/core/scoring/examProfiles';
import { resolveLessonTargets } from '@/core/lessons/customLessons';
import { markPartDone } from '@/core/library/progress';
import { keymapFor, isPhonetic } from '@/core/text/keymaps';
import { isDevanagari } from '@/core/text/scripts';
import { grossWpm } from '@/core/scoring/scoring';
import { pacerAvailable } from '@/core/exam/pacer';
import { withTimeout } from '@/core/exam/submit';
import { depressionsOf } from '@/core/scoring/kdph';
import { strictPossible } from '@/core/typing/strict';
import {
  CHARS_PER_WORD,
  ExamMode,
  ExamSkin,
  HindiFont,
  IDLE_SECONDS,
  PAPER_ANALYSIS_TIMEOUT_MS,
  SETTING_KEY,
  SUBMIT_STORAGE_TIMEOUT_MS,
  ScoringMode,
  TimingMode,
} from '@/core/constants';
import { FONT_FAMILY, isLegacyFont } from '@/ui/fonts';
import { useT } from '@/i18n';
import { PassageView } from './PassageView';
import { PaperPanel } from './PaperPanel';
import { TypingInput } from './TypingInput';
import { Keyboard } from './Keyboard';
import { PressedKey } from './PressedKey';
import { ZoomControl } from './ZoomControl';
import { LiveStats } from './LiveStats';
import { PaperStats } from './PaperStats';
import { PaneResizer } from './PaneResizer';
import { Timer } from './Timer';
import { ExamToolbar } from './ExamToolbar';
import { ExamBriefing } from './ExamBriefing';
import { ReadingBanner } from './ReadingBanner';
import { GhostBar } from './GhostBar';
import { PacerBar } from './PacerBar';
import { PressureLayer } from './PressureLayer';
import { DataEntryPanel } from './DataEntryPanel';
import { BreakNudge } from './BreakNudge';
import { ExamClientChrome } from './skins/ExamClientChrome';
import { DictationStage } from '@/components/dictation/DictationStage';
import type { ExamLayout } from './LayoutSwitcher';

/**
 * Briefing → dictation → reading → typing. A plain run starts at `typing`.
 *
 * Dictation sits before reading rather than replacing it: a Stenographer test
 * dictates the passage and *then* gives transcription time, which is exactly
 * this order.
 */
type Phase = 'briefing' | 'dictation' | 'reading' | 'typing';

function initialPhase(config: ExamConfig, resume: ExamSnapshot | null): Phase {
  if (resume) return 'typing'; // an interrupted run is already past the gates
  if (config.briefing) return 'briefing';
  if (config.dictation) return 'dictation';
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
  const examInputShare = useSettingsStore((s) => s.examInputShare);
  const setExamInputShare = useSettingsStore((s) => s.setExamInputShare);
  const showInput = useSettingsStore((s) => s.showInput);
  const setShowInput = useSettingsStore((s) => s.setShowInput);
  const account = useAuthStore((s) => s.account);

  const setBare = useChromeStore((s) => s.setBare);
  const t = useT();

  const [phase, setPhase] = useState<Phase>(() => initialPhase(config, resume));
  // Captured once: the checkpoint is consumed below, but the run stays labelled.
  const [resumed] = useState(resume !== null);
  const [typed, setTyped] = useState(resume?.typed ?? '');
  const [running, setRunning] = useState(true);
  const [paused, setPaused] = useState(false);
  const [layout, setLayout] = useState<ExamLayout>('split');
  const [lastKey, setLastKey] = useState('');
  const [blocked, setBlocked] = useState(0);
  // The analysis between the last keystroke and the results screen takes a moment,
  // and on a paper run it can take several. Without this the submit button looked
  // idle while it worked, so it got pressed again.
  const [submitting, setSubmitting] = useState(false);
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
  // Locked exams and exam-day mode both forbid pausing.
  const nonStop = config.examLock || config.examDay;
  // Nothing pops up over a real test centre's screen, whatever the preferences
  // say — which is what exam-day mode is for.
  const notifier = useNotify(config.examDay);
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
    if (config.dictation) setPhase('dictation');
    else if (config.readingSec > 0) setPhase('reading');
    else startTyping();
  };

  /** The dictation is over (finished or skipped) — reading, then the clock. */
  const leaveDictation = useCallback(() => {
    if (config.readingSec > 0) setPhase('reading');
    else startTyping();
  }, [config.readingSec, startTyping]);

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
      setSubmitting(true);
      try {
        // Cleanup, and nothing below depends on it: bounded so a stalled
        // storage layer cannot sit between the last keystroke and the result.
        await withTimeout(clearSnapshot(), undefined, SUBMIT_STORAGE_TIMEOUT_MS);

        // Read the latest typed text from the ref — state may not have committed yet.
        const finalTyped = typedRef.current;

        // Nothing typed → an abandoned attempt; don't record a zero-score test.
        if (finalTyped.length === 0) {
          navigate('/app', { replace: true });
          return;
        }

        const totalMs = Math.max(elapsedMs, 1000);

        // Paper mode has no passage to compare against, so the language decides
        // what was wrong: the dictionary and the grammar checker.
        let paper: PaperResult | undefined;
        let mistakes: Mistake[] = [];
        let result: TestResult;

        if (config.paper) {
          // Both of these are optional enrichment, and both can stall rather
          // than fail — a dictionary fetch that never returns, a WASM linter
          // that never loads, an AI provider that never answers. A run is marked
          // on its keystrokes, so neither is allowed to hold the result back:
          // whatever has not answered in time is reported as unchecked.
          const spelling = await withTimeout(
            findMisspellings(finalTyped, platform.spell),
            { misspelled: [], misspelledCount: 0, checked: false },
            PAPER_ANALYSIS_TIMEOUT_MS,
          );
          const grammar = await withTimeout(
            platform.grammar.check(finalTyped, config.lang),
            [] as GrammarIssue[],
            PAPER_ANALYSIS_TIMEOUT_MS,
          );
          const findings = {
            words: liveWordCount(finalTyped),
            misspelled: spelling.misspelled,
            misspelledCount: spelling.misspelledCount,
            grammar,
            spellChecked: spelling.checked,
          };
          result = scoreFreeform({
            typed: finalTyped,
            elapsedMs: totalMs,
            keystrokes: keystrokes.current,
            findings,
            rules,
          });
          paper = {
            typed: finalTyped,
            words: findings.words,
            misspelled: findings.misspelled,
            grammar,
            spellChecked: findings.spellChecked,
          };
          // A paper run's misspellings are stored as mistakes like any other
          // run's, so the trainer, the review ladder and the dictation drill all
          // learn from it. They used to end on this screen and go no further —
          // and typing from a printed passage is precisely where spelling from
          // memory is being tested, so it was the best evidence being thrown
          // away. The results screen still shows the paper report, not a mistake
          // list, so nothing is duplicated there.
          mistakes = misspellingMistakes(finalTyped, findings.misspelled, (word) =>
            platform.spell.suggest(word),
          );
        } else {
          const { correctChars, incorrectChars } = evaluate(config.passage, finalTyped);
          // Only the part of the passage that was reached is compared, so an
          // unfinished (i.e. normal) attempt is not penalised for the untyped tail.
          mistakes = findMistakes(attemptedSlice(config.passage, finalTyped), finalTyped);
          const wrongWords = mistakes.length;
          result = score({
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
        }

        notifier.notify(
          t(
            reason === 'time'
              ? 'notify.timeUp'
              : reason === 'away'
                ? 'notify.submitted'
                : 'notify.complete',
          ),
          t('notify.result', { wpm: result.netWpm, accuracy: result.accuracy }),
        );
        if (sound) platform.sound.play('complete');

        // Lesson (curriculum or custom): record completion when its targets are
        // met. Three more reads and writes, bounded like the rest — a lesson
        // that fails to tick itself off is a far smaller loss than a result
        // nobody gets to see.
        await withTimeout(
          (async () => {
            const lesson = config.lessonId
              ? await resolveLessonTargets(config.lessonId, (k) => platform.repo.getSetting(k))
              : undefined;
            if (
              !lesson ||
              result.netWpm < lesson.targetWpm ||
              result.accuracy < lesson.targetAccuracy
            ) {
              return;
            }
            const raw = (await platform.repo.getSetting(SETTING_KEY.CompletedLessons)) ?? '[]';
            let completed: string[] = [];
            try {
              completed = JSON.parse(raw);
            } catch {
              completed = [];
            }
            if (completed.includes(lesson.id)) return;
            await platform.repo.setSetting(
              SETTING_KEY.CompletedLessons,
              JSON.stringify([...completed, lesson.id]),
            );
          })(),
          undefined,
          SUBMIT_STORAGE_TIMEOUT_MS,
        );

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

        // Bounded for the same reason. A save that answers late still lands —
        // the result screen simply has no id for it, which costs the review
        // grading and the certificate for this one run, not the run itself.
        const savedId = await withTimeout(
          platform.repo.saveTest(payload).catch(() => null),
          null,
          SUBMIT_STORAGE_TIMEOUT_MS,
        );

        // One part of a split document: remember it, so the library and the
        // dashboard resume at the *next* passage rather than this one.
        if (config.documentId != null && config.partIndex != null) {
          await withTimeout(
            markPartDone(
              (key) => platform.repo.getSetting(key),
              (key, value) => platform.repo.setSetting(key, value),
              config.documentId,
              config.partIndex,
            ),
            undefined,
            SUBMIT_STORAGE_TIMEOUT_MS,
          );
        }

        setFinished({ payload, result, mistakes, savedId, ...(paper ? { paper } : {}) });
        navigate('/app/result');
      } catch {
        /*
         * A submission that fails must not end the run in a stopped clock and no
         * result. The guard goes back so End & submit works again — the elapsed
         * time is already frozen, so a second attempt scores the same run rather
         * than a longer one, and everything it depends on (the saved keystrokes,
         * the typed text) is still in hand.
         */
        done.current = false;
        setSubmitting(false);
      }
    },
    [config, rules, elapsedMs, platform, setFinished, navigate, notifier, sound, clearSnapshot, t],
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

  // Exam-day mode: the sidebar and page padding go away for the run, and come
  // back however it ends — submitted, abandoned or navigated away from.
  useEffect(() => {
    if (!config.examDay) return;
    setBare(true);
    return () => setBare(false);
  }, [config.examDay, setBare]);

  // Ask for notification permission once when the exam mounts.
  useEffect(() => {
    void notifier.ensurePermission();
  }, [notifier]);

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
    onIdle: () => notifier.notify(t('notify.idleTitle'), t('notify.idleBody')),
    onAway: () => {
      if (!active) return;
      // Locked exams force-submit when the user leaves — but only after they confirm.
      if (config.examLock) {
        if (awayPrompting.current) return;
        awayPrompting.current = true;
        void confirm({
          title: t('exam.leaveTitle'),
          message: t('exam.leaveBody'),
          confirmLabel: t('exam.leaveConfirm'),
          cancelLabel: t('exam.leaveCancel'),
        }).then((ok) => {
          if (ok) void finish('away');
          else setTimeout(() => (awayPrompting.current = false), 800);
        });
        return;
      }
      notifier.notify(t('notify.awayTitle'), t('notify.awayBody'));
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
      // Paper mode has no end to reach — only the clock or the user stops it.
      if (!config.paper && next.length >= config.passage.length) void finish('complete');
    },
    [config.paper, config.passage.length, finish, ping],
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
  // Error-free mode compares each key against the passage, so it cannot apply
  // when the passage is on paper.
  const enforceCorrect = config.examMode === ExamMode.ErrorFree && !config.paper;
  // Strict mode gates the word boundary, which likewise needs a passage — and
  // a way out of a wrong word, or the run would deadlock on the first slip.
  const strict =
    config.examMode === ExamMode.Strict &&
    !config.paper &&
    strictPossible(config.backspaceEnabled);
  // A data-entry post is graded on depressions, and its source is a table — but
  // only if the passage actually *is* one. A prose passage on a KDPH board still
  // scores in depressions; it just reads better in the ordinary passage view.
  const kdphMode = rules.scoringMode === ScoringMode.Kdph && !config.paper;
  const tabular = kdphMode && config.passage.includes('\t');
  const examClient = config.skin === ExamSkin.ExamClient;
  // Paper mode has no passage on screen, so nothing competes with the typing
  // field for the column: it becomes a full-height page, with the counts on one
  // line beneath it. A candidate copying from a printed passage is looking at
  // the paper, not at us.
  const notepad = config.paper;
  // Hiding the field only makes sense where the passage can stand in for it.
  // Paper mode has no passage at all, and blind mode has one that shows no
  // progress — in either the field is the only thing telling a candidate their
  // keystrokes are landing, so it stays.
  const canHideInput = !notepad && !blind;
  const fieldHidden = canHideInput && !showInput;
  // The pacer needs a cut-off to pace against and a passage to measure into.
  const pacerOn = config.pacer && pacerAvailable(rules) && !config.paper && typing;
  // Pressure furniture only makes sense against a countdown — there is nothing
  // to flash about on a stopwatch.
  const pressureOn = config.pressure && isCountdown && typing;
  // Nothing may interrupt a live run, so the break prompt waits for the gap
  // between attempts.
  const breakNudge = useBreakNudge(active);
  // Legacy Devanagari fonts apply to the passage, input, and the on-screen keys.
  const fontActive = isDevanagari(config.lang) && hindiFont !== HindiFont.System;
  const fontFamily = fontActive ? FONT_FAMILY[hindiFont] : undefined;
  const keyFontFamily = fontActive && isLegacyFont(hindiFont) ? fontFamily : undefined;
  // Stacked puts passage, input, keyboard and stats in one column, so the full
  // keyboard is dropped there to keep the passage readable. Paper mode never
  // draws one either: the keyboard exists to show the *next* character, and
  // there is no passage to take one from. Folded in here rather than at the
  // render site so the toolbar is told the same thing the screen does — it was
  // disabling the pressed-key chip on a paper run where no keyboard was, or
  // ever could be, on screen.
  const keyboardVisible = showKeyboard && isSplit && !blind && typing && !notepad;
  const statsVisible = showStats && !blind;
  const timer = isCountdown ? (
    <Timer remainingSec={countdown.remainingSec} />
  ) : (
    <Timer elapsedMs={stopwatch.elapsedMs} />
  );
  // Gross speed over the characters actually produced. The rank ticker and the
  // pressure furniture read this; the graded score is computed at submission.
  const liveWpm = grossWpm(typed.length, Math.max(elapsedMs / 60_000, 1 / 60_000), CHARS_PER_WORD);

  // The typing field itself, identical in every mode — only the pane it is
  // handed differs, which is what keeps the exam rules from drifting between a
  // notepad run and a passage one.
  const field = (
    <TypingInput
      typed={typed}
      disabled={!active && phase !== 'reading'}
      pasteAllowed={rules.pasteAllowed}
      backspaceEnabled={config.backspaceEnabled}
      spaceEnabled={config.spaceEnabled}
      enterEnabled={config.enterEnabled}
      enforceCorrect={enforceCorrect}
      strict={strict}
      passage={config.passage}
      expectedChar={config.passage[typed.length]}
      phonetic={phonetic}
      keymap={keymap}
      fontFamily={fontFamily}
      fontScale={examZoom}
      hidden={fieldHidden}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlocked={onBlocked}
    />
  );

  // The thin strips that belong to the field rather than to the passage: the
  // pace against the cut-off, the ghost of a past attempt, and how much of the
  // passage is left. They travel with it when the splitter is dragged.
  const fieldRail = (
    <>
      {pacerOn && (
        <PacerBar
          rules={rules}
          elapsedMs={elapsedMs}
          typedChars={typed.length}
          passageLength={config.passage.length}
        />
      )}
      {ghost.data && typing && (
        <GhostBar
          track={ghost.data.track}
          ghostWpm={ghost.data.wpm}
          elapsedMs={elapsedMs}
          typedChars={typed.length}
          passageLength={config.passage.length}
        />
      )}
    </>
  );

  const workingPane = (
    <div
      className={
        isSplit && !notepad
          ? `grid min-h-0 flex-1 grid-cols-1 gap-4 ${statsVisible ? 'lg:grid-cols-[1fr_19rem]' : ''}`
          : 'flex min-h-0 flex-1 flex-col gap-4'
      }
    >
      <div className="relative flex min-h-0 flex-1 flex-col gap-3">
        {notepad ? (
          /* Nothing to read on screen, so nothing shares the height: a strip
             saying what this is, and the rest of the column is the page. */
          <>
            <PaperPanel lang={config.lang} />
            {fieldRail}
            {field}
            {/* Not behind the stats toggle, unlike every other mode. With no
                passage on screen these four figures are the *only* feedback a
                paper run has — speed, words, characters and corrections — and
                hiding them would leave a candidate typing into a blank box
                with no way to tell whether anything was being counted. The
                toolbar drops the toggle here rather than showing a dead one. */}
            <PaperStats
              typed={typed}
              elapsedMs={elapsedMs}
              backspaces={countBackspaces(keystrokes.current)}
              targetWpm={rules.minWpm}
            />
          </>
        ) : (
          /* Source above, field below, and a splitter between them that moves
             the height from one to the other. `flexBasis: 0` on both is what
             makes the two `flexGrow` values read as the ratio they are. */
          <div className="flex min-h-0 flex-1 flex-col">
            <div
              className="flex min-h-24 flex-col"
              style={{ flexGrow: 1 - examInputShare, flexBasis: 0 }}
            >
              {tabular ? (
                /* A data-entry source is a register, not prose: drawn as a
                   table so it looks like the form a real candidate is copying
                   from. */
                <DataEntryPanel
                  source={config.passage}
                  typed={typed}
                  elapsedMs={elapsedMs}
                  targetKdph={rules.minKdph}
                  backspaces={countBackspaces(keystrokes.current)}
                  deletes={countDeletes(keystrokes.current)}
                />
              ) : (
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
              )}
            </div>

            {/* With the field hidden there is nothing to trade height with,
                so the splitter goes too rather than sitting there inert. */}
            {!fieldHidden && <PaneResizer share={examInputShare} onChange={setExamInputShare} />}

            {/* Characters typed, left and total are readings, so they live in
                the metrics panel with the other readings rather than on a
                strip of their own under the field. */}
            <div
              className={
                fieldHidden ? 'flex shrink-0 flex-col gap-2 pt-3' : 'flex min-h-0 flex-col gap-2'
              }
              style={fieldHidden ? undefined : { flexGrow: examInputShare, flexBasis: 0 }}
            >
              {fieldRail}
              {field}
            </div>
          </div>
        )}
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
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-panel bg-canvas/70 backdrop-blur-md">
            <p className="text-2xl font-bold tracking-tight">{t('exam.paused')}</p>
            <Button onClick={togglePause}>
              <Play size={16} /> {t('exam.resume')}
            </Button>
          </div>
        )}
      </div>
      {/* Paper mode keeps its readings on a rail under the field instead, so
          there is no side column to render. */}
      {!notepad && (
        <div className={`${statsVisible ? '' : 'hidden'} ${isSplit ? '' : 'shrink-0'}`}>
          <LiveStats
            passage={config.passage}
            typed={typed}
            elapsedMs={elapsedMs}
            targetWpm={rules.minWpm}
            targetAccuracy={rules.minAccuracy}
            blocked={blocked}
            depressions={depressionsOf({
              charsTyped: typed.length,
              backspaces: countBackspaces(keystrokes.current),
              deletes: countDeletes(keystrokes.current),
            })}
            targetKdph={rules.minKdph}
          />
        </div>
      )}
    </div>
  );

  if (phase === 'briefing') {
    return <ExamBriefing config={config} profile={profile} rules={rules} onStart={leaveBriefing} />;
  }

  // The dictation owns the whole screen: the passage must not be visible, which
  // is the one condition that makes a Stenographer test what it is.
  if (phase === 'dictation' && config.dictation) {
    return (
      <DictationStage
        passage={config.passage}
        spec={config.dictation}
        lang={config.lang}
        onDone={leaveDictation}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      // In full screen this element *is* the screen, so it takes the canvas
      // and the dot lattice with it; embedded, it inherits the page's.
      //
      // The exam-client palette goes on here rather than only on the chrome
      // that draws it. The toolbar above the client and the commit bar below
      // it are outside that card but part of the same screen, and left on the
      // app's own theme they sandwiched a light slate exam window between two
      // near-black bars with a green submit button — which is not what anyone
      // is sitting in a test centre. (The chrome keeps the class too: it owns
      // its palette wherever it is rendered.)
      className={`flex flex-col gap-4 ${examClient ? 'exam-client-skin' : ''} ${
        fullscreen.isFullscreen
          ? 'dot-grid h-screen overflow-auto bg-canvas p-5'
          : 'h-[calc(100vh-4rem-var(--titlebar-inset,0px))]'
      }`}
    >
      <ExamToolbar
        examDay={config.examDay}
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
        paper={notepad}
        showInput={showInput}
        onShowInput={setShowInput}
        inputLocked={blind}
        fullscreen={fullscreen}
        // The exam-client skin puts the clock in its own header, where the real
        // software puts it — two clocks would be worse than either.
        timer={examClient ? null : timer}
        remainingFraction={
          isCountdown && config.durationSec > 0
            ? countdown.remainingSec / config.durationSec
            : null
        }
      />

      {phase === 'reading' && (
        <ReadingBanner remainingSec={reading.remainingSec} onStart={startTyping} />
      )}

      {/* Between attempts only — a break prompt during a run would cost the
          very attempt it exists to protect. */}
      {breakNudge.due && <BreakNudge kind={breakNudge.due} onDismiss={breakNudge.dismiss} />}

      {pressureOn && (
        <PressureLayer
          remainingSec={countdown.remainingSec}
          currentWpm={Math.round(liveWpm)}
          targetWpm={rules.minWpm}
          active={active}
          sound={sound}
        />
      )}

      {/* The exam-software skin wraps the same panes rather than
          duplicating them: only the chrome differs, so the rules, the
          scoring and the keyboard behaviour cannot drift between skins. */}
      {examClient ? (
        <ExamClientChrome
          config={config}
          profile={profile}
          candidate={account?.name ?? ''}
          timer={timer}
        >
          {workingPane}
        </ExamClientChrome>
      ) : (
        workingPane
      )}

      {/* The commit bar. Boxed off from the working panes, because ending a run
          is the one irreversible thing on this screen and it should not sit
          loose against the passage. */}
      <div className="panel-lit flex shrink-0 items-center justify-between gap-4 rounded-panel border border-line bg-surface px-4 py-3 shadow-e1">
        {nonStop ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-danger-soft px-3 py-1 text-xs font-semibold text-danger-soft-fg">
            {t('exam.nonStop')}
          </span>
        ) : (
          <Button variant="secondary" onClick={togglePause} disabled={!typing}>
            {paused ? (
              <>
                <Play size={16} /> {t('exam.resume')}
              </>
            ) : (
              <>
                <Pause size={16} /> {t('exam.pause')}
              </>
            )}
          </Button>
        )}
        <Button onClick={() => void finish('manual')} disabled={submitting}>
          {submitting ? t('exam.submitting') : t('exam.endSubmit')}
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
