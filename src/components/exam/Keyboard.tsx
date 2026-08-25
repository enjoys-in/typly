import { KEY_ROWS, keyIdForChar, type Finger } from '@/core/keyboard/layout';
import { INSCRIPT_KEY_FOR_OUTPUT, inscriptLabel } from '@/core/text/inscript';
import { FINGER_BG, FINGER_DOT, FINGER_LABEL } from './fingerStyles';

// On-screen keyboard: color-codes keys by finger and highlights the next key to press.
export function Keyboard({
  nextChar,
  fontFamily,
  inscript = false,
}: {
  nextChar?: string;
  fontFamily?: string;
  inscript?: boolean;
}) {
  const target = nextChar
    ? inscript
      ? INSCRIPT_KEY_FOR_OUTPUT[nextChar] ?? ''
      : keyIdForChar(nextChar)
    : '';
  return (
    <div className="select-none rounded-panel border border-line bg-surface p-3">
      <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
        {KEY_ROWS.map((row, r) => (
          <div key={r} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const active = target !== '' && key.id === target;
              return (
                <span
                  key={key.id}
                  style={{ flexGrow: key.width, flexBasis: 0, fontFamily }}
                  className={`flex h-9 items-center justify-center rounded-control text-xs font-semibold transition-colors ${
                    active
                      ? 'brand-gradient text-white ring-2 ring-accent-ring'
                      : FINGER_BG[key.finger]
                  }`}
                >
                  {inscript ? inscriptLabel(key.id, key.label) : key.label}
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
