import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Size = 'sm' | 'lg';

// `sm` for confirmations, `lg` for a panel that has to show real content.
const WIDTH: Record<Size, string> = {
  sm: 'max-w-md',
  lg: 'max-w-3xl',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal primitive: backdrop, Escape to close, portalled to <body>.
 *
 * Focus is managed here so every dialog in the app behaves the same — it moves
 * into the dialog on open, cannot Tab out to the page behind it, and returns to
 * whatever opened it on close. Without that, a keyboard or screen-reader user
 * is left tabbing through a page they cannot see.
 */
export function Modal({
  children,
  onClose,
  labelledBy,
  size = 'sm',
}: {
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
  size?: Size;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    // The first control if there is one, otherwise the dialog itself.
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialog) return;
      const stops = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (stops.length === 0) {
        e.preventDefault();
        return;
      }
      const edge = e.shiftKey ? stops[0] : stops[stops.length - 1];
      // Wrap at the ends rather than escaping to the page behind.
      if (document.activeElement === edge || !dialog.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? stops[stops.length - 1] : stops[0])?.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // Only take focus back if it is still inside the closing dialog.
      if (!dialog || dialog.contains(document.activeElement)) opener?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        // `rounded-well` rather than a one-off 2xl: a dialog is the outermost
        // container in the app, so it takes the outermost step of the scale.
        className={`panel-lit relative w-full ${WIDTH[size]} rounded-well border border-line bg-surface p-6 shadow-e3 outline-none`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
