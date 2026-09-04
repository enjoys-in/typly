import { useId, type ReactNode } from 'react';

interface Props {
  /** File types to accept, as an `accept` attribute value. */
  accept: string;
  onPick: (file: File) => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * A file picker that looks like a secondary Button.
 *
 * A native file input cannot be styled, so the usual trick is a styled `label`
 * wrapping a visually-hidden input. The trap is that `.sr-only` is
 * `position: absolute` with no offsets, so it lands at its *static position*
 * relative to its containing block — and if no ancestor is positioned, that
 * containing block is the page itself. An `overflow: auto` ancestor cannot clip
 * it, because clipping only applies to descendants it actually contains, so a
 * hidden input halfway down a long page silently stretches the document and the
 * whole window gains a second scrollbar.
 *
 * Hence `relative` on the label. It exists once, here, rather than being a rule
 * every future call site has to remember.
 */
export function FileButton({ accept, onPick, disabled = false, children, className = '' }: Props) {
  // A label needs a control to point at; generating the id keeps two of these
  // on one screen from both driving the first input.
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-control border border-edge bg-surface px-3 py-2 text-sm font-semibold transition-colors ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-surface-hover'
      } ${className}`}
    >
      {children}
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Reset, so picking the same file twice in a row still fires a change.
          e.target.value = '';
          if (file) onPick(file);
        }}
      />
    </label>
  );
}
