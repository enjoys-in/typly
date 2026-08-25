export function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-fg-muted">{label}</span>
      <span
        className={`text-2xl font-bold tabular-nums ${accent ? 'text-accent-text' : 'text-fg'}`}
      >
        {value}
      </span>
    </div>
  );
}
