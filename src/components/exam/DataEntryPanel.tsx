import { memo, useMemo } from 'react';
import { Table2 } from 'lucide-react';
import { kdph, depressionsOf } from '@/core/scoring/kdph';
import { useT } from '@/i18n';

interface Props {
  /** The Tab-separated table the typist is copying. */
  source: string;
  typed: string;
  elapsedMs: number;
  /** The post's key-depression target, for the live reading. */
  targetKdph: number;
  backspaces: number;
  deletes: number;
}

/**
 * A data-entry source table, laid out as a table.
 *
 * A DEST candidate reads values off a form and enters them field by field. The
 * ordinary passage view would render that as one long run of tab characters,
 * which is nothing like the register in front of a real candidate — so the
 * fields are drawn as cells, with the row being worked on highlighted.
 */
export const DataEntryPanel = memo(function DataEntryPanel({
  source,
  typed,
  elapsedMs,
  targetKdph,
  backspaces,
  deletes,
}: Props) {
  const t = useT();
  const rows = useMemo(() => source.split('\n').map((line) => line.split('\t')), [source]);
  // Rows are separated by newlines, so how many have been completed is simply
  // how many newlines have been typed.
  const done = useMemo(() => (typed.match(/\n/g) ?? []).length, [typed]);

  const depressions = depressionsOf({ charsTyped: typed.length, backspaces, deletes });
  const current = kdph(depressions, elapsedMs);
  const onPace = elapsedMs > 3_000 && targetKdph > 0 ? current >= targetKdph : null;

  return (
    <div className="scroll-area flex min-h-0 flex-1 flex-col rounded-panel border border-line bg-surface">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur-sm">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-fg-muted uppercase">
          <Table2 size={13} className="shrink-0" />
          {t('dataEntry.title')}
        </span>
        <span className="text-xs tabular-nums">
          <span
            className={`font-bold ${
              onPace === true ? 'text-accent-text' : onPace === false ? 'text-danger-text' : ''
            }`}
          >
            {current.toLocaleString()}
          </span>
          <span className="text-fg-subtle"> / {targetKdph.toLocaleString()} {t('dataEntry.kdph')}</span>
        </span>
      </div>

      <table className="w-full border-collapse text-left font-mono text-sm">
        <tbody>
          {rows.map((cells, r) => (
            <tr
              key={r}
              className={`border-b border-line last:border-0 ${
                r === done ? 'bg-accent-soft' : r < done ? 'text-fg-subtle' : ''
              }`}
            >
              <td className="w-10 px-3 py-1.5 text-right text-[11px] text-fg-subtle tabular-nums select-none">
                {r + 1}
              </td>
              {cells.map((cell, c) => (
                <td key={c} className="px-3 py-1.5 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
