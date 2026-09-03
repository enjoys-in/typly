import type { ReactNode } from 'react';

/** A wrapping row of small read-only facts (weak keys, slow pairs, missed words). */
export function ChipRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

interface ChipProps {
  children: ReactNode;
  /** Trailing count / measurement, shown muted. */
  meta?: string;
}

export function Chip({ children, meta }: ChipProps) {
  return (
    <span className="rounded-full bg-surface-2 px-3 py-1 text-sm tabular-nums">
      {children}
      {meta && <span className="ml-2 text-xs text-fg-muted">{meta}</span>}
    </span>
  );
}
