import type { LucideIcon } from 'lucide-react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  /** Tooltip / accessible description for the segment. */
  title?: string;
}

interface Props<T extends string> {
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
 */
export function Segmented<T extends string>({
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
      className={`${full ? 'flex w-full' : 'inline-flex'} rounded-control border border-line bg-surface-2 p-0.5`}
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
            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-inner px-3 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-ring ${
              full ? 'flex-1' : ''
            } ${
              active
                ? 'bg-accent text-accent-fg'
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
