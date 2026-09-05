import { ArrowRight } from 'lucide-react';
import type { TestResult } from '@/core/types';
import { TestStatus } from '@/core/constants';
import { useCountUp } from '@/hooks/useCountUp';
import { Ring } from '@/ui/Ring';
import { SpeakButton } from '@/ui/SpeakButton';
import { Stat } from '@/ui/Stat';
import { useT } from '@/i18n';

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ResultSummary({ result, durationSec }: { result: TestResult; durationSec: number }) {
  const t = useT();
  const passed = result.status === TestStatus.Passed;
  const dropped = Math.round((result.grossWpm - result.netWpm) * 10) / 10;
  const mistakeLabel = `${result.errors} mistake${result.errors === 1 ? '' : 's'}`;
  const minutes = Math.max(durationSec / 60, 1 / 60);
  const cpm = Math.round(result.charsTyped / minutes);
  // The three headline figures arrive rather than appear. This is the one
  // screen in the app where that is the right call: the run is over, there is
  // nothing left to read under time pressure, and the numbers are the payoff.
  // Net counts a beat longer than gross, so the eye follows the arrow.
  const grossUp = useCountUp(result.grossWpm, 620, 1);
  const netUp = useCountUp(result.netWpm, 820, 1);
  const accuracyUp = useCountUp(result.accuracy, 900);

  return (
    <div className="space-y-6">
      {/* Original speed vs penalized net speed (−1 WPM per mistake), with the
          accuracy arc pushed to the far end: speed and accuracy are the two
          independent things a board grades, so they read as two halves of one
          row rather than as items four and five of a list. */}
      <div className="panel-lit flex flex-wrap items-center gap-x-6 gap-y-4 rounded-panel border border-line bg-surface-2 p-5 shadow-e1">
        <div className="rise-in">
          <p className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
            {t('summary.originalSpeed')}
          </p>
          <p className="mt-1 text-[2rem] leading-none font-bold tracking-tight tabular-nums">
            {grossUp} <span className="text-sm font-semibold text-fg-subtle">WPM</span>
          </p>
        </div>
        <ArrowRight className="rise-in text-fg-subtle" style={{ animationDelay: '120ms' }} />
        <div className="rise-in" style={{ animationDelay: '180ms' }}>
          <p className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
            {t('summary.netSpeed')}
          </p>
          <p className="mt-1 text-[2rem] leading-none font-bold tracking-tight text-accent-text tabular-nums">
            {netUp} <span className="text-sm font-semibold text-fg-subtle">WPM</span>
          </p>
        </div>
        {dropped > 0 ? (
          <p className="rise-in text-sm font-medium text-danger-text" style={{ animationDelay: '300ms' }}>
            −{dropped} WPM for {mistakeLabel}
          </p>
        ) : (
          <p className="rise-in text-sm text-fg-muted" style={{ animationDelay: '300ms' }}>
            {result.errors > 0 ? `${mistakeLabel} · no speed penalty` : 'No mistakes 🎉'}
          </p>
        )}
        <div className="rise-in ml-auto" style={{ animationDelay: '240ms' }}>
          {/* The arc is fed the *counted* value, not the final one, so it
              sweeps as the digits climb. Given the final value on first
              render there would be no previous offset to transition from and
              the ring would simply appear, drawn but never drawing.

              Deliberately not tinted by pass/fail. This ring is accuracy, and
              a run can fail on speed with 96% accuracy — painting that red
              would blame the wrong number. "96% accurate, failed on speed" is
              the more useful thing to be told. */}
          <Ring value={accuracyUp} label={`${accuracyUp}%`} caption={t('dashboard.accuracy')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label={t('summary.grossWpm')} value={String(result.grossWpm)} />
        <Stat label={t('dashboard.netWpm')} value={String(result.netWpm)} accent />
        <Stat label="CPM" value={String(cpm)} />
        <Stat label={t('dashboard.accuracy')} value={`${result.accuracy}%`} />
        <Stat label={t('summary.time')} value={fmtTime(durationSec)} />
        <Stat label={t('summary.characters')} value={String(result.charsTyped)} />
        <Stat label={t('summary.correctWords')} value={String(result.correctWords)} />
        <Stat label={t('summary.wrongWords')} value={String(result.wrongWords)} />
        <Stat label={t('summary.correctChars')} value={String(result.correctChars)} />
        <Stat label={t('summary.incorrectChars')} value={String(result.incorrectChars)} />
        <Stat label={t('dashboard.errors')} value={String(result.errors)} />
        <Stat label={t('summary.backspaces')} value={String(result.backspaces ?? 0)} />
        <Stat label={t('summary.deletes')} value={String(result.deletes ?? 0)} />
      </div>

      <div className="flex items-center gap-3">
        {/* The verdict lands last, and on a spring. Everything above it is
            evidence; this is the sentence. */}
        <span
          className={`verdict-in inline-block rounded-full px-4 py-1.5 text-sm font-bold tracking-wide shadow-e1 ${
            passed
              ? 'bg-accent-soft text-accent-soft-fg ring-1 ring-accent-border ring-inset'
              : 'bg-danger-soft text-danger-soft-fg ring-1 ring-danger-border ring-inset'
          }`}
        >
          {passed ? 'PASSED ✓' : 'FAILED'}
        </span>
        <SpeakButton
          label={t('summary.readResult')}
          text={`Your net speed was ${result.netWpm} words per minute with ${result.accuracy} percent accuracy. ${
            passed ? 'You passed.' : 'You did not pass this time.'
          }`}
        />
      </div>
    </div>
  );
}
