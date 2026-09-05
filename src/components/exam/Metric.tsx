import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Secondary line, e.g. the board's target. */
  target?: string;
  /** null = not enough data yet, so no pass/fail colour is implied. */
  onPace?: boolean | null;
  big?: boolean;
  danger?: boolean;
}

/**
 * One labelled number in an exam stats panel.
 *
 * The label is small, uppercase and quiet; the number is large, tight and
 * tabular. That contrast is the whole design — a candidate glancing at this
 * panel mid-passage is looking for one figure, and the ranking has to be
 * obvious without reading anything.
 */
export function Metric({
  icon: Icon,
  label,
  value,
  target,
  onPace,
  big = false,
  danger = false,
}: Props) {
  // The app's "nothing yet" marker. At the hero size an em dash set in bold
  // renders as a heavy filled slab that reads as a rendering fault rather than
  // as an absent number, so the placeholder is drawn light and quiet instead.
  const empty = value === '—';
  const tone = empty
    ? 'text-fg-subtle font-normal'
    : danger
      ? 'text-danger-text'
      : onPace === true
        ? 'text-accent-text'
        : onPace === false
          ? 'text-danger-text'
          : 'text-fg';

  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
        <Icon size={12} className="shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <p
        className={`mt-1.5 ${big ? 'text-[2.5rem]' : 'text-[1.5rem]'} leading-none font-bold tracking-tight tabular-nums ${tone}`}
        aria-label={empty ? 'no data yet' : undefined}
      >
        {value}
      </p>
      {target && (
        <p className="mt-1 text-[11px] font-medium text-fg-subtle tabular-nums">{target}</p>
      )}
    </div>
  );
}
