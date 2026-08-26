import { app, Menu, Tray, nativeImage, type BrowserWindow } from 'electron';
import path from 'node:path';

let tray: Tray | null = null;

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
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  if (icon.isEmpty() && process.platform === 'darwin') tray.setTitle(' Typly');
  tray.setToolTip('Typly — Exam practice');

  const show = () => {
    const win = getWindow();
    win?.show();
    win?.focus();
  };

  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open Typly', click: show },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]),
  );
  tray.on('click', show);
}

export function destroyTray(): void {
  tray?.destroy();
  tray = null;
}
