import { app, type BrowserWindow, type WebContents } from 'electron';
import { isDevToolsChord } from './devToolsChord';

/**
 * DevTools are off. Permanently, for everybody.
 *
 * This is an exam app: the DOM holds the passage a Blind-mode run is
 * deliberately not showing you, and the renderer holds the scoring. An
 * inspector turns both into a cheat sheet, so the desktop build does not carry
 * one — not disabled behind a setting, not hidden behind a menu, absent.
 *
 * The one escape hatch is for whoever is building the app: an unpackaged build
 * with TYPLY_DEVTOOLS=1 in the environment. It is off even in development
 * unless asked for, because a default that only holds in production is a
 * default that gets shipped wrong once.
 */
export const DEVTOOLS_ENABLED = !app.isPackaged && process.env.TYPLY_DEVTOOLS === '1';

/**
 * Applied to every renderer the app ever creates.
 *
 * `webPreferences.devTools: false` is the real lock and is set on each window;
 * everything here is the second and third turn of the key. The chord handler
 * stops the keystroke reaching Chromium, and the `devtools-opened` guard closes
 * anything that gets through by a route nobody thought of — a menu role left
 * in by accident, an `openDevTools()` call added later, a future window that
 * forgets the webPreferences flag.
 */
export function hardenWebContents(contents: WebContents): void {
  if (DEVTOOLS_ENABLED) return;

  contents.on('before-input-event', (event, input) => {
    if (isDevToolsChord(input)) event.preventDefault();
  });

  contents.on('devtools-opened', () => {
    contents.closeDevTools();
  });
}

/** One hook, so a window added later cannot forget to opt in. */
export function registerDevToolsPolicy(): void {
  app.on('web-contents-created', (_event, contents) => hardenWebContents(contents));
}

/** Spread into a window's `webPreferences`. */
export const devToolsPref = { devTools: DEVTOOLS_ENABLED } as const;

/** Belt for a window built before the policy hook ran. */
export function hardenWindow(win: BrowserWindow): void {
  hardenWebContents(win.webContents);
}
