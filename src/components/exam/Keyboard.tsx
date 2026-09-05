import { KEY_ROWS, keyIdForChar, type Finger } from '@/core/keyboard/layout';
import type { Keymap } from '@/core/text/keymap';
import { FINGER_BG, FINGER_DOT, FINGER_LABEL } from './fingerStyles';

// On-screen keyboard: color-codes keys by finger and highlights the next key to press.
export function Keyboard({
  nextChar,
  fontFamily,
  keymap = null,
}: {
  nextChar?: string;
  fontFamily?: string;
  /** Remapped layout, so labels and the highlight follow what the keys produce. */
  keymap?: Keymap | null;
}) {
  const target = nextChar ? (keymap ? keymap.keyForOutput(nextChar) : keyIdForChar(nextChar)) : '';
  return (
    <div className="panel-lit shrink-0 rounded-panel border border-line bg-surface-2 p-3 shadow-e1 select-none">
      <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
        {KEY_ROWS.map((row, r) => (
          <div key={r} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const active = target !== '' && key.id === target;
              return (
                <span
                  key={key.id}
                  style={{ flexGrow: key.width, flexBasis: 0, fontFamily }}
                  // `key-next` lifts and haloes the key you are meant to hit.
                  // A static fill already said *which* key; the pulse is what
                  // makes it findable in a 60-key grid without hunting, which
                  // is the entire job of an on-screen keyboard.
                  className={`flex h-9 items-center justify-center rounded-inner text-xs font-semibold shadow-e1 ring-1 ring-black/5 transition-[background-color,color,box-shadow,transform] ring-inset ${
                    active
                      ? 'key-next brand-gradient z-10 text-white ring-2 ring-accent-ring'
                      : FINGER_BG[key.finger]
                  }`}
                >
                  {keymap ? keymap.labelFor(key.id, key.label) : key.label}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {(Object.keys(FINGER_LABEL) as Finger[]).map((f) => (
          <span key={f} className="flex items-center gap-1.5 text-[11px] text-fg-muted">
            <span className={`h-2.5 w-2.5 rounded-full ${FINGER_DOT[f]}`} /> {FINGER_LABEL[f]}
          </span>
        ))}
      </div>
    </div>
  );
}
