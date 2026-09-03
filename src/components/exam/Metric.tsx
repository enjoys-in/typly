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

/** One labelled number in an exam stats panel. */
export function Metric({ icon: Icon, label, value, target, onPace, big = false, danger = false }: Props) {
  const tone = danger
    ? 'text-danger-text'
    : onPace === true
      ? 'text-accent-text'
      : onPace === false
        ? 'text-danger-text'
        : 'text-fg';

  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-fg-muted uppercase">
        <Icon size={13} className="shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <p className={`${big ? 'text-3xl' : 'text-xl'} font-bold tabular-nums ${tone}`}>{value}</p>
      {target && <p className="text-[11px] text-fg-subtle">{target}</p>}
    </div>
  );
}
