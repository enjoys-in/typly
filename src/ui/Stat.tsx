interface Props {
  label: string;
  value: string;
  /** What the value is measured against — "35 needed", "per day". */
  hint?: string;
  accent?: boolean;
}

export function Stat({ label, value, hint, accent }: Props) {
  return (
    <div className="flex flex-col">
      <span className="text-xs tracking-wide text-fg-muted uppercase">{label}</span>
      <span
        className={`text-2xl font-bold tabular-nums ${accent ? 'text-accent-text' : 'text-fg'}`}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-fg-subtle tabular-nums">{hint}</span>}
    </div>
  );
}
