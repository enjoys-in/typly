import { useMemo } from 'react';
import { Ban, Gauge, Target, TriangleAlert, Type } from 'lucide-react';
import { evaluate } from '@/core/typing/typingEngine';
import { grossWpm } from '@/core/scoring/scoring';
import { CHARS_PER_WORD } from '@/core/constants';
import { countWords } from '@/core/typing/diff';
import { ProgressBar } from '@/ui/ProgressBar';

interface Props {
  passage: string;
  typed: string;
  elapsedMs: number;
  /** Board targets, so the numbers can be read against the cut-off. */
  targetWpm?: number;
  targetAccuracy?: number;
  /** Keystrokes the exam rules refused, so a blocked key is accounted for. */
  blocked?: number;
}

// Live metrics panel shown beside the passage during the test.
export function LiveStats({
  passage,
  typed,
  elapsedMs,
  targetWpm = 0,
  targetAccuracy = 0,
  blocked = 0,
}: Props) {
  const { correctChars } = useMemo(() => evaluate(passage, typed), [passage, typed]);
  const minutes = Math.max(elapsedMs / 60_000, 1 / 60_000);
  const wpm = Math.round(grossWpm(correctChars, minutes, CHARS_PER_WORD) * 10) / 10;
  // Before the first keystroke there is no accuracy to report — 0% read as a fail.
  const accuracy = typed.length ? Math.round((correctChars / typed.length) * 1000) / 10 : null;
  const progress = passage.length ? (typed.length / passage.length) * 100 : 0;
  const errors = typed.length - correctChars;
  const started = typed.length > 0;

  const wpmOnPace = started && targetWpm > 0 ? wpm >= targetWpm : null;
  const accOnPace = accuracy !== null && targetAccuracy > 0 ? accuracy >= targetAccuracy : null;

  return (
    <div className="flex flex-col gap-4 rounded-panel border border-line bg-surface p-5">
      <Metric
        icon={Gauge}
        label="Live WPM"
        value={started ? String(wpm) : '—'}
        target={targetWpm > 0 ? `target ${targetWpm}` : undefined}
        onPace={wpmOnPace}
        big
      />

      <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
        <Metric
          icon={Target}
          label="Accuracy"
          value={accuracy === null ? '—' : `${accuracy}%`}
          target={targetAccuracy > 0 ? `target ${targetAccuracy}%` : undefined}
          onPace={accOnPace}
        />
        <Metric icon={TriangleAlert} label="Errors" value={String(errors)} danger={errors > 0} />
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium tracking-wide text-fg-muted uppercase">Progress</span>
          <span className="tabular-nums text-fg-subtle">
            {typed.length}/{passage.length}
          </span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
        <span className="flex items-center gap-2 text-fg-muted">
          <Type size={14} /> Words
        </span>
        <span className="font-semibold tabular-nums">{countWords(typed)}</span>
      </div>

      {blocked > 0 && (
        <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="flex items-center gap-2 text-fg-muted" title="Keys the exam rules refused">
            <Ban size={14} /> Blocked keys
          </span>
          <span className="font-semibold tabular-nums text-danger-text">{blocked}</span>
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  target,
  onPace,
  big = false,
  danger = false,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  target?: string;
  /** null = not enough data yet, so no pass/fail colour is implied. */
  onPace?: boolean | null;
  big?: boolean;
  danger?: boolean;
}) {
  const tone = danger
    ? 'text-danger-text'
    : onPace === true
      ? 'text-accent-text'
      : onPace === false
        ? 'text-danger-text'
        : 'text-fg';

  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-fg-muted uppercase">
        <Icon size={13} className="shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <p className={`${big ? 'text-3xl' : 'text-xl'} font-bold tabular-nums ${tone}`}>{value}</p>
      {target && <p className="text-[11px] text-fg-subtle">{target}</p>}
    </div>
  );
}
