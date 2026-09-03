import { useMemo } from 'react';
import { Ban, Gauge, Target, TriangleAlert, Type } from 'lucide-react';
import { evaluate } from '@/core/typing/typingEngine';
import { grossWpm } from '@/core/scoring/scoring';
import { CHARS_PER_WORD } from '@/core/constants';
import { countWords } from '@/core/typing/diff';
import { ProgressBar } from '@/ui/ProgressBar';
import { Metric } from './Metric';
import { useT } from '@/i18n';

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
  const t = useT();
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
        label={t('stats.liveWpm')}
        value={started ? String(wpm) : '—'}
        target={targetWpm > 0 ? t('stats.target', { value: targetWpm }) : undefined}
        onPace={wpmOnPace}
        big
      />

      <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
        <Metric
          icon={Target}
          label={t('stats.accuracy')}
          value={accuracy === null ? '—' : `${accuracy}%`}
          target={targetAccuracy > 0 ? t('stats.target', { value: `${targetAccuracy}%` }) : undefined}
          onPace={accOnPace}
        />
        <Metric icon={TriangleAlert} label={t('stats.errors')} value={String(errors)} danger={errors > 0} />
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium tracking-wide text-fg-muted uppercase">{t('stats.progress')}</span>
          <span className="tabular-nums text-fg-subtle">
            {typed.length}/{passage.length}
          </span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
        <span className="flex items-center gap-2 text-fg-muted">
          <Type size={14} /> {t('stats.words')}
        </span>
        <span className="font-semibold tabular-nums">{countWords(typed)}</span>
      </div>

      {blocked > 0 && (
        <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="flex items-center gap-2 text-fg-muted" title={t('exam.blockedHint')}>
            <Ban size={14} /> {t('stats.blocked')}
          </span>
          <span className="font-semibold tabular-nums text-danger-text">{blocked}</span>
        </div>
      )}
    </div>
  );
}
