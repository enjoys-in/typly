import { app, BrowserWindow, ipcMain, shell, nativeImage, Notification } from 'electron';
import path from 'node:path';
import { createTray, destroyTray } from './shell/tray';
import { createDock, destroyDock, requestAttention, setShellProgress } from './shell/dock';
import { createAppMenu } from './shell/appMenu';
import {
  filesFromArgv,
  openFile,
  promptForFile,
  registerOpenFileEvent,
  registerOpenWith,
  routeFromArgv,
} from './shell/openWith';
import { setPracticePending, setReminderState, setShellStatus, shellStatus } from './shell/state';
import { createSplash, type Splash } from './shell/splash';
import { createLanSync } from './shell/lanSync';
import { SqliteRepository } from './data/db';
import { registerRepoIpc } from './ipc/repository';
import { registerFontIpc } from './ipc/fonts';
import { createReminderScheduler } from './ipc/reminders';
import { registerAiIpc } from './ipc/ai';
import { registerAppSchemePrivileges, registerAppProtocol, appUrl } from './shell/protocol';
import { devToolsPref, registerDevToolsPolicy } from './shell/devTools';
import { applyPortablePaths, portableRoot } from './shell/portable';
import { openQuickTest, registerQuickTest, unregisterQuickTest } from './shell/quickTest';
import { IpcChannel } from '../src/core/ipc/channels';
import { isShellStatus, type ShellRoute } from '../src/core/ipc/shell';
import { DEFAULT_REMINDER_TIME } from '../src/core/reminder/schedule';

// Dev mode is driven by an explicit Vite dev-server URL (set only in `electron:dev`).
// Without it we always load the built renderer over app:// — this covers packaged
// builds AND `electron:preview` (unpackaged but running the built dist folder).
const DEV_URL = process.env.ELECTRON_RENDERER_URL ?? '';
const isDev = DEV_URL.length > 0;
const DIST_DIR = path.join(__dirname, '../dist');
// Windows needs the AppUserModelID to match the installer's for jump lists and
// notifications to be attributed to Typly rather than to the Electron host.
const APP_ID = 'in.enjoys.typly';

// Portable mode redirects Electron's own storage, which Chromium reads during
// startup — so it has to be applied before anything else touches a path.
applyPortablePaths();

// Privileged scheme must be declared before the app is ready.
registerAppSchemePrivileges();
// Before any window exists, so every renderer the app ever creates is covered
// — including ones added later that forget the webPreferences flag.
registerDevToolsPolicy();
// macOS delivers "Open with Typly" through an event that can fire during launch,
// so the listener has to exist before the app is ready.
registerOpenFileEvent();

// How long to wait for the renderer to say it is ready before showing the
// window anyway. A launch that goes wrong must still end in a visible app.
const LAUNCH_TIMEOUT_MS = 12_000;

let mainWindow: BrowserWindow | null = null;
// Set only by a real quit request (tray, menu, Cmd-Q). Until then, closing the
// window on Windows/Linux hides it to the tray instead of ending the session.
let quitting = false;
let hintedTray = false;
// The launch splash, and whether the first window has been revealed yet.
let splash: Splash | null = null;
let launched = false;

function focusMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

/** Open a route in the renderer, from the tray, dock menu or jump list. */
function navigate(route: ShellRoute): void {
  focusMainWindow();
  mainWindow?.webContents.send(IpcChannel.ShellNavigate, route);
}

/**
 * Pick up where practice stopped: an interrupted attempt resumes itself on the
 * exam page, otherwise the Dashboard is where the next part of a split
 * document is offered.
 */
function resume(): void {
  navigate(shellStatus().hasUnfinished ? '/app/exam' : '/app');
}

function quit(): void {
  quitting = true;
  app.quit();
}

/**
 * First close on Windows/Linux keeps the app running in the tray — say so once,
 * so it doesn't look like the window was lost.
 */
function hintTray(): void {
  if (hintedTray || !Notification.isSupported()) return;
  hintedTray = true;
  const n = new Notification({
    title: 'Typly is still running',
    body: 'Find it in the system tray — practice reminders keep working.',
  });
  n.on('click', focusMainWindow);
  n.show();
}

/**
 * Show the first window and take the splash down over it. The window is shown
 * *before* the fade so the two cross over each other rather than leaving a gap;
 * after this, windows show themselves.
 */
function reveal(win: BrowserWindow): void {
  if (launched || win.isDestroyed()) return;
  launched = true;
  splash?.progress(1);
  win.show();
  win.focus();
  void splash?.finish().then(() => {
    splash = null;
  });
}

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    show: false,
    backgroundColor: '#0b0b0f',
    titleBarStyle: 'hiddenInset',
    // macOS draws the window buttons *over* the web content with this style, so
    // the renderer has to leave room for them (see TITLEBAR_INSET). Pinning the
    // position means that reserved height is a known quantity instead of a
    // guess at the platform default.
    trafficLightPosition: { x: 14, y: 12 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      ...devToolsPref,
    },
  });

  // The renderer decides when the app is really on screen (see IpcChannel
  // AppReady): its bundle and first paint come well after the window itself is
  // paintable, and showing at 'ready-to-show' is what makes an Electron app
  // flash an empty frame. Later windows have no splash to wait for.
  win.once('ready-to-show', () => {
    if (launched) win.show();
    else splash?.progress(0.75);
  });
  win.webContents.once('did-finish-load', () => splash?.progress(0.5));
  // A renderer that failed to load still has to become visible, or the app is
  // just an icon in the tray with no way to see what went wrong.
  win.webContents.on('did-fail-load', () => reveal(win));
  setTimeout(() => reveal(win), LAUNCH_TIMEOUT_MS);

  // External links open in the user's browser, never a new Electron window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  // Hide-to-tray, the way a background app behaves: the reminder timer and the
  // tray menu stay alive, and reopening is instant. macOS already works this
  // way through the dock, so its close button is left alone.
  win.on('close', (event) => {
    if (quitting || process.platform === 'darwin') return;
    event.preventDefault();
    win.hide();
    hintTray();
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

function bootstrap(): void {
  app.setAppUserModelId(APP_ID);
  const portable = portableRoot();
  if (portable) console.log(`[typly] portable mode — data in ${portable}`);

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
    reminders = createReminderScheduler(db, focusMainWindow, (pending) => {
      // A missed reminder keeps nudging from the tray and the dock badge until
      // practice is done, and asks for attention once when it first appears.
      setPracticePending(pending);
      if (pending) requestAttention();
    });
    sqliteReady = true;
  } catch (err) {
    console.error('[typly] SQLite unavailable, using IndexedDB fallback:', err);
  }
  ipcMain.on(IpcChannel.RepoAvailable, (event) => {
    event.returnValue = sqliteReady;
  });

  // Renderer pushes reminder settings; the main timer fires even when hidden.
  // The tray menu reads the same values, so it can say when the nudge is due.
  ipcMain.handle(IpcChannel.ReminderSet, (_e, enabled: boolean, time: string) => {
    setReminderState({ enabled, time: time || DEFAULT_REMINDER_TIME });
    reminders?.configure(enabled, time);
  });

  // The interface is up: the splash has done its job.
  ipcMain.on(IpcChannel.AppReady, () => {
    if (mainWindow) reveal(mainWindow);
  });

  // Local-network device sync. The renderer owns the data and the import; the
  // main process only carries bytes, because only it can open a socket.
  const lan = createLanSync({
    onState: (state) => mainWindow?.webContents.send(IpcChannel.SyncState, state),
    onIncoming: (bundle) => {
      // Only the renderer can restore a bundle, and pairing cannot outlive it
      // (the card closes the session when it unmounts) — so a missing window
      // means the session was already over.
      if (!mainWindow || mainWindow.isDestroyed()) return;
      mainWindow.webContents.send(IpcChannel.SyncIncoming, bundle);
      // What was restored is reported in the window, so bring it forward.
      focusMainWindow();
    },
  });
  ipcMain.handle(IpcChannel.SyncStart, (_e, bundle: unknown, lang: unknown) =>
    typeof bundle === 'string'
      ? lan.start(bundle, typeof lang === 'string' ? lang : 'en')
      : { kind: 'error', message: 'unavailable' },
  );
  ipcMain.handle(IpcChannel.SyncStop, () => lan.stop());
  // Pairing is a live socket holding a copy of the user's data: it must not
  // outlive the session that opened it.
  app.on('before-quit', () => lan.stop());

  // The renderer owns the practice data, so it publishes what the tray menu,
  // tooltip and dock badge should say. Anything malformed is dropped.
  ipcMain.on(IpcChannel.ShellStatus, (_e, status: unknown) => {
    if (isShellStatus(status)) setShellStatus(status);
  });

  // Live exam progress on the dock/taskbar icon.
  ipcMain.on(IpcChannel.ShellProgress, (_e, fraction: unknown) => {
    if (fraction === null) setShellProgress(null);
    else if (typeof fraction === 'number' && Number.isFinite(fraction)) setShellProgress(fraction);
  });

  registerFontIpc();
  registerAiIpc();
  // The 60-second drill in its own overlay window, from the tray or a global
  // hotkey. Loads the same renderer with ?quick=1 — no second codebase.
  registerQuickTest({
    url: isDev ? DEV_URL : appUrl(),
    preload: path.join(__dirname, 'preload.cjs'),
  });
  // Serve the built renderer (and its bundled OCR assets) over app://.
  registerAppProtocol(DIST_DIR);
  registerOpenWith(() => mainWindow, focusMainWindow);

  splash = createSplash(app.getVersion());
  mainWindow = createMainWindow();

  createTray({
    show: focusMainWindow,
    navigate,
    resume,
    // The renderer owns the setting; the tray only asks for it to change.
    // Sending to a hidden window is fine — and better than raising it, since
    // not opening the app is the whole point of switching this from the tray.
    setDnd: (dnd) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(IpcChannel.ShellSetDnd, dnd);
        return;
      }
      // With no renderer there is nothing to store it, so the app comes back
      // and is told once it can listen.
      const win = (mainWindow = createMainWindow());
      win.webContents.once('did-finish-load', () =>
        win.webContents.send(IpcChannel.ShellSetDnd, dnd),
      );
    },
    // "Not today, thanks": today's nudge is dropped, the reminder stays on.
    dismissReminder: () => reminders?.dismissToday(),
    quickTest: openQuickTest,
    quit,
  });
  createDock({ show: focusMainWindow, navigate, resume }, () => mainWindow);
  createAppMenu({
    navigate,
    openFile: () => void promptForFile(),
    resume,
    quickTest: openQuickTest,
    quit,
  });

  // A file that started the app (Windows/Linux pass it as an argument; macOS
  // uses the open-file event registered above).
  for (const file of filesFromArgv(process.argv)) void openFile(file);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createMainWindow();
    else focusMainWindow();
  });
}

/**
 * One instance per machine. Without this a second launch starts a rival process
 * that opens the same SQLite database, so two windows would write the same
 * history. A second launch instead focuses the window that already exists —
 * and carries any file or jump-list route it was asked to open.
 */
if (app.requestSingleInstanceLock()) {
  app.on('second-instance', (_event, argv) => {
    focusMainWindow();
    const route = routeFromArgv(argv);
    if (route) navigate(route);
    for (const file of filesFromArgv(argv)) void openFile(file);
  });
  void app.whenReady().then(bootstrap);
} else {
  app.quit();
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  quitting = true;
  destroyDock();
  destroyTray();
  // A global accelerator outlives the window it was registered from, so it has
  // to be given back explicitly.
  unregisterQuickTest();
});
