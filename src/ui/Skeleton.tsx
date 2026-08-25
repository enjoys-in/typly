/**
 * Placeholders that mirror the shape of the content they stand in for, so the
 * layout does not jump when real data arrives.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-inner ${className}`} />;
}

/** Stacked text lines; the last one is short, the way a paragraph ends. */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-3.5 ${i === lines - 1 ? 'w-2/5' : 'w-full'}`} />
      ))}
    </div>
  );
}

/** Rows sized to a DataTable row, under a header strip. */
export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-panel border border-line">
      <div className="brand-gradient h-11" />
      <div className="divide-y divide-line">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex items-center gap-3 px-3 py-3.5">
            {Array.from({ length: cols }, (_, c) => (
              <Skeleton
                key={c}
                className={`h-3.5 ${c === 0 ? 'flex-1' : 'w-16'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A card-shaped block: title, body lines, and an optional action row. */
export function SkeletonCard({ lines = 3, action = false }: { lines?: number; action?: boolean }) {
  return (
    <div className="rounded-panel border border-line bg-surface p-6">
      <Skeleton className="h-4 w-40" />
      <div className="mt-5">
        <SkeletonText lines={lines} />
      </div>
      {action && <Skeleton className="mt-6 h-9 w-32 rounded-control" />}
    </div>
  );
}

/** Grid of stat tiles, matching the result / progress summaries. */
export function SkeletonStats({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-7 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Route-level fallback while a lazily-loaded page chunk downloads. Deliberately
 * generic — a page-specific shape would flash the wrong layout.
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-3.5 w-80" />
      </div>
      <SkeletonCard lines={3} action />
      <SkeletonCard lines={2} />
    </div>
  );
}

/** Centred spinner for full-screen waits (session restore). */
export function FullPageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-canvas" role="status" aria-label={label}>
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  );
}
