import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from 'react';

export interface Column<T> {
  /** Stable identifier for the column (used as React key). */
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  /** Fixed column width (e.g. '8rem'); columns without one share remaining space. */
  width?: string;
  /** Extra classes for the body cell. */
  className?: string;
  /** Extra classes for the header cell. */
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  loadingText?: string;
  empty?: ReactNode;
  /** Max height of the scroll region before the body scrolls under a sticky header. */
  maxHeight?: string;
  zebra?: boolean;
  onRowClick?: (row: T) => void;
  /** Fixed row height in px used for windowing math. Cell content must fit within it. */
  rowHeight?: number;
  /** Placeholder rows rendered while `loading`. */
  skeletonRows?: number;
}

const ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

const OVERSCAN = 6;
// Above this row count only the visible window is mounted, keeping the DOM light.
const VIRTUALIZE_THRESHOLD = 40;

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  loadingText = 'Loading…',
  empty = 'No records yet.',
  maxHeight = '28rem',
  zebra = true,
  onRowClick,
  rowHeight = 48,
  skeletonRows = 6,
}: DataTableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setViewport(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      setScrollTop(top);
    });
  }, []);

  const virtual = !loading && rows.length > VIRTUALIZE_THRESHOLD && viewport > 0;
  const start = virtual ? Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN) : 0;
  const windowCount = virtual ? Math.ceil(viewport / rowHeight) + OVERSCAN * 2 : rows.length;
  const end = virtual ? Math.min(rows.length, start + windowCount) : rows.length;
  const visible = virtual ? rows.slice(start, end) : rows;
  const padTop = start * rowHeight;
  const padBottom = virtual ? (rows.length - end) * rowHeight : 0;
  const colCount = columns.length;

  return (
    <div
      className="overflow-hidden rounded-panel border border-line"
      aria-busy={loading || undefined}
      {...(loading ? { role: 'status', 'aria-label': loadingText } : {})}
    >
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="dt-scroll overflow-auto"
        style={{ maxHeight }}
      >
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            {columns.map((c) => (
              <col key={c.key} style={c.width ? { width: c.width } : undefined} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10">
            <tr className="brand-gradient text-white shadow-sm">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`truncate px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
                    ALIGN[col.align ?? 'left']
                  } ${col.headerClassName ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }, (_, r) => (
                <tr key={`sk-${r}`} style={{ height: rowHeight }} className="border-t border-line">
                  {columns.map((col, c) => (
                    <td key={col.key} className="px-4 py-3">
                      <div
                        aria-hidden
                        className={`skeleton h-3.5 rounded-inner ${c === 0 ? 'w-3/4' : 'w-2/3'}`}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-12 text-center text-sm text-fg-muted">
                  {empty}
                </td>
              </tr>
            ) : (
              <>
                {padTop > 0 && (
                  <tr aria-hidden style={{ height: padTop }}>
                    <td colSpan={colCount} />
                  </tr>
                )}
                {visible.map((row, i) => {
                  const absolute = start + i;
                  return (
                    <tr
                      key={rowKey(row)}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      style={{ height: rowHeight }}
                      className={`border-t border-line tabular-nums transition-colors ${
                        zebra && absolute % 2 === 1
                          ? 'bg-surface-2'
                          : 'bg-surface'
                      } hover:bg-surface-hover ${
                        onRowClick ? 'cursor-pointer' : ''
                      }`}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`truncate px-4 py-3 ${ALIGN[col.align ?? 'left']} ${
                            col.className ?? ''
                          }`}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {padBottom > 0 && (
                  <tr aria-hidden style={{ height: padBottom }}>
                    <td colSpan={colCount} />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
