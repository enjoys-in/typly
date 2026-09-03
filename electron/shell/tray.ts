import { app, Menu, Tray, nativeImage, type MenuItemConstructorOptions } from 'electron';
import path from 'node:path';
import { statusLine, shellTooltip, type ShellRoute } from '../../src/core/ipc/shell';
import { TRAY_PENDING_TITLE } from '../../src/core/reminder/schedule';
import { PRIMARY_ACTIONS, SECONDARY_ACTIONS } from './quickActions';
import { practicePending, shellStatus, subscribeShellState } from './state';

// nativeImage auto-picks the @2x variant sitting next to this file. The icons are
// copied into dist-electron by electron/build.mjs so the path is identical in dev
// and inside the packaged asar.
function trayImage(): Electron.NativeImage {
  const img = nativeImage.createFromPath(path.join(__dirname, 'tray-icon.png'));
  // A macOS menu-bar icon must be a template image: the system then tints it to
  // match a light or dark menu bar (and inverts it when the menu is open)
  // instead of showing a fixed-colour logo that disappears on one of them.
  img.setTemplateImage(process.platform === 'darwin');
  return img;
}

export interface TrayHandlers {
  /** Bring the window forward (creating it again if it was closed). */
  show: () => void;
  /** Send the renderer to a route, showing the window first. */
  navigate: (route: ShellRoute) => void;
  /** Resume the checkpointed attempt, or the next part of a split document. */
  resume: () => void;
  /** Really quit, rather than hiding back to the tray. */
  quit: () => void;
}

let tray: Tray | null = null;
let iconMissing = false;
let handlers: TrayHandlers | null = null;
let unsubscribe: (() => void) | null = null;

/**
 * System tray: a live status line, the same quick actions as the dock menu and
 * jump list, and a way out. Rebuilt whenever the practice status changes, so
 * the menu is never showing yesterday's numbers.
 */
export function createTray(next: TrayHandlers): void {
  handlers = next;
  const icon = trayImage();
  iconMissing = icon.isEmpty();
  tray = new Tray(iconMissing ? nativeImage.createEmpty() : icon);

  // Left click opens the window on Windows/Linux, where that is the convention;
  // on macOS a menu-bar item is expected to drop its menu instead, which
  // setContextMenu already does.
  if (process.platform !== 'darwin') tray.on('click', () => handlers?.show());
  tray.on('double-click', () => handlers?.show());

  refresh();
  unsubscribe = subscribeShellState(refresh);
}

function actionItems(
  actions: typeof PRIMARY_ACTIONS,
  withAccelerators: boolean,
): MenuItemConstructorOptions[] {
  return actions.map((action) => ({
    label: action.label,
    // Tray accelerators are labels only (the app menu owns the real binding),
    // so they are shown only where the window is the thing being driven.
    ...(withAccelerators && action.accelerator ? { accelerator: action.accelerator } : {}),
    click: () => handlers?.navigate(action.route),
  }));
}

function refresh(): void {
  if (!tray) return;
  const status = shellStatus();
  const pending = practicePending();

  tray.setToolTip(shellTooltip(status, pending));
  // macOS can put text beside the icon; use it only when something is
  // outstanding (or the icon failed to load), never as permanent clutter.
  if (process.platform === 'darwin') {
    tray.setTitle(pending ? ` ${TRAY_PENDING_TITLE}` : iconMissing ? ' Typly' : '');
  }

  const resumeLabel = status.resumeLabel;
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: `Typly ${app.getVersion()}`, enabled: false },
      { label: statusLine(status), enabled: false },
      { type: 'separator' },
      ...(pending
        ? ([
            { label: 'Typing practice pending today', enabled: false },
            { label: 'Practice now', click: () => handlers?.navigate('/app/new') },
            { type: 'separator' },
          ] as MenuItemConstructorOptions[])
        : []),
      { label: 'Open Typly', click: () => handlers?.show() },
      ...(status.hasUnfinished || resumeLabel
        ? ([
            {
              label: status.hasUnfinished
                ? 'Resume unfinished test'
                : `Continue ${resumeLabel}`,
              click: () => handlers?.resume(),
            },
          ] as MenuItemConstructorOptions[])
        : []),
      { type: 'separator' },
      ...actionItems(PRIMARY_ACTIONS, true),
      {
        label: 'Go to',
        submenu: actionItems(SECONDARY_ACTIONS, false),
      },
      { type: 'separator' },
      { label: 'Quit Typly', accelerator: 'CmdOrCtrl+Q', click: () => handlers?.quit() },
    ]),
  );
}

export function destroyTray(): void {
  unsubscribe?.();
  unsubscribe = null;
  tray?.destroy();
  tray = null;
  handlers = null;
}
