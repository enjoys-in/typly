import type { ReactNode } from 'react';

interface Props {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}

/** A compact toolbar toggle that reads as pressed/unpressed rather than a button. */
export function ToggleChip({ active, disabled = false, onClick, title, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-control border px-2.5 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-ring disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-accent-border bg-accent-soft text-accent-soft-fg'
          : 'border-line text-fg-muted hover:bg-surface-hover hover:text-fg'
      }`}
    >
      {children}
    </button>
  );
}
