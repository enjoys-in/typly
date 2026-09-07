import { useT } from '@/i18n';

interface Props {
  /** Characters produced so far. */
  typed: number;
  /** Characters in the passage. Zero where there is no passage to finish. */
  total: number;
  /** Words so far, counted the way the scorer counts them. */
  words: number;
}

/**
 * How much is done and how much is left, under the typing field.
 *
 * This used to live only in the live metrics panel, which is a 19rem column
 * that blind mode removes, stacked layout moves below the fold, and the stats
 * toggle hides outright. So the commonest question during a run — *am I nearly
 * there?* — was answerable only in the one configuration that happened to keep
 * that panel on screen. A clock counting down beside a passage of unknown
 * length tells a candidate nothing about whether they will finish it.
 *
 * So it is a strip attached to the field itself, on every layout, and it says
 * both halves of the answer: what has been typed and what is still to come.
 * `left` is the number that decides whether to push, and it is deliberately the
 * one carrying the weight here — the panel already leads with the total.
 */
export function TypedProgress({ typed, total, words }: Props) {
  const t = useT();
  const left = Math.max(0, total - typed);
  const pct = total > 0 ? Math.min(100, Math.round((typed / total) * 100)) : 0;

  return (
    <div className="shrink-0 overflow-hidden rounded-control border border-line bg-surface-2">
      {/* The bar is the panel's top edge rather than a separate row: it costs
          two pixels of height, and the strip is competing with the passage for
          a column that a resized field has already made shorter. */}
      {total > 0 && (
        <div aria-hidden className="h-[3px] w-full bg-surface-3">
          <div
            className="brand-gradient h-full transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-1.5 text-[11px] tabular-nums">
        <Reading label={t('stats.typed')} value={typed.toLocaleString()} />
        {/* No passage means no end to reach, so there is no "left" to report
            and none is invented. In practice that is paper mode, which shows
            its own counts instead. */}
        {total > 0 && (
          <>
            <Reading label={t('stats.left')} value={left.toLocaleString()} strong />
            <Reading label={t('stats.ofChars')} value={total.toLocaleString()} muted />
          </>
        )}
        <Reading label={t('stats.words')} value={words.toLocaleString()} />
        {total > 0 && <span className="ml-auto font-semibold text-fg-muted">{pct}%</span>}
      </div>
    </div>
  );
}

function Reading({
  label,
  value,
  strong = false,
  muted = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-medium tracking-[0.04em] text-fg-subtle uppercase">{label}</span>
      {value && (
        <span
          className={`font-bold ${strong ? 'text-accent-text' : muted ? 'text-fg-subtle' : 'text-fg'}`}
        >
          {value}
        </span>
      )}
    </span>
  );
}
