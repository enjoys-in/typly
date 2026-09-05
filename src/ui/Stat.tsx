interface Props {
  label: string;
  value: string;
  /** What the value is measured against — "35 needed", "per day". */
  hint?: string;
  accent?: boolean;
}

export function Stat({ label, value, hint, accent }: Props) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
        {label}
      </span>
      {/* `tracking-tight` matters more at display sizes than anywhere else: at
          1.75rem the default letter-spacing reads as gappy. */}
      <span
        className={`text-[1.75rem] leading-none font-bold tracking-tight tabular-nums ${accent ? 'text-accent-text' : 'text-fg'}`}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-fg-subtle tabular-nums">{hint}</span>}
    </div>
  );
}
