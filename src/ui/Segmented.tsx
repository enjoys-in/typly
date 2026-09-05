import type { LucideIcon } from 'lucide-react';

// String or number values, so numeric choices (a chunk size, a duration) can
// use the same control without stringifying at every call site.
export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  icon?: LucideIcon;
  /** Tooltip / accessible description for the segment. */
  title?: string;
}

interface Props<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Fill the container instead of hugging its content. */
  full?: boolean;
  ariaLabel?: string;
}

/**
 * The one segmented control. Previously this pattern existed three times with
 * three different looks — an accent fill, a slate fill, and a pair of Buttons.
 *
 * The selected segment is a raised white chip on a recessed track, the way a
 * platform tab bar reads, rather than a saturated accent block: with three or
 * four options a filled accent segment shouted louder than the primary action
 * on the same screen.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  full = false,
  ariaLabel,
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`${full ? 'flex w-full' : 'inline-flex'} h-9 items-center gap-0.5 rounded-control border border-line bg-surface-3 p-1`}
    >
      {options.map(({ value: v, label, icon: Icon, title }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            title={title}
            onClick={() => onChange(v)}
            className={`inline-flex h-full cursor-pointer items-center justify-center gap-1.5 rounded-inner px-3 text-xs font-semibold outline-none transition-[background-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-accent-ring ${
              full ? 'flex-1' : ''
            } ${
              active
                ? 'bg-surface text-fg shadow-e1'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            {Icon && <Icon size={14} className="shrink-0" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
