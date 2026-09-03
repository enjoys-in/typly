import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Size = 'sm' | 'lg';

// `sm` for confirmations, `lg` for a panel that has to show real content.
const WIDTH: Record<Size, string> = {
  sm: 'max-w-md',
  lg: 'max-w-3xl',
};

// Accessible modal primitive: backdrop + Escape close, portalled to <body>.
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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative w-full ${WIDTH[size]} rounded-2xl border border-edge bg-surface p-6 shadow-xl`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
