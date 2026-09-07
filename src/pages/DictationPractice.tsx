import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Crosshair,
  Ear,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useDictationDrill } from '@/hooks/useDictationDrill';
import { isDevanagari } from '@/core/text/scripts';
import { HindiFont } from '@/core/constants';
import { FONT_FAMILY } from '@/ui/fonts';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ProgressBar } from '@/ui/ProgressBar';
import { SkeletonCard } from '@/ui/Skeleton';
import { useT } from '@/i18n';

/**
 * Dictation practice over your own mistakes.
 *
 * The rest of the app tests copying: a passage is on screen and you reproduce
 * it. That is the exam, but it is not where the marks are lost — a word you can
 * copy cleanly is still a word you misspell when the passage is on the desk
 * beside you or being read aloud, because copying never asked you to *know* the
 * spelling. This asks. The word is spoken, never shown, and you type it.
 *
 * There is nothing to set up and no list to curate: the queue is the mistake
 * history, so every slip in every run enrols itself here, and every answer
 * moves the same review card the trainer schedules. Miss a word and it drops
 * down the ladder and comes back tomorrow.
 */
export function DictationPractice() {
  const t = useT();
  const navigate = useNavigate();
  const lang = useSettingsStore((s) => s.lang);
  const hindiFont = useSettingsStore((s) => s.hindiFont);
  const drill = useDictationDrill(lang);
  const [answer, setAnswer] = useState('');
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
    if (!answer.trim()) return;
    drill.submit(answer);
    setAnswer('');
  }

  function onNext() {
    drill.next();
    setAnswer('');
  }

  function onSkip() {
    drill.skip();
    setAnswer('');
  }

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dictate.title')}</h1>
        <p className="mt-1 max-w-2xl text-fg-muted">{t('dictate.subtitle')}</p>
      </div>
      {drill.stats.words > 0 && (
        <Button variant="secondary" onClick={drill.restart}>
          <RotateCcw size={16} /> {t('dictate.newBatch')}
        </Button>
      )}
    </div>
  );

  if (drill.loading) {
    return (
      <div className="space-y-6">
        {header}
        <SkeletonCard lines={4} />
      </div>
    );
  }

  if (drill.unsupported) {
    return (
      <div className="space-y-6">
        {header}
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <VolumeX size={17} className="shrink-0 text-danger-text" />
            {t('dictation.unsupportedTitle')}
          </h2>
          <p className="text-sm text-fg-muted">{t('dictate.unsupportedBody')}</p>
        </Card>
      </div>
    );
  }

  // Nothing to drill: no mistakes have been recorded yet, which is not a
  // failure state and should not read as one.
  if (drill.stats.words === 0) {
    return (
      <div className="space-y-6">
        {header}
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

        {/* The word is *not* on screen. That is the entire exercise, and it is
            why this cannot be a variant of the weak-word drill. */}
        <div className="flex flex-col items-center gap-3 rounded-panel border border-line bg-surface-2 px-6 py-7 text-center">
          <Ear size={26} className="text-accent-text" />
          <p className="text-sm text-fg-muted">
            {drill.holding ? t('dictate.holdBody') : t('dictate.listenBody')}
          </p>
          <Button
            variant="secondary"
            onClick={drill.replay}
            disabled={drill.holding || drill.replaysLeft === 0}
            title={drill.replaysLeft === 0 ? t('dictate.noReplays') : t('dictate.replayHint')}
          >
            <Volume2 size={16} />
            {t('dictate.replay', { left: drill.replaysLeft })}
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
              {t('dictate.inputLabel')}
            </span>
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
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
                  <XCircle size={15} className="shrink-0" />
                  <span className="font-semibold">{t('dictate.wrong')}</span>
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
              <Button type="button" onClick={onNext}>
                {t('dictate.continue')}
              </Button>
            ) : (
              <Button type="submit" disabled={!answer.trim()}>
                {t('dictate.check')}
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={onSkip} disabled={drill.holding}>
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
