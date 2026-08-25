import { ArrowRight } from 'lucide-react';
import type { TestResult } from '@/core/types';
import { TestStatus } from '@/core/constants';
import { SpeakButton } from '@/ui/SpeakButton';
import { Stat } from '@/ui/Stat';

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ResultSummary({ result, durationSec }: { result: TestResult; durationSec: number }) {
  const passed = result.status === TestStatus.Passed;
  const dropped = Math.round((result.grossWpm - result.netWpm) * 10) / 10;
  const mistakeLabel = `${result.errors} mistake${result.errors === 1 ? '' : 's'}`;
  const minutes = Math.max(durationSec / 60, 1 / 60);
  const cpm = Math.round(result.charsTyped / minutes);

  return (
    <div className="space-y-6">
      {/* Original speed vs penalized net speed (−1 WPM per mistake). */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-panel bg-surface-2 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-fg-muted">Original speed</p>
          <p className="text-3xl font-bold tabular-nums">
            {result.grossWpm} <span className="text-base font-normal text-fg-subtle">WPM</span>
          </p>
        </div>
        <ArrowRight className="text-fg-subtle" />
        <div>
          <p className="text-xs uppercase tracking-wide text-fg-muted">Net speed</p>
          <p className="text-3xl font-bold tabular-nums text-accent-text">
            {result.netWpm} <span className="text-base font-normal text-fg-subtle">WPM</span>
          </p>
        </div>
        {dropped > 0 ? (
          <p className="text-sm text-danger-text">
            −{dropped} WPM for {mistakeLabel}
          </p>
        ) : (
          <p className="text-sm text-fg-muted">
            {result.errors > 0 ? `${mistakeLabel} · no speed penalty` : 'No mistakes 🎉'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label="Gross WPM" value={String(result.grossWpm)} />
        <Stat label="Net WPM" value={String(result.netWpm)} accent />
        <Stat label="CPM" value={String(cpm)} />
        <Stat label="Accuracy" value={`${result.accuracy}%`} />
        <Stat label="Time" value={fmtTime(durationSec)} />
        <Stat label="Characters" value={String(result.charsTyped)} />
        <Stat label="Correct words" value={String(result.correctWords)} />
        <Stat label="Wrong words" value={String(result.wrongWords)} />
        <Stat label="Correct chars" value={String(result.correctChars)} />
        <Stat label="Incorrect chars" value={String(result.incorrectChars)} />
        <Stat label="Errors" value={String(result.errors)} />
        <Stat label="Backspaces" value={String(result.backspaces ?? 0)} />
        <Stat label="Deletes" value={String(result.deletes ?? 0)} />
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`inline-block rounded-full px-4 py-1 text-sm font-bold ${
            passed ? 'bg-accent-soft text-accent-soft-fg' : 'bg-danger-soft text-danger-soft-fg'
          }`}
        >
          {passed ? 'PASSED ✓' : 'FAILED'}
        </span>
        <SpeakButton
          label="Read result"
          text={`Your net speed was ${result.netWpm} words per minute with ${result.accuracy} percent accuracy. ${
            passed ? 'You passed.' : 'You did not pass this time.'
          }`}
        />
      </div>
    </div>
  );
}
