import { app, Menu, Tray, nativeImage, type BrowserWindow } from 'electron';

let tray: Tray | null = null;

// System tray with quick actions. Uses a text title on macOS so no icon asset is
// required for the first build; a branded icon can be dropped in later.
export function createTray(getWindow: () => BrowserWindow | null): void {
  tray = new Tray(nativeImage.createEmpty());
  if (process.platform === 'darwin') tray.setTitle(' Typly');
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
