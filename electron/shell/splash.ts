import { BrowserWindow } from 'electron';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * The launch window.
 *
 * A desktop app has to say something within the first few hundred milliseconds,
 * and Typly's first paint is not instant: the main process opens a SQLite
 * database and the renderer loads its bundle. So the brand mark and a progress
 * bar go up straight away, the bar is advanced at real milestones (see
 * main.ts), and the main window is only shown once the app is actually on
 * screen — which is why it never flashes an empty white frame.
 */

/** Transparency depends on a compositor, which a Linux session may not have. */
const TRANSPARENT = process.platform !== 'linux';
/** How long the fade-out runs; the window is destroyed after it. */
const FADE_MS = 260;
/** The bar creeps to here on its own, so it always looks alive. */
const CREEP_CEILING = 0.9;

function markup(iconDataUrl: string, version: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  :root { color-scheme: dark }
  html, body { margin: 0; height: 100%; background: transparent; overflow: hidden;
    -webkit-user-select: none; cursor: default }
  body { display: flex; align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif }
  .card { position: relative; display: flex; flex-direction: column; align-items: center;
    gap: 18px; width: 100%; height: 100%; box-sizing: border-box;
    padding: 40px 44px 34px; border-radius: ${TRANSPARENT ? '18px' : '0'};
    background: radial-gradient(120% 100% at 50% 0%, #16181f 0%, #0b0b0f 70%);
    border: 1px solid rgba(255,255,255,.08); color: #fff;
    opacity: 1; transition: opacity ${FADE_MS}ms ease }
  body.done .card { opacity: 0 }
  .mark { width: 84px; height: 84px; border-radius: 20px; display: block;
    box-shadow: 0 12px 32px rgba(0,0,0,.45) }
  .name { font-size: 21px; font-weight: 700; letter-spacing: -.01em; line-height: 1 }
  .name span { font-weight: 400; color: #6f7280; font-size: 12px; margin-left: 8px;
    letter-spacing: .02em }
  .sub { margin-top: -10px; font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
    color: #8b8b95 }
  .track { width: 100%; height: 4px; border-radius: 99px; background: rgba(255,255,255,.09);
    overflow: hidden; margin-top: auto }
  .bar { height: 100%; width: 0%; border-radius: 99px;
    background: linear-gradient(90deg, #22c55e, #0d9488);
    transition: width 320ms cubic-bezier(.4,0,.2,1) }
</style>
</head>
<body>
  <div class="card">
    <img class="mark" src="${iconDataUrl}" alt="">
    <div class="name">Typly<span>${version}</span></div>
    <div class="sub">Exam practice</div>
    <div class="track"><div class="bar" id="bar"></div></div>
  </div>
  <script>
    const bar = document.getElementById('bar');
    let shown = 0;
    // Never goes backwards: a milestone arriving late must not undo the creep.
    window.progress = (value) => {
      shown = Math.max(shown, Math.min(1, value));
      bar.style.width = (shown * 100).toFixed(1) + '%';
    };
    window.finish = () => {
      window.progress(1);
      document.body.classList.add('done');
    };
    // Loading is not measurable from in here, so the bar eases towards a ceiling
    // and waits for the real milestones to push it further.
    setInterval(() => window.progress(Math.min(${CREEP_CEILING}, shown + 0.035)), 220);
    window.progress(0.08);
  </script>
</body>
</html>`;
}

export interface Splash {
  /** Advance the bar (0..1). Never moves backwards. */
  progress(fraction: number): void;
  /** Fill the bar, fade out, then close. Resolves when the window is gone. */
  finish(): Promise<void>;
  /** Close immediately, for a failed launch. */
  destroy(): void;
  alive(): boolean;
}

/** A splash that is already gone, so callers never branch on null. */
const CLOSED: Splash = {
  progress: () => {},
  finish: () => Promise.resolve(),
  destroy: () => {},
  alive: () => false,
};

export function createSplash(version: string): Splash {
  const icon = loadIcon();
  // Without the mark there is nothing worth showing; the main window will just
  // appear on its own, which is better than a branded box with a hole in it.
  if (!icon) return CLOSED;

  const window = new BrowserWindow({
    width: 380,
    height: 300,
    show: false,
    frame: false,
    transparent: TRANSPARENT,
    backgroundColor: TRANSPARENT ? '#00000000' : '#0b0b0f',
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    // Taking focus would put the splash in the way of the window behind it.
    focusable: false,
    hasShadow: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });

  window.once('ready-to-show', () => {
    if (!window.isDestroyed()) window.showInactive();
  });
  void window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(markup(icon, version))}`);

  const alive = () => !window.isDestroyed();
  // Calls made before the page exists would be lost, so they are held back.
  let loaded = false;
  const queue: string[] = [];

  function run(script: string): void {
    if (!alive()) return;
    if (!loaded) {
      queue.push(script);
      return;
    }
    void window.webContents.executeJavaScript(script).catch(() => {});
  }

  window.webContents.once('did-finish-load', () => {
    loaded = true;
    for (const script of queue) run(script);
    queue.length = 0;
  });

  return {
    alive,
    progress: (fraction) => run(`window.progress(${clamp(fraction)})`),
    destroy: () => {
      if (alive()) window.destroy();
    },
    finish: () =>
      new Promise((resolve) => {
        if (!alive()) {
          resolve();
          return;
        }
        run('window.finish()');
        setTimeout(() => {
          if (alive()) window.destroy();
          resolve();
        }, FADE_MS);
      }),
  };
}

function clamp(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

/**
 * The mark is inlined as a data URL rather than loaded from a file: the splash
 * page runs from a data URL itself, which cannot reference the filesystem.
 */
function loadIcon(): string | null {
  try {
    const file = readFileSync(path.join(__dirname, 'splash-icon.png'));
    return `data:image/png;base64,${file.toString('base64')}`;
  } catch {
    return null;
  }
}
