import { app, Menu, Tray, nativeImage, type BrowserWindow } from 'electron';
import path from 'node:path';
import { TRAY_PENDING_TITLE, TRAY_PENDING_TOOLTIP } from '../../src/core/reminder/schedule';

const IDLE_TOOLTIP = 'Typly — Exam practice';

let tray: Tray | null = null;
let iconMissing = false;
let openWindow: (() => void) | null = null;

// nativeImage auto-picks the @2x variant sitting next to this file. The icons are
// copied into dist-electron by electron/build.mjs so the path is identical in dev
// and inside the packaged asar.
function trayImage() {
  const img = nativeImage.createFromPath(path.join(__dirname, 'tray-icon.png'));
  img.setTemplateImage(false);
  return img;
}

// System tray with quick actions.
export function createTray(getWindow: () => BrowserWindow | null): void {
  const icon = trayImage();
  iconMissing = icon.isEmpty();
  tray = new Tray(iconMissing ? nativeImage.createEmpty() : icon);
  if (iconMissing && process.platform === 'darwin') tray.setTitle(' Typly');
  tray.setToolTip(IDLE_TOOLTIP);

  const show = () => {
    const win = getWindow();
    win?.show();
    win?.focus();
  };
  openWindow = show;

  setMenu(false);
  tray.on('click', show);
}

function setMenu(pending: boolean): void {
  if (!tray) return;
  const show = () => openWindow?.();
  tray.setContextMenu(
    Menu.buildFromTemplate([
      ...(pending
        ? ([
            { label: 'Typing practice pending today', enabled: false },
            { label: 'Practice now', click: show },
            { type: 'separator' },
          ] as const)
        : []),
      { label: 'Open Typly', click: show },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]),
  );
}

/**
 * Reflect an outstanding practice session in the tray: the tooltip, the menu,
 * and (on macOS) a label beside the icon, so a missed reminder stays visible
 * instead of vanishing with the notification.
 */
export function setTrayPending(pending: boolean): void {
  if (!tray) return;
  tray.setToolTip(pending ? TRAY_PENDING_TOOLTIP : IDLE_TOOLTIP);
  if (process.platform === 'darwin') {
    tray.setTitle(pending ? ` ${TRAY_PENDING_TITLE}` : iconMissing ? ' Typly' : '');
  }
  setMenu(pending);
}

export function destroyTray(): void {
  tray?.destroy();
  tray = null;
}
