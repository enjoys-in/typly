import { app, dialog, ipcMain, type BrowserWindow } from 'electron';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { IpcChannel } from '../../src/core/ipc/channels';
import { isShellRoute, type ShellRoute } from '../../src/core/ipc/shell';
import { isOpenableFile, OPENABLE_EXTENSIONS } from '../../src/core/text/fileKind';
import { GOTO_FLAG } from './dock';

/**
 * "Open with Typly" — double-clicking a text file, dropping one on the dock
 * icon, or picking Typly from the OS Open With menu.
 *
 * The file associations themselves are declared in package.json
 * (build.fileAssociations); this is the runtime half: it reads the file and
 * hands the bytes to the renderer, which runs them through the same extraction
 * pipeline as the drop zone. A file can arrive *before* the renderer exists
 * (that is how a cold launch works), so one is held back until the UI asks.
 */

/** Refuse anything absurd: a passage is text, not a disk image. */
const MAX_BYTES = 25 * 1024 * 1024;

interface OpenedFile {
  name: string;
  bytes: Uint8Array;
}

let queued: OpenedFile | null = null;
let rendererReady = false;
let getWindow: (() => BrowserWindow | null) | null = null;
let focus: (() => void) | null = null;

/**
 * Launch arguments that are file paths we can open. Electron's argv also holds
 * the executable, Chromium switches and (in dev) the project directory, so
 * everything that isn't a supported file is dropped.
 */
export function filesFromArgv(argv: string[]): string[] {
  return argv
    .slice(1)
    .filter((arg) => !arg.startsWith('-') && isOpenableFile(arg))
    .map((arg) => path.resolve(arg));
}

/** A route requested by a jump-list entry, if this launch carried one. */
export function routeFromArgv(argv: string[]): ShellRoute | null {
  const flag = argv.find((arg) => arg.startsWith(GOTO_FLAG));
  const route = flag?.slice(GOTO_FLAG.length);
  return isShellRoute(route) ? route : null;
}

/**
 * macOS delivers files through `open-file`, which must be listened for *before*
 * the app is ready — the event fires during launch when a file started the app.
 */
export function registerOpenFileEvent(): void {
  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    void openFile(filePath);
  });
}

export function registerOpenWith(window: () => BrowserWindow | null, focusWindow: () => void): void {
  getWindow = window;
  focus = focusWindow;
  // The renderer drains anything that arrived before it was listening. The
  // first call is also what marks it ready for direct pushes.
  ipcMain.handle(IpcChannel.FilePending, () => {
    rendererReady = true;
    const file = queued;
    queued = null;
    return file;
  });
}

/** Reads a file the OS pointed us at and gets it in front of the user. */
export async function openFile(filePath: string): Promise<void> {
  if (!isOpenableFile(filePath)) return;
  try {
    const info = await stat(filePath);
    if (!info.isFile() || info.size === 0 || info.size > MAX_BYTES) return;
    const bytes = new Uint8Array(await readFile(filePath));
    const file: OpenedFile = { name: path.basename(filePath), bytes };
    // Feeds the OS "Recent" lists — the Windows jump list and the macOS
    // File ▸ Open Recent menu — so a reopened passage is one click away.
    app.addRecentDocument(filePath);

    const win = getWindow?.();
    if (rendererReady && win && !win.isDestroyed()) {
      win.webContents.send(IpcChannel.FileOpened, file);
      focus?.();
    } else {
      // Cold launch: hold it until the renderer asks for it.
      queued = file;
      focus?.();
    }
  } catch {
    // An unreadable file is the OS's problem to report, not a reason to crash.
  }
}

/** The File ▸ Open… menu item, using the same set of formats. */
export async function promptForFile(): Promise<void> {
  const win = getWindow?.();
  const options: Electron.OpenDialogOptions = {
    title: 'Open a passage',
    properties: ['openFile'],
    filters: [
      { name: 'Text and documents', extensions: OPENABLE_EXTENSIONS.map((ext) => ext.slice(1)) },
      { name: 'All files', extensions: ['*'] },
    ],
  };
  const { canceled, filePaths } =
    win && !win.isDestroyed()
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options);
  const picked = filePaths[0];
  if (!canceled && picked) await openFile(picked);
}
