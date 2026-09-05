import { keyForChar } from '@/core/keyboard/layout';
import { FINGER_BG, FINGER_DOT, FINGER_LABEL } from './fingerStyles';

/** Human label for keys that have no printable glyph. */
function labelFor(raw: string): string {
  if (raw === ' ') return 'Space';
  if (raw === 'Backspace') return '⌫';
  if (raw === 'Enter') return '↵';
  if (raw === 'Tab') return 'Tab';
  return raw;
}

/**
 * Compact stand-in for the full keyboard: shows only the key just pressed, plus
 * which finger owns it. Costs one row instead of six, so the passage keeps the
 * space the keyboard would have taken.
 */
export function PressedKey({ pressed }: { pressed: string }) {
  const key = pressed ? keyForChar(pressed) : null;
  const finger = key?.finger ?? null;

  return (
    <div className="panel-lit flex shrink-0 items-center justify-center gap-3 rounded-panel border border-line bg-surface px-4 py-3 shadow-e1">
      <span
        aria-hidden
        className={`flex h-11 min-w-11 items-center justify-center rounded-control px-3 font-mono text-lg font-bold shadow-e2 ring-1 ring-black/5 transition-colors ring-inset ${
          finger ? FINGER_BG[finger] : 'bg-surface-3 text-fg-subtle'
        }`}
      >
        {pressed ? labelFor(pressed) : '—'}
      </span>
      <span className="flex min-w-24 items-center gap-1.5 text-xs font-medium text-fg-muted">
        {finger ? (
          <>
            <span className={`h-2 w-2 shrink-0 rounded-full ${FINGER_DOT[finger]}`} />
            {FINGER_LABEL[finger]} finger
          </>
        ) : (
          'Waiting for a keystroke'
        )}
      </span>
    </div>
  );
}
