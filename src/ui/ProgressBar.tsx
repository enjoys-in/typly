export function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    // The track is inset rather than raised, so the fill reads as liquid in a
    // channel. `overflow-hidden` is what rounds the fill's leading edge.
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3 ring-1 ring-line ring-inset">
      <div
        className="brand-gradient h-full rounded-full transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
