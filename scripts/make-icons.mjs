// Regenerates every derived app icon from the single source at build/icon.png.
//
//   node scripts/make-icons.mjs
//
// Run it after changing the source mark, then commit what it writes: packaging
// must never depend on this script having been run on the build machine.
//
// What it produces, and why each one exists:
//
//   icon.ico            Windows app icon (window, taskbar, Explorer)
//   installerIcon.ico   the Setup executable's own icon
//   uninstallerIcon.ico the uninstaller's icon, in Add/Remove Programs
//   tray-icon.png       tray / menu bar, and the Windows taskbar overlay badge
//   splash-icon.png     the mark on the launch splash
//   icons/<n>x<n>.png   the Linux icon theme set, which wants every size

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeIco } from './lib/ico.mjs';
import { decodePng, encodePng, resize } from './lib/png.mjs';

const BUILD_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'build');
const SOURCE = path.join(BUILD_DIR, 'icon.png');

/** Sizes Windows asks for, from a title bar to the installer's header. */
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];
/**
 * Sizes the Linux icon theme expects. Given a single large PNG, packaging ships
 * only that one size, and panels then have nothing sensible to draw at 22px.
 */
const LINUX_SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
/** Tray icons ship at 1x and 2x; nativeImage picks the @2x file itself. */
const TRAY_SIZES = [
  { scale: '', size: 16 },
  { scale: '@2x', size: 32 },
];
const written = [];

async function write(name, buffer) {
  await writeFile(path.join(BUILD_DIR, name), buffer);
  written.push(`${name} — ${(buffer.length / 1024).toFixed(1)} kB`);
}

const source = decodePng(await readFile(SOURCE));
if (source.width !== source.height) throw new Error('the source icon must be square');

// One .ico, reused for the app and both installer faces: the same mark, so the
// Setup window, the uninstall entry and the app itself are recognisably one app.
const ico = encodeIco(
  ICO_SIZES.map((size) => ({ size, png: encodePng(resize(source, size, size)) })),
);
for (const name of ['icon.ico', 'installerIcon.ico', 'uninstallerIcon.ico']) {
  await write(name, ico);
}

// The splash mark, at twice its on-screen size so it stays sharp on a Retina or
// HiDPI display.
await write('splash-icon.png', encodePng(resize(source, 256, 256)));

// The Linux icon theme, one file per size.
await mkdir(path.join(BUILD_DIR, 'icons'), { recursive: true });
for (const size of LINUX_SIZES) {
  const image = size === source.width ? source : resize(source, size, size);
  await write(path.join('icons', `${size}x${size}.png`), encodePng(image));
}

// The tray shows the mark in colour on every platform, at 1x and 2x.
for (const { scale, size } of TRAY_SIZES) {
  await write(`tray-icon${scale}.png`, encodePng(resize(source, size, size)));
}

console.log(`Icons generated from ${path.relative(process.cwd(), SOURCE)}:`);
for (const line of written) console.log(`  ${line}`);
