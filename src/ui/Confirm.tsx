import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button that requires a second, deliberate click (delete/cancel actions). */
  destructive?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<ConfirmFn | null>(null);

interface Pending extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

// Promise-based replacement for window.confirm — no native dialogs anywhere in the
// UI. Destructive actions require double confirmation before they resolve `true`.
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [armed, setArmed] = useState(false);

  const confirm = useCallback<ConfirmFn>(
    (opts) =>
      new Promise<boolean>((resolve) => {
        setArmed(false);
        setPending({ ...opts, resolve });
      }),
    [],
  );

  function settle(result: boolean) {
    pending?.resolve(result);
    setPending(null);
    setArmed(false);
  }

  function onConfirm() {
    if (pending?.destructive && !armed) {
      setArmed(true); // first click arms; a second click actually confirms
      return;
    }
    settle(true);
  }

  const confirmLabel = pending?.confirmLabel ?? 'Confirm';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <Modal onClose={() => settle(false)} labelledBy="confirm-title">
          <h2 id="confirm-title" className="text-lg font-semibold">
            {pending.title}
          </h2>
          {pending.message && <p className="mt-2 text-sm text-fg-muted">{pending.message}</p>}
          {pending.destructive && armed && (
            <p className="mt-3 text-sm font-medium text-danger-text">
              This can’t be undone — press again to confirm.
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => settle(false)} autoFocus>
              {pending.cancelLabel ?? 'Cancel'}
            </Button>
            <Button variant={pending.destructive ? 'danger' : 'primary'} onClick={onConfirm}>
              {pending.destructive && armed ? `Yes, ${confirmLabel.toLowerCase()}` : confirmLabel}
            </Button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}
