// Bundles the Electron main + preload with esbuild. Unlike tsc, esbuild inlines
// the backend AI handlers (server/) + shared core so the packaged desktop app
// serves /api parts from the main process — no dev server needed at runtime.
import { build } from 'esbuild';
import { rm } from 'node:fs/promises';

// Start clean so stale outputs (e.g. from an older per-file emit) never ship.
await rm('dist-electron', { recursive: true, force: true });

const common = {
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  // Native/host modules stay external and load from node_modules at runtime.
  external: ['electron', 'better-sqlite3'],
  logLevel: 'info',
};

await build({ ...common, entryPoints: ['electron/main.ts'], outfile: 'dist-electron/main.cjs' });
await build({ ...common, entryPoints: ['electron/preload.ts'], outfile: 'dist-electron/preload.cjs' });
