import { app } from 'electron';
import { accessSync, constants, mkdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Portable mode: the database lives beside the executable, not in the user
 * profile.
 *
 * A great many of Typly's users get their computer time in a coaching lab or a
 * cyber-café, on a machine they have no install rights to and no account on.
 * Portable mode is what makes the app usable there: copy the folder onto a USB
 * stick, run it, and your history is on the stick rather than on a shared PC —
 * which is also the privacy-preserving answer, since practice data does not
 * get left behind on somebody else's machine.
 *
 * Two ways in, because a portable build should not need a flag but a normal
 * install must never accidentally become one:
 *
 *  - `--portable` on the command line, or `TYPLY_PORTABLE=1`;
 *  - a `typly-data` directory sitting next to the executable, which is how the
 *    portable build ships (electron-builder's portable target unpacks the app
 *    beside it).
 */

/** Directory name looked for beside the executable, and created inside it. */
const PORTABLE_DIR = 'typly-data';

let resolved: string | null = null;

/** Where a portable build keeps its data, or null when this is a normal install. */
export function portableRoot(): string | null {
  if (resolved !== null) return resolved || null;

  const requested =
    process.argv.includes('--portable') || process.env.TYPLY_PORTABLE === '1';
  // `execPath` is the executable inside a packaged build, and Electron itself
  // in development — where portable mode is meaningless, so it is refused.
  const beside = path.join(path.dirname(app.getPath('exe')), PORTABLE_DIR);

  const wanted = requested || (app.isPackaged && exists(beside));
  if (!wanted || !app.isPackaged) {
    resolved = '';
    return null;
  }

  try {
    mkdirSync(beside, { recursive: true });
    // A read-only stick or a locked directory would fail every write later; far
    // better to fall back to the profile now than to lose a session's history.
    accessSync(beside, constants.W_OK);
    resolved = beside;
    return beside;
  } catch {
    console.error('[typly] portable directory is not writable, using the user profile');
    resolved = '';
    return null;
  }
}

/**
 * Points Electron's own storage at the portable directory too.
 *
 * Must run before the app is ready: `userData` is where the renderer's caches,
 * cookies and local storage go, and Chromium reads it during startup. Without
 * this only the SQLite file would travel, and the app would look half-migrated.
 */
export function applyPortablePaths(): void {
  const root = portableRoot();
  if (!root) return;
  app.setPath('userData', path.join(root, 'user'));
  app.setPath('sessionData', path.join(root, 'session'));
}

/** Where the SQLite database should live. */
export function databasePath(): string {
  const root = portableRoot();
  return path.join(root ?? app.getPath('userData'), 'typly.db');
}

function exists(target: string): boolean {
  try {
    accessSync(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
