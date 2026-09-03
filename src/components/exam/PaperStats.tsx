import { Gauge, Type, Undo2 } from 'lucide-react';
import { CHARS_PER_WORD } from '@/core/constants';
import { grossWpm } from '@/core/scoring/scoring';
import { liveWordCount } from '@/core/scoring/freeform';
import { Metric } from './Metric';

interface Props {
  typed: string;
  elapsedMs: number;
  backspaces: number;
  /** The board's speed target, so the number can be read against a cut-off. */
  targetWpm?: number;
}

/**
 * The live panel for a paper-mode run.
 *
 * Accuracy, errors and progress all need a passage to compare against, and
 * there isn't one — spelling is only checked once the run ends. So this shows
 * what can honestly be measured while typing: speed, words and corrections.
 */
export function PaperStats({ typed, elapsedMs, backspaces, targetWpm = 0 }: Props) {
  const minutes = Math.max(elapsedMs / 60_000, 1 / 60_000);
  const wpm = Math.round(grossWpm(typed.length, minutes, CHARS_PER_WORD) * 10) / 10;
  const started = typed.length > 0;

  return (
    <div className="flex flex-col gap-4 rounded-panel border border-line bg-surface p-5">
      <Metric
        icon={Gauge}
        label="Live WPM"
        value={started ? String(wpm) : '—'}
        target={targetWpm > 0 ? `target ${targetWpm}` : undefined}
        onPace={started && targetWpm > 0 ? wpm >= targetWpm : null}
        big
      />

      <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
        <Metric icon={Type} label="Words" value={String(liveWordCount(typed))} />
        <Metric icon={Undo2} label="Corrections" value={String(backspaces)} />
      </div>

      <p className="border-t border-line pt-4 text-xs leading-relaxed text-fg-muted">
        Spelling and grammar are checked when you submit — there is no passage to compare against
        as you type.
      </p>
    </div>
  );
}
