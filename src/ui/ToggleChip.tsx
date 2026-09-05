import type { ReactNode } from 'react';

interface Props {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}

/**
 * A compact toolbar toggle that reads as pressed/unpressed rather than a button.
 *
 * Unpressed it is borderless — a row of six outlined chips above a passage was
 * six competing rectangles. The pressed state is what earns the outline.
 */
export function ToggleChip({ active, disabled = false, onClick, title, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control px-2.5 text-xs font-semibold outline-none transition-[background-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-accent-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${
        active
          ? 'bg-accent-soft text-accent-soft-fg ring-1 ring-accent-border ring-inset'
          : 'text-fg-muted hover:bg-surface-hover hover:text-fg'
      }`}
    >
      {children}
    </button>
  );
}
