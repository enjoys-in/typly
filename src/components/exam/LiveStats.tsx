import { useMemo } from 'react';
import { Ban, Gauge, Keyboard, Target, TriangleAlert, Type } from 'lucide-react';
import { evaluate } from '@/core/typing/typingEngine';
import { grossWpm } from '@/core/scoring/scoring';
import { kdph } from '@/core/scoring/kdph';
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
  /**
   * Key depressions so far, for a post graded in KDPH. Without this a
   * data-entry run shows no sign of the one number it is marked on — the
   * register view has its own reading, but a prose passage on a KDPH board
   * would otherwise show nothing at all.
   */
  depressions?: number;
  /** The post's depressions-per-hour bar; zero for a WPM-scored profile. */
  targetKdph?: number;
}

// Live metrics panel shown beside the passage during the test.
export function LiveStats({
  passage,
  typed,
  elapsedMs,
  targetWpm = 0,
  targetAccuracy = 0,
  blocked = 0,
  depressions = 0,
  targetKdph = 0,
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
  // Rates over the first seconds swing wildly, so the pass/fail colour waits
  // until there is enough elapsed time for the figure to mean anything.
  const rate = targetKdph > 0 ? kdph(depressions, elapsedMs) : 0;
  const kdphOnPace = targetKdph > 0 && elapsedMs > 3_000 ? rate >= targetKdph : null;

  return (
    <div className="panel-lit flex flex-col rounded-panel border border-line bg-surface shadow-e1">
      {/* The one figure the whole panel exists for, on its own tinted shelf so
          it is never read as just the first of six numbers. */}
      <div className="rounded-t-panel border-b border-line bg-surface-2 px-5 py-4">
        <Metric
          icon={Gauge}
          label={t('stats.liveWpm')}
          value={started ? String(wpm) : '—'}
          target={targetWpm > 0 ? t('stats.target', { value: targetWpm }) : undefined}
          onPace={wpmOnPace}
          big
        />
      </div>

      <div className="flex flex-col gap-4 p-5">
        {targetKdph > 0 && (
          <Metric
            icon={Keyboard}
            label={t('stats.kdph')}
            value={started ? rate.toLocaleString() : '—'}
            target={t('stats.target', { value: targetKdph.toLocaleString() })}
            onPace={kdphOnPace}
          />
        )}

        {/* A hairline gutter between the pair rather than a divider under it:
            two numbers side by side need separating from each other, not
            boxing in. */}
        <div className="grid grid-cols-2 gap-4 divide-x divide-line">
          <Metric
            icon={Target}
            label={t('stats.accuracy')}
            value={accuracy === null ? '—' : `${accuracy}%`}
            target={
              targetAccuracy > 0 ? t('stats.target', { value: `${targetAccuracy}%` }) : undefined
            }
            onPace={accOnPace}
          />
          <div className="pl-4">
            <Metric
              icon={TriangleAlert}
              label={t('stats.errors')}
              value={String(errors)}
              danger={errors > 0}
            />
          </div>
        </div>

        <div className="space-y-2 border-t border-line pt-4">
          <div className="flex items-baseline justify-between text-[11px]">
            <span className="font-semibold tracking-[0.09em] text-fg-muted uppercase">
              {t('stats.progress')}
            </span>
            <span className="font-semibold text-fg-muted tabular-nums">
              {typed.length}/{passage.length}
            </span>
          </div>
          <ProgressBar value={progress} />
        </div>

        {/* Secondary counts, as a definition list of quiet rows. They are
            reference, not readings — nothing here needs a display size. */}
        <dl className="flex flex-col gap-2.5 border-t border-line pt-4 text-[13px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-fg-muted">
              <Type size={14} className="shrink-0 text-fg-subtle" /> {t('stats.words')}
            </dt>
            <dd className="font-semibold tabular-nums">{countWords(typed)}</dd>
          </div>

          {blocked > 0 && (
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-fg-muted" title={t('exam.blockedHint')}>
                <Ban size={14} className="shrink-0 text-danger-text" /> {t('stats.blocked')}
              </dt>
              <dd className="font-semibold text-danger-text tabular-nums">{blocked}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
