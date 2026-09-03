import { useMemo, useState } from 'react';
import { Check, Play, RotateCcw, Scissors } from 'lucide-react';
import type { DocumentRow } from '@/core/types';
import { SPLIT_PRESETS, splitPassage, suggestChunkChars } from '@/core/text/splitter';
import { percentDone, type PartProgress } from '@/core/library/progress';
import { planFor } from '@/core/library/parts';
import { Button } from '@/ui/Button';
import { ProgressBar } from '@/ui/ProgressBar';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';

const OPTIONS: SegmentedOption<number>[] = SPLIT_PRESETS.map((preset) => ({
  value: preset.chars,
  label: preset.label,
  title: `About ${preset.chars.toLocaleString()} characters per passage`,
}));

interface Props {
  doc: DocumentRow;
  progress: PartProgress | null;
  /** Run the document from `index`, with the rest following automatically. */
  onStart: (index: number) => void;
  /** Cut (or re-cut) the document at this chunk size. */
  onSplit: (chunkChars: number) => void;
  /** Forget the split entirely, back to one long paragraph. */
  onReset: () => void;
}

/**
 * The split view of one saved paragraph: which parts are done, which comes
 * next, and a way to jump to any of them. This is the "resume where you left
 * off" surface — clicking a part starts there and the remaining parts follow.
 */
export function DocumentParts({ doc, progress, onStart, onSplit, onReset }: Props) {
  const plan = useMemo(() => planFor(doc, progress), [doc, progress]);
  const [chunkChars, setChunkChars] = useState(
    () => progress?.chunkChars ?? suggestChunkChars(doc.charCount),
  );
  const preview = useMemo(
    () => (plan ? null : splitPassage(doc.content, chunkChars)),
    [plan, doc.content, chunkChars],
  );

  // Not split yet — offer to cut it up.
  if (!plan || !progress) {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-fg-muted uppercase">
          <Scissors size={14} /> Split into passages
        </p>
        <p className="text-sm text-fg-muted">
          {doc.charCount.toLocaleString()} characters is a lot for one sitting. Cut it into parts
          and Typly remembers which one you reached.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            options={OPTIONS}
            value={chunkChars}
            onChange={setChunkChars}
            ariaLabel="Passage length"
          />
          <Button size="sm" onClick={() => onSplit(chunkChars)}>
            <Scissors size={13} /> Split into {preview?.length ?? 0}
          </Button>
        </div>
      </div>
    );
  }

  const total = plan.parts.length;
  const doneCount = plan.done.length;
  const complete = doneCount >= total;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-fg-muted uppercase">
            <Scissors size={14} /> {total} passages · ~{progress.chunkChars.toLocaleString()} chars
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            {complete
              ? 'Every passage done — start again from any part.'
              : `Part ${plan.startIndex + 1} is next. ${doneCount} of ${total} done.`}
          </p>
        </div>
        <Button size="sm" onClick={() => onStart(plan.startIndex)}>
          <Play size={13} /> {complete ? 'Type again' : `Continue part ${plan.startIndex + 1}`}
        </Button>
      </div>

      <div className="space-y-2">
        <ProgressBar value={percentDone(progress)} />
        <div className="flex flex-wrap gap-1.5">
          {plan.parts.map((text, i) => {
            const isDone = plan.done.includes(i);
            const isNext = !complete && i === plan.startIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onStart(i)}
                title={`${text.length.toLocaleString()} characters — ${text.slice(0, 80)}…`}
                className={`flex h-7 min-w-7 cursor-pointer items-center justify-center gap-1 rounded-inner px-1.5 text-xs font-semibold tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-ring ${
                  isDone
                    ? 'bg-accent text-accent-fg'
                    : isNext
                      ? 'bg-accent-soft text-accent-soft-fg ring-1 ring-accent-border'
                      : 'bg-surface-3 text-fg-muted hover:text-fg'
                }`}
              >
                {isDone && <Check size={11} className="shrink-0" />}
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
        <span className="text-xs text-fg-subtle">Re-cut at a different length:</span>
        <Segmented
          options={OPTIONS}
          value={chunkChars}
          onChange={(next) => {
            setChunkChars(next);
            // Re-cutting renumbers the parts, so the stored progress can't be
            // carried over — startProgress drops it.
            if (next !== progress.chunkChars) onSplit(next);
          }}
          ariaLabel="Passage length"
        />
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw size={13} /> Undo split
        </Button>
      </div>
    </div>
  );
}
