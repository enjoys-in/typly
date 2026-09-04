import { BrowserWindow, globalShortcut, screen } from 'electron';

/**
 * The 60-second drill, in a window of its own.
 *
 * The tray already has "Practice now", but it opens the whole app — which means
 * a full window, a route, a passage to choose and a mind made up before any
 * typing happens. The habit dies in that gap. So this is the other thing
 * entirely: a small always-on-top window with one drill in it, reachable from
 * the tray or a global hotkey, that costs a keystroke to start and closes
 * itself when done.
 *
 * It loads the ordinary renderer with `?quick=1`, so there is no second
 * codebase to keep in step — the app reads that flag and mounts the compact
 * drill instead of the shell.
 */

/** Small enough to sit over other work, large enough for a passage and a clock. */
const WIDTH = 620;
const HEIGHT = 340;
/** Margin from the screen edge it parks itself at. */
const INSET = 24;

export const QUICK_HOTKEY = 'CommandOrControl+Shift+T';
/** Query flag the renderer reads to mount the compact drill. */
export const QUICK_FLAG = 'quick';

let quick: BrowserWindow | null = null;

export interface QuickTestOptions {
  /** Renderer URL (dev server or app://), without the quick flag. */
  url: string;
  /** Absolute path to the preload script the main window uses. */
  preload: string;
}

let options: QuickTestOptions | null = null;

function quickUrl(url: string): string {
  // Hash routing means the flag has to go in the query, before the hash, or the
  // router would swallow it.
  const [base, hash] = url.split('#');
  const joined = `${base}${base?.includes('?') ? '&' : '?'}${QUICK_FLAG}=1`;
  return hash ? `${joined}#${hash}` : joined;
}

/** Opens (or focuses) the quick-drill window. */
export function openQuickTest(): void {
  if (quick && !quick.isDestroyed()) {
    quick.show();
    quick.focus();
    return;
  }
  if (!options) return;

  // Bottom-right of whichever display the cursor is on, so it appears where the
  // user is already looking rather than on the primary monitor.
  const cursor = screen.getCursorScreenPoint();
  const { workArea } = screen.getDisplayNearestPoint(cursor);

  quick = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    x: workArea.x + workArea.width - WIDTH - INSET,
    y: workArea.y + workArea.height - HEIGHT - INSET,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    title: 'Quick drill',
    backgroundColor: '#0b0b0f',
    // A frameless panel is what makes this read as an overlay rather than a
    // second copy of the app.
    frame: false,
    webPreferences: {
      preload: options.preload,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  quick.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // Losing focus is how a one-minute overlay is dismissed; anything else means
  // remembering to close it, which is the friction this exists to remove. Only
  // armed once the content is up, or a blur during loading would close the
  // window before the user ever saw it.
  quick.webContents.once('did-finish-load', () => {
    quick?.on('blur', () => quick?.close());
  });
  quick.on('closed', () => {
    quick = null;
  });

  void quick.loadURL(quickUrl(options.url));
}

export function closeQuickTest(): void {
  if (quick && !quick.isDestroyed()) quick.close();
}

/**
 * Registers the window factory and the global hotkey.
 *
 * A global accelerator can be taken by another application, in which case
 * registration simply fails — the tray entry still works, so the feature
 * degrades rather than breaking.
 */
export function registerQuickTest(next: QuickTestOptions): void {
  options = next;
  if (!globalShortcut.register(QUICK_HOTKEY, openQuickTest)) {
    console.error(`[typly] could not register ${QUICK_HOTKEY} — another app has it`);
  }
}

export function unregisterQuickTest(): void {
  globalShortcut.unregister(QUICK_HOTKEY);
  closeQuickTest();
  options = null;
}
