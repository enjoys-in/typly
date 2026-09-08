import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Crosshair,
  RotateCcw,
  Settings2,
  SkipForward,
  Timer,
  XCircle,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useDictationDrill } from '@/hooks/useDictationDrill';
import { isDevanagari } from '@/core/text/scripts';
import {
  DICTATION_DRILL_WORDS_MAX,
  DICTATION_DRILL_WORDS_MIN,
  DICTATION_LIMIT_SEC_MAX,
  DICTATION_LIMIT_SEC_MIN,
  DictationView,
  HindiFont,
} from '@/core/constants';
import type { DrillLineItem } from '@/core/dictation/wordDrill';
import { FONT_FAMILY } from '@/ui/fonts';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ProgressBar } from '@/ui/ProgressBar';
import { Segmented } from '@/ui/Segmented';
import { SkeletonCard } from '@/ui/Skeleton';
import { Toggle } from '@/ui/Toggle';
import { useT } from '@/i18n';

/**
 * A speed drill over your own mistakes.
 *
 * The rest of the app tests copying a passage with the clock running on the
 * passage as a whole, which lets you spend four seconds on the one word you are
 * unsure of and make it back on the next line. That is how a word you cannot
 * actually spell survives a hundred practice runs: you are reconstructing it
 * each time, slowly, from the sentence around it.
 *
 * So here each word stands alone with its own clock — three seconds by default,
 * about what a word gets in a real passage — and there is no sentence to lean
 * on. Type it or lose it. There is nothing to set up and no list to curate: the
 * queue is the mistake history, so every slip in every run enrols itself here,
 * and every answer moves the same review card the Trainer schedules.
 */
export function DictationPractice() {
  const t = useT();
  const navigate = useNavigate();
  const lang = useSettingsStore((s) => s.lang);
  const hindiFont = useSettingsStore((s) => s.hindiFont);
  const view = useSettingsStore((s) => s.dictationView);
  const timed = useSettingsStore((s) => s.dictationTimed);
  const limitSec = useSettingsStore((s) => s.dictationLimitSec);
  const shuffle = useSettingsStore((s) => s.dictationShuffle);
  const words = useSettingsStore((s) => s.dictationWords);
  // Selected one by one rather than by taking the whole store: this page
  // re-renders on the countdown tick, and it should not also re-render on
  // every unrelated preference anyone changes.
  const setView = useSettingsStore((s) => s.setDictationView);
  const setTimed = useSettingsStore((s) => s.setDictationTimed);
  const setLimitSec = useSettingsStore((s) => s.setDictationLimitSec);
  const setShuffle = useSettingsStore((s) => s.setDictationShuffle);
  const setWords = useSettingsStore((s) => s.setDictationWords);

  const drill = useDictationDrill({ timed, limitSec, shuffle, words });
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Legacy Devanagari fonts apply here too: a word typed in Kruti Dev has to be
  // legible in the field it is typed into.
  const fontFamily =
    isDevanagari(lang) && hindiFont !== HindiFont.System ? FONT_FAMILY[hindiFont] : undefined;

  // The field holds focus for the whole drill — including after a miss has been
  // acknowledged, where the Continue button would otherwise keep it.
  useEffect(() => {
    if (drill.word && !drill.holding) inputRef.current?.focus();
  }, [drill.word, drill.holding]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (drill.holding) {
      drill.next();
      return;
    }
    if (!drill.typed.trim()) return;
    drill.submit();
  }

  /**
   * Space ends a word, the way it does when typing a real line. Without this
   * the drill would be the only place in the app where finishing a word needs a
   * different key from the one your hands already use.
   */
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== ' ' || drill.holding) return;
    e.preventDefault();
    if (drill.typed.trim()) drill.submit();
  }

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dictate.title')}</h1>
        <p className="mt-1 max-w-2xl text-fg-muted">{t('dictate.subtitle')}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => setShowOptions((open) => !open)}
          aria-expanded={showOptions}
        >
          <Settings2 size={16} /> {t('dictate.options')}
        </Button>
        {drill.stats.words > 0 && (
          <Button variant="secondary" onClick={drill.restart}>
            <RotateCcw size={16} /> {t('dictate.newBatch')}
          </Button>
        )}
      </div>
    </div>
  );

  // The options sit above everything the drill can be in — loading, empty,
  // finished — because half of them only take effect on the *next* batch, and
  // the moment you want to change them is the moment one has just ended.
  const options = showOptions && (
    <Card className="space-y-4">
      <h2 className="text-sm font-semibold">{t('dictate.optionsTitle')}</h2>

      <label className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex flex-col">
          <span className="text-sm font-medium">{t('dictate.viewLabel')}</span>
          <span className="text-xs text-fg-muted">{t('dictate.viewHint')}</span>
        </span>
        <Segmented
          ariaLabel={t('dictate.viewLabel')}
          value={view}
          onChange={setView}
          options={[
            { value: DictationView.Word, label: t('dictate.viewWord') },
            { value: DictationView.Line, label: t('dictate.viewLine') },
          ]}
        />
      </label>

      <Toggle
        label={t('dictate.timedLabel')}
        hint={t('dictate.timedHint')}
        checked={timed}
        onChange={setTimed}
      />

      <label className="flex max-w-2xl items-center justify-between gap-4">
        <span className="flex flex-col">
          <span className="text-sm font-medium">{t('dictate.limitLabel')}</span>
          <span className="text-xs text-fg-muted">{t('dictate.limitHint')}</span>
        </span>
        <input
          type="number"
          min={DICTATION_LIMIT_SEC_MIN}
          max={DICTATION_LIMIT_SEC_MAX}
          value={limitSec}
          disabled={!timed}
          onChange={(e) => setLimitSec(Number(e.target.value))}
          aria-label={t('dictate.limitLabel')}
          className="select w-20 disabled:opacity-55"
        />
      </label>

      <Toggle
        label={t('dictate.shuffleLabel')}
        hint={t('dictate.shuffleHint')}
        checked={shuffle}
        onChange={setShuffle}
      />

      <label className="flex max-w-2xl items-center justify-between gap-4">
        <span className="flex flex-col">
          <span className="text-sm font-medium">{t('dictate.batchLabel')}</span>
          <span className="text-xs text-fg-muted">{t('dictate.batchHint')}</span>
        </span>
        <input
          type="number"
          min={DICTATION_DRILL_WORDS_MIN}
          max={DICTATION_DRILL_WORDS_MAX}
          value={words}
          onChange={(e) => setWords(Number(e.target.value))}
          aria-label={t('dictate.batchLabel')}
          className="select w-20"
        />
      </label>
    </Card>
  );

  if (drill.loading) {
    return (
      <div className="space-y-6">
        {header}
        {options}
        <SkeletonCard lines={4} />
      </div>
    );
  }

  // Nothing to drill: no mistakes have been recorded yet, which is not a
  // failure state and should not read as one.
  if (drill.stats.words === 0) {
    return (
      <div className="space-y-6">
        {header}
        {options}
        <Card className="flex flex-col items-start gap-3">
          <Crosshair className="text-fg-subtle" />
          <p className="text-sm text-fg-muted">{t('dictate.empty')}</p>
          <Button onClick={() => navigate('/app/new')}>{t('dictate.emptyAction')}</Button>
        </Card>
      </div>
    );
  }

  if (drill.finished) {
    return (
      <div className="space-y-6">
        {header}
        {options}
        <Card className="space-y-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-accent-text" />
            <h2 className="font-semibold">{t('dictate.doneTitle')}</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Tally label={t('dictate.words')} value={String(drill.stats.words)} />
            <Tally
              label={t('dictate.spelled')}
              value={`${drill.stats.correct}/${drill.stats.words}`}
            />
            <Tally label={t('stats.accuracy')} value={`${drill.stats.accuracy}%`} tone="accent" />
          </div>

          {drill.missed.length > 0 ? (
            <div className="space-y-2 border-t border-line pt-4">
              <p className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-subtle uppercase">
                {t('dictate.missedHeading')}
              </p>
              <ul className="space-y-1.5">
                {drill.missed.map((miss) => (
                  <li
                    key={miss.word}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-control bg-surface-2 px-3 py-2 text-sm ring-1 ring-line ring-inset"
                  >
                    <span className="font-mono font-semibold" style={{ fontFamily }}>
                      {miss.word}
                    </span>
                    {miss.typed ? (
                      <span className="font-mono text-danger-text line-through" style={{ fontFamily }}>
                        {miss.typed}
                      </span>
                    ) : (
                      <span className="text-xs text-fg-subtle">{t('dictate.skipped')}</span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="pt-1 text-xs leading-relaxed text-fg-subtle">
                {t('dictate.missedHint')}
              </p>
            </div>
          ) : (
            <p className="flex items-center gap-2 border-t border-line pt-4 text-sm text-fg-muted">
              <CheckCircle2 size={15} className="shrink-0 text-accent-text" />
              {t('dictate.allCorrect')}
            </p>
          )}

          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            <Button onClick={drill.restart}>
              <RotateCcw size={16} /> {t('dictate.again')}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/app/trainer')}>
              {t('dictate.toTrainer')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const feedback = drill.feedback;

  return (
    <div className="space-y-6">
      {header}
      {options}

      <Card className="space-y-5">
        {/* Where you are in the batch. A finishable list is the whole reason
            anyone starts one, so the count is the first thing on the card. */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold tracking-wide text-fg-muted uppercase">
              {t('dictate.wordOf', { current: drill.index, total: drill.stats.words })}
            </span>
            <span className="text-fg-subtle tabular-nums">
              {t('dictate.correctSoFar', {
                correct: drill.stats.correct,
                answered: drill.stats.answered,
              })}
            </span>
          </div>
          <ProgressBar value={(drill.stats.answered / Math.max(1, drill.stats.words)) * 100} />
        </div>

        <div className="space-y-3 rounded-panel border border-line bg-surface-2 px-5 py-6">
          {view === DictationView.Word ? (
            <p
              className="text-center text-[2.5rem] leading-tight font-bold tracking-tight break-all"
              style={{ fontFamily }}
            >
              {drill.word}
            </p>
          ) : (
            <WordLine items={drill.line} fontFamily={fontFamily} />
          )}

          {timed && (
            <Countdown
              remainingMs={drill.remainingMs}
              limitMs={drill.limitMs}
              running={!drill.holding}
              label={t('dictate.timeLeft', { sec: (drill.remainingMs / 1000).toFixed(1) })}
              ariaLabel={t('dictate.timerAria')}
            />
          )}

          <p className="text-center text-sm text-fg-muted">
            {drill.holding ? t('dictate.holdBody') : t('dictate.typeBody')}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
              {t('dictate.inputLabel')}
            </span>
            <input
              ref={inputRef}
              value={drill.typed}
              onChange={(e) => drill.setTyped(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={drill.holding}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              // Autocorrect would answer the question for them, which is the
              // one thing this screen must never do.
              autoCorrect="off"
              placeholder={t('dictate.inputPlaceholder')}
              style={{ fontFamily }}
              className="w-full rounded-control border border-edge bg-inset px-4 py-3 font-mono text-lg outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-fg-subtle focus:border-accent-border focus:bg-field focus:ring-1 focus:ring-accent-ring disabled:opacity-55"
            />
          </label>

          {feedback && (
            <div
              role="status"
              className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-control px-3 py-2 text-sm ${
                feedback.correct
                  ? 'bg-accent-soft text-accent-soft-fg'
                  : 'bg-danger-soft text-danger-soft-fg'
              }`}
            >
              {feedback.correct ? (
                <>
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span className="font-semibold">{t('dictate.right')}</span>
                </>
              ) : (
                <>
                  {feedback.timedOut ? (
                    <Timer size={15} className="shrink-0" />
                  ) : (
                    <XCircle size={15} className="shrink-0" />
                  )}
                  <span className="font-semibold">
                    {feedback.timedOut ? t('dictate.timeUp') : t('dictate.wrong')}
                  </span>
                  <span className="font-mono font-bold" style={{ fontFamily }}>
                    {feedback.word}
                  </span>
                  {feedback.typed && (
                    <span className="font-mono line-through opacity-70" style={{ fontFamily }}>
                      {feedback.typed}
                    </span>
                  )}
                  {feedback.retrying && (
                    <span className="text-xs opacity-80">{t('dictate.willReturn')}</span>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {drill.holding ? (
              <Button type="button" onClick={drill.next}>
                {t('dictate.continue')}
              </Button>
            ) : (
              <Button type="submit" disabled={!drill.typed.trim()}>
                {t('dictate.check')}
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={drill.skip} disabled={drill.holding}>
              <SkipForward size={16} /> {t('dictate.skip')}
            </Button>
          </div>
        </form>

        <p className="border-t border-line pt-4 text-xs leading-relaxed text-fg-subtle">
          {t('dictate.explainer')}
        </p>
      </Card>
    </div>
  );
}

/** Colours for each state a word in the line can be in. */
const LINE_TONE: Record<DrillLineItem['state'], string> = {
  right: 'text-fg-subtle',
  wrong: 'text-danger-text line-through decoration-2',
  current: 'rounded-inner bg-accent-soft px-2 py-0.5 font-bold text-accent-soft-fg',
  pending: 'text-fg-muted',
};

/**
 * The batch as one line of text, the way it would arrive in a passage.
 *
 * Seeing the next three words while finishing this one is not a hint — it is
 * the skill. Reading ahead is what separates a typist who moves through a line
 * from one who stops dead at each word, and it cannot be practised on a screen
 * that only ever shows one word.
 */
function WordLine({ items, fontFamily }: { items: DrillLineItem[]; fontFamily?: string }) {
  const currentRef = useRef<HTMLSpanElement>(null);
  const current = items.find((item) => item.state === 'current')?.key;

  // Keep the word being typed in view: the line is one row and does not wrap,
  // so a long batch scrolls it out of the panel within a few answers.
  useEffect(() => {
    const node = currentRef.current;
    if (!node) return;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  }, [current]);

  return (
    <div className="-mx-1 overflow-x-auto px-1 py-1">
      <p
        className="flex w-max items-baseline gap-3 font-mono text-xl whitespace-nowrap"
        style={{ fontFamily }}
      >
        {items.map((item) => (
          <span
            key={item.key}
            ref={item.state === 'current' ? currentRef : undefined}
            className={LINE_TONE[item.state]}
          >
            {item.word}
          </span>
        ))}
      </p>
    </div>
  );
}

/**
 * The clock on the current word, as a bar that drains.
 *
 * A bar rather than a number alone: with three seconds on offer there is no
 * time to read a digit, but the width of a bar is taken in peripherally, which
 * is the only way to see the clock without looking away from the word.
 */
function Countdown({
  remainingMs,
  limitMs,
  running,
  label,
  ariaLabel,
}: {
  remainingMs: number;
  limitMs: number;
  running: boolean;
  label: string;
  ariaLabel: string;
}) {
  const pct = limitMs > 0 ? Math.min(100, Math.max(0, (remainingMs / limitMs) * 100)) : 0;
  // The last second is the one that changes behaviour, so it gets the fail tone.
  const urgent = running && remainingMs <= 1000;

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3 ring-1 ring-line ring-inset"
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={Math.round(limitMs / 1000)}
        aria-valuenow={Math.ceil(remainingMs / 1000)}
      >
        <div
          className={`h-full rounded-full ${urgent ? 'bg-danger' : 'brand-gradient'}`}
          style={{ width: `${running ? pct : 100}%` }}
        />
      </div>
      <span
        className={`w-12 text-right text-sm font-semibold tabular-nums ${
          urgent ? 'text-danger-text' : 'text-fg-muted'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Tally({ label, value, tone }: { label: string; value: string; tone?: 'accent' }) {
  return (
    <div className="rounded-panel bg-surface-2 p-3 ring-1 ring-line ring-inset">
      <p className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
        {label}
      </p>
      <p
        className={`mt-1 text-[1.5rem] leading-none font-bold tracking-tight tabular-nums ${
          tone === 'accent' ? 'text-accent-text' : 'text-fg'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
