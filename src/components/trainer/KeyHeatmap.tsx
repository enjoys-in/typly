import { KEY_ROWS } from '@/core/keyboard/layout';

export type HeatTone = 'error' | 'slow';

// Heat colour per tone. Red reads as "wrong", amber as "slow" — the two are
// different problems and must not look like the same one.
const TONE_RGB: Record<HeatTone, string> = {
  error: '239,68,68',
  slow: '245,158,11',
};

interface Props {
  /** Key id → magnitude. Keys absent from the map render cold. */
  values: Map<string, number>;
  /** Magnitude that maps to full intensity. */
  max: number;
  tone: HeatTone;
  /** Tooltip for a key that has a value. */
  describe: (value: number) => string;
  emptyLabel?: string;
}

/** QWERTY layout tinted by a per-key magnitude — errors, or time-to-press. */
export function KeyHeatmap({ values, max, tone, describe, emptyLabel = 'no data' }: Props) {
  const scale = Math.max(max, 1);
  const rgb = TONE_RGB[tone];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
      {KEY_ROWS.map((row, r) => (
        <div key={r} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const value = values.get(key.id) ?? 0;
            const intensity = value / scale;
            return (
              <span
                key={key.id}
                title={value ? describe(value) : emptyLabel}
                style={{
                  flexGrow: key.width,
                  flexBasis: 0,
                  backgroundColor: value ? `rgba(${rgb},${0.12 + 0.78 * intensity})` : undefined,
                }}
                className={`flex h-9 items-center justify-center rounded-lg text-xs font-semibold ${
                  value ? 'text-white' : 'bg-surface-2 text-fg-subtle'
                }`}
              >
                {key.label}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
