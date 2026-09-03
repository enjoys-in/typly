// Bundles the Electron main + preload with esbuild. Unlike tsc, esbuild inlines
// the backend AI handlers (server/) + shared core so the packaged desktop app
// serves /api parts from the main process — no dev server needed at runtime.
import { build } from 'esbuild';
import { rm, copyFile } from 'node:fs/promises';

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

// Ship the shell's images next to the main process so nativeImage (and the
// splash page) resolve them the same way in dev and inside the packaged asar,
// where they are loaded via __dirname. All of them are generated from the one
// source mark by scripts/make-icons.mjs.
const SHELL_ASSETS = [
  // Tray / menu bar, and the Windows taskbar overlay badge.
  'tray-icon.png',
  'tray-icon@2x.png',
  // The mark on the launch splash.
  'splash-icon.png',
];

for (const asset of SHELL_ASSETS) {
  await copyFile(`build/${asset}`, `dist-electron/${asset}`);
}
