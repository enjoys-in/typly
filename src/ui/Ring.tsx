interface Props {
  /** 0–100. Values outside the range are clamped rather than drawn wrong. */
  value: number;
  /** Shown inside the ring — already formatted, so "96%" not 96. */
  label: string;
  /** Caption under the label. */
  caption?: string;
  /** Fail tone. Accuracy under a board's floor is not a neutral number. */
  danger?: boolean;
}

const SIZE = 96;
const STROKE = 8;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * A proportion, drawn as an arc.
 *
 * For a figure with a hard floor — an accuracy cut-off — the arc says something
 * the digits do not: how much of the circle is left. The sweep is a CSS
 * transition on the dash offset, so it draws itself on mount and inherits the
 * global reduced-motion rule for free.
 */
export function Ring({ value, label, caption, danger = false }: Props) {
  const pct = Math.min(100, Math.max(0, value));
  const tone = danger ? 'var(--danger)' : 'var(--accent)';

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} aria-hidden className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={tone}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-xl leading-none font-bold tracking-tight tabular-nums ${danger ? 'text-danger-text' : 'text-fg'}`}
        >
          {label}
        </span>
        {caption && (
          <span className="mt-1 text-[9.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
