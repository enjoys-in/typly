import { useMemo } from 'react';
import { Scissors } from 'lucide-react';
import { SPLIT_PRESETS, splitPassage } from '@/core/text/splitter';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { Toggle } from '@/ui/Toggle';

/** 0 means "keep it as one passage". */
export type ChunkChoice = number;
export const NO_SPLIT: ChunkChoice = 0;

const OPTIONS: SegmentedOption<number>[] = SPLIT_PRESETS.map((preset) => ({
  value: preset.chars,
  label: preset.label,
  title: `About ${preset.chars.toLocaleString()} characters per passage`,
}));

interface Props {
  text: string;
  chunkChars: ChunkChoice;
  onChange: (chunkChars: ChunkChoice) => void;
  /** Chunk size to fall back to when the split is switched back on. */
  suggested: number;
}

/**
 * Offered whenever an imported text is longer than one sitting: a chapter, a
 * scanned page run or a pasted study note becomes a numbered set of passages
 * that run back-to-back, and that the library can resume part-way through.
 */
export function PassageSplitPanel({ text, chunkChars, onChange, suggested }: Props) {
  const enabled = chunkChars > 0;
  const parts = useMemo(
    () => (enabled ? splitPassage(text, chunkChars) : []),
    [enabled, text, chunkChars],
  );
  const shortest = parts.reduce((min, p) => Math.min(min, p.text.length), Infinity);
  const longest = parts.reduce((max, p) => Math.max(max, p.text.length), 0);

  return (
    <div className="space-y-4 rounded-panel border border-line bg-surface-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Scissors size={17} className="mt-0.5 shrink-0 text-fg-subtle" />
          <div>
            <p className="text-sm font-semibold">Split into passages</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-fg-muted">
              This text is long for one test. Split it and each part becomes its own attempt —
              the library remembers which part you reached.
            </p>
          </div>
        </div>
        <Toggle
          checked={enabled}
          onChange={(next) => onChange(next ? suggested : NO_SPLIT)}
          label="Split"
        />
      </div>

      {enabled && (
        <div className="space-y-3 border-t border-line pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium tracking-wide text-fg-muted uppercase">
              Passage length
            </span>
            <Segmented
              options={OPTIONS}
              value={chunkChars}
              onChange={onChange}
              ariaLabel="Passage length"
            />
          </div>
          <p className="text-[13px] tabular-nums text-fg-muted">
            <span className="font-semibold text-accent-text">{parts.length} passages</span>
            {parts.length > 1 && (
              <>
                {' · '}
                {shortest.toLocaleString()}–{longest.toLocaleString()} characters each
              </>
            )}
            {' · cut at sentence ends'}
          </p>
        </div>
      )}
    </div>
  );
}
