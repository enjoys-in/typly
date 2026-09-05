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
 * The selected segment takes the accent fill. A raised neutral chip is the
 * quieter choice and reads well on a tab bar, but on a setup form the whole
 * question is *which one is picked* — and across six options at a glance the
 * green answers that instantly where a white chip has to be looked for.
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
                ? 'bg-accent text-accent-fg shadow-e1 ring-1 ring-inset ring-white/15'
                : 'text-fg-muted hover:bg-surface-hover hover:text-fg'
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
