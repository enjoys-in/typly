import { Gauge, SpellCheck, Type, Undo2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CHARS_PER_WORD } from '@/core/constants';
import { grossWpm } from '@/core/scoring/scoring';
import { liveWordCount } from '@/core/scoring/freeform';
import { useT } from '@/i18n';

interface Props {
  typed: string;
  elapsedMs: number;
  backspaces: number;
  /** The board's speed target, so the number can be read against a cut-off. */
  targetWpm?: number;
}

/**
 * The live readings for a paper run, on one line.
 *
 * Accuracy, errors and progress all need a passage to compare against, and
 * there isn't one — spelling is only checked once the run ends. So this shows
 * what can honestly be measured while typing: speed, words, characters and
 * corrections.
 *
 * It is a rail rather than the tall side column the other modes get, and that
 * is the whole reason it exists in this shape. A candidate typing from paper is
 * looking at the paper, not the screen; they glance up for one number and go
 * back down. Four figures in a row answer that glance in the height of a single
 * line, and every row it does not occupy belongs to the field they are typing
 * into — which, with no passage on screen, is the only thing on it.
 */
export function PaperStats({ typed, elapsedMs, backspaces, targetWpm = 0 }: Props) {
  const t = useT();
  const minutes = Math.max(elapsedMs / 60_000, 1 / 60_000);
  const wpm = Math.round(grossWpm(typed.length, minutes, CHARS_PER_WORD) * 10) / 10;
  const started = typed.length > 0;
  const onPace = started && targetWpm > 0 ? wpm >= targetWpm : null;

  return (
    <div
      title={t('paper.checkedLater')}
      // A fixed four-column grid, and emphatically not a wrapping flex row.
      //
      // As a flex row it re-wrapped as the figures gained digits: crossing 100
      // characters pushed a reading onto a second line, the rail grew, and the
      // field above it lost that height — so the page a candidate was typing
      // into changed size under their hands, twice a minute, for the entire
      // run. Columns that do not depend on their contents cannot do that. The
      // cells are equal fractions of the width and each one clips rather than
      // reflows, so the rail is exactly one line tall from the first keystroke
      // to submission.
      className="panel-lit grid shrink-0 grid-cols-4 items-baseline gap-x-4 rounded-panel border border-line bg-surface px-4 py-2 shadow-e1"
    >
      <Reading
        icon={Gauge}
        label={t('stats.liveWpm')}
        value={started ? String(wpm) : '—'}
        // The one figure the run is marked on, so it carries the target with
        // it. As a separate right-aligned chip it was one more thing that
        // moved when the numbers beside it grew.
        note={targetWpm > 0 ? t('stats.target', { value: targetWpm }) : undefined}
        tone={onPace === null ? undefined : onPace ? 'good' : 'bad'}
        lead
      />
      <Reading icon={Type} label={t('stats.words')} value={String(liveWordCount(typed))} />
      <Reading icon={SpellCheck} label={t('stats.characters')} value={String(typed.length)} />
      <Reading icon={Undo2} label={t('stats.corrections')} value={String(backspaces)} />
    </div>
  );
}

function Reading({
  icon: Icon,
  label,
  value,
  note,
  tone,
  lead = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Small trailing detail, e.g. the board's target. */
  note?: string;
  tone?: 'good' | 'bad';
  lead?: boolean;
}) {
  const empty = value === '—';
  const colour = empty
    ? 'text-fg-subtle font-normal'
    : tone === 'good'
      ? 'text-accent-text'
      : tone === 'bad'
        ? 'text-danger-text'
        : 'text-fg';

  return (
    // `min-w-0` is what lets a cramped cell clip its label instead of forcing
    // the grid wider than the rail.
    <span className="flex min-w-0 items-baseline gap-2">
      <span className="inline-flex min-w-0 items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
        <Icon size={12} className="shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      {/* The speed reading is set larger than the counts beside it: on a rail
          with no vertical hierarchy left to spend, size is the only thing that
          can still say which of the four figures is the one being marked. */}
      <span
        className={`shrink-0 font-bold tracking-tight tabular-nums ${lead ? 'text-[1.375rem] leading-none' : 'text-sm'} ${colour}`}
      >
        {value}
      </span>
      {note && (
        <span className="hidden shrink-0 text-[11px] font-medium text-fg-subtle tabular-nums xl:inline">
          {note}
        </span>
      )}
    </span>
  );
}
