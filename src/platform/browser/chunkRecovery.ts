/**
 * Recovers from a stale page after a new version is deployed.
 *
 * Every route is a lazily-imported chunk with a content-hashed name. A tab left
 * open across a deploy still holds the old page, so the moment the user visits
 * a route they have not opened yet, the import fails with the chunk no longer
 * on the server — and the app appears to break for no reason.
 *
 * Reloading picks up the new build. Once, guarded by a session flag, so a
 * genuine network failure cannot turn into a reload loop.
 */

const FLAG = 'typly:chunk-reloaded';

function isStaleChunk(reason: unknown): boolean {
  const message = reason instanceof Error ? reason.message : String(reason ?? '');
  return /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(
    message,
  );
}

function reloadOnce(): void {
  try {
    if (sessionStorage.getItem(FLAG)) return;
    sessionStorage.setItem(FLAG, '1');
  } catch {
    // Private mode with storage blocked: reloading once is still better than
    // leaving the user on a page that cannot navigate.
  }
  window.location.reload();
}

export function installChunkRecovery(): void {
  if (typeof window === 'undefined') return;
  // Vite's own signal for a failed lazy import.
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadOnce();
  });
  window.addEventListener('unhandledrejection', (event) => {
    if (isStaleChunk(event.reason)) reloadOnce();
  });
  // A successful navigation means this build is being served, so the next
  // deploy gets its own reload budget.
  window.addEventListener('load', () => {
    try {
      sessionStorage.removeItem(FLAG);
    } catch {
      /* storage blocked */
    }
  });
}
