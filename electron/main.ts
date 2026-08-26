import { app, BrowserWindow, ipcMain, shell, nativeImage } from 'electron';
import path from 'node:path';
import { createTray, destroyTray } from './shell/tray';
import { createSplash } from './shell/splash';
import { SqliteRepository } from './data/db';
import { registerRepoIpc } from './ipc/repository';
import { registerFontIpc } from './ipc/fonts';
import { createReminderScheduler } from './ipc/reminders';
import { registerAiIpc } from './ipc/ai';
import { registerAppSchemePrivileges, registerAppProtocol, appUrl } from './shell/protocol';
import { IpcChannel } from '../src/core/ipc/channels';

// Dev mode is driven by an explicit Vite dev-server URL (set only in `electron:dev`).
// Without it we always load the built renderer over app:// — this covers packaged
// builds AND `electron:preview` (unpackaged but running the built dist folder).
const DEV_URL = process.env.ELECTRON_RENDERER_URL ?? '';
const isDev = DEV_URL.length > 0;
const DIST_DIR = path.join(__dirname, '../dist');

// Privileged scheme must be declared before the app is ready.
registerAppSchemePrivileges();

let mainWindow: BrowserWindow | null = null;

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    show: false,
    backgroundColor: '#0b0b0f',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once('ready-to-show', () => win.show());

  // External links open in the user's browser, never a new Electron window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    void win.loadURL(DEV_URL);
  } else {
    void win.loadURL(appUrl());
  }

  win.on('closed', () => {
    mainWindow = null;
  });
  return win;
}

void app.whenReady().then(() => {
  // Packaged builds get the dock/Finder icon from the bundled .icns; in dev we
  // point the dock at the source icon so it isn't the default Electron logo.
  if (process.platform === 'darwin' && !app.isPackaged) {
    const dockIcon = nativeImage.createFromPath(path.join(app.getAppPath(), 'build/icon.png'));
    if (!dockIcon.isEmpty()) app.dock?.setIcon(dockIcon);
  }

  // Canonical desktop store lives in the main process. If the native module can't
  // load (e.g. ABI mismatch, or node-gyp couldn't build in a path with spaces),
  // fall back to the renderer's IndexedDB store instead of crashing.
  let sqliteReady = false;
  let reminders: ReturnType<typeof createReminderScheduler> | null = null;
  try {
    const db = new SqliteRepository();
    registerRepoIpc(db);
    reminders = createReminderScheduler(db, () => {
      mainWindow?.show();
      mainWindow?.focus();
    });
    sqliteReady = true;
  } catch (err) {
    console.error('[typly] SQLite unavailable, using IndexedDB fallback:', err);
  }
  ipcMain.on(IpcChannel.RepoAvailable, (event) => {
    event.returnValue = sqliteReady;
  });

  // Renderer pushes reminder settings; the main timer fires even when hidden.
  ipcMain.handle(IpcChannel.ReminderSet, (_e, enabled: boolean, time: string) => {
    reminders?.configure(enabled, time);
  });

  registerFontIpc();
  registerAiIpc();
  // Serve the built renderer (and its bundled OCR assets) over app://.
  registerAppProtocol(DIST_DIR);

  const splash = createSplash();
  mainWindow = createMainWindow();
  mainWindow.once('ready-to-show', () => splash.destroy());
  createTray(() => mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createMainWindow();
    else mainWindow?.show();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => destroyTray());
