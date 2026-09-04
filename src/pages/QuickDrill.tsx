import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useSettingsStore } from '@/store/settingsStore';
import { useCountdown } from '@/hooks/useCountdown';
import { generateDrill } from '@/core/practice/generators';
import { isMacOS } from '@/platform/detect';
import { evaluate, buildTimeline, countBackspaces } from '@/core/typing/typingEngine';
import { attemptedSlice, findMistakes, countWords } from '@/core/typing/diff';
import { score, applyDifficulty, applyMode } from '@/core/scoring/scoring';
import { profileFor } from '@/core/scoring/examProfiles';
import { PracticeKind, QUICK_DRILL_SECONDS, SourceType } from '@/core/constants';
import type { Keystroke } from '@/core/types';
import { PassageView } from '@/components/exam/PassageView';
import { Button } from '@/ui/Button';
import { useT } from '@/i18n';

/**
 * The 60-second drill, in an overlay window of its own.
 *
 * A session that costs one keystroke to start is the only kind that survives a
 * busy evening, and that is what keeps a streak alive. So this deliberately has
 * no setup, no library and no navigation: a generated drill, a clock, one
 * number at the end, and it closes itself.
 *
 * The result is still saved through the ordinary repository, so a minute here
 * counts towards the streak, the daily goal and every chart — otherwise it
 * would be practice that does not exist.
 */
export function QuickDrill() {
  const t = useT();
  const platform = usePlatform();
  const board = useSettingsStore((s) => s.board);
  const difficulty = useSettingsStore((s) => s.difficulty);
  const examMode = useSettingsStore((s) => s.examMode);
  const lang = useSettingsStore((s) => s.lang);

  const [passage, setPassage] = useState(() => generateDrill(PracticeKind.Words, isMacOS()));
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState<{ wpm: number; accuracy: number } | null>(null);
  const keystrokes = useRef<Keystroke[]>([]);
  const startAt = useRef(0);
  const saved = useRef(false);

  const started = typed.length > 0;
  const clock = useCountdown(QUICK_DRILL_SECONDS, started && done === null);

  const rules = useMemo(
    () => applyMode(applyDifficulty(profileFor(board).rules, difficulty), examMode),
    [board, difficulty, examMode],
  );

  const finish = useCallback(async () => {
    if (saved.current) return;
    saved.current = true;
    const elapsedMs = Math.max(startAt.current ? Date.now() - startAt.current : 0, 1000);
    const { correctChars, incorrectChars } = evaluate(passage, typed);
    const mistakes = findMistakes(attemptedSlice(passage, typed), typed);
    const result = score({
      charsTyped: typed.length,
      correctChars,
      incorrectChars,
      correctWords: Math.max(0, countWords(typed) - mistakes.length),
      wrongWords: mistakes.length,
      backspaces: countBackspaces(keystrokes.current),
      deletes: 0,
      errors: mistakes.length,
      elapsedMs,
      rules,
    });
    setDone({ wpm: result.netWpm, accuracy: result.accuracy });

    // Nothing typed is not a session; a zero-score row would corrupt the
    // averages every other screen reads.
    if (typed.length === 0) return;
    await platform.repo
      .saveTest({
        createdAt: new Date().toISOString(),
        documentId: null,
        lang,
        sourceType: SourceType.Text,
        examBoard: board,
        durationSec: Math.round(elapsedMs / 1000),
        passageLen: passage.length,
        result,
        mistakes,
        timeline: buildTimeline(keystrokes.current, elapsedMs),
        keystrokes: keystrokes.current,
      })
      .catch(() => null);
  }, [passage, typed, rules, platform, lang, board]);

  useEffect(() => {
    if (clock.expired && done === null) void finish();
  }, [clock.expired, done, finish]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key.length !== 1 && event.key !== 'Backspace') return;
      if (startAt.current === 0) startAt.current = Date.now();
      const index = typed.length;
      const expected = passage[index] ?? '';
      keystrokes.current.push({
        t: Date.now() - startAt.current,
        key: event.key,
        expected,
        correct: event.key === expected,
        index,
      });
    },
    [typed.length, passage],
  );

  function again() {
    saved.current = false;
    startAt.current = 0;
    keystrokes.current = [];
    setPassage(generateDrill(PracticeKind.Words, isMacOS()));
    setTyped('');
    setDone(null);
  }

  return (
    <div className="flex h-screen flex-col gap-2 bg-canvas p-3">
      {/* Frameless window: this strip is the title bar, so it has to be
          draggable — hence the app-region style rather than a class. */}
      <header
        className="flex shrink-0 items-center justify-between gap-3"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-xs font-semibold tracking-wide text-fg-muted uppercase">
          {t('quick.title')}
        </span>
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <span
            className={`font-mono text-lg font-bold tabular-nums ${
              clock.remainingSec <= 10 ? 'text-danger-text' : ''
            }`}
          >
            {clock.remainingSec}s
          </span>
          <button
            type="button"
            onClick={() => window.close()}
            aria-label={t('quick.close')}
            className="cursor-pointer rounded-control p-1 text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <X size={15} />
          </button>
        </div>
      </header>

      {done ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1">
          <p className="text-5xl font-bold tabular-nums text-accent-text">{done.wpm}</p>
          <p className="text-xs tracking-wide text-fg-muted uppercase">{t('quick.netWpm')}</p>
          <p className="mt-1 text-sm text-fg-muted tabular-nums">
            {t('quick.accuracy', { value: done.accuracy })}
          </p>
          <p className="mt-1 text-[11px] text-fg-subtle">{t('quick.counted')}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={again}>
              <RotateCcw size={14} /> {t('quick.again')}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => window.close()}>
              {t('quick.done')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <PassageView
            passage={passage}
            typed={typed}
            className="min-h-0 flex-1"
            fontScale={0.85}
            caret
          />
          <textarea
            autoFocus
            aria-label={t('quick.inputLabel')}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            placeholder={t('quick.placeholder')}
            className="h-16 w-full shrink-0 resize-none rounded-control border border-edge bg-field p-2.5 font-mono text-sm outline-none focus:border-accent"
          />
        </>
      )}
    </div>
  );
}
