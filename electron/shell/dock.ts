import { app, Menu, nativeImage, type BrowserWindow, type MenuItemConstructorOptions } from 'electron';
import path from 'node:path';
import type { ShellRoute } from '../../src/core/ipc/shell';
import { PRIMARY_ACTIONS, QUICK_ACTIONS } from './quickActions';
import { practicePending, shellStatus, subscribeShellState } from './state';

/**
 * Dock (macOS) and taskbar (Windows/Linux) integration.
 *
 * The window is only half of how a desktop app is used: right-clicking the dock
 * or taskbar icon should start a test without opening the window first, an
 * outstanding practice session should show as a badge, and a running exam
 * should show its progress on the icon itself. This is the same treatment
 * chat apps give unread counts and file transfers.
 */

export interface DockHandlers {
  show: () => void;
  navigate: (route: ShellRoute) => void;
  resume: () => void;
}

/** Prefix a jump-list entry relaunches with; parsed back out at startup. */
export const GOTO_FLAG = '--goto=';

let handlers: DockHandlers | null = null;
let getWindow: (() => BrowserWindow | null) | null = null;
let unsubscribe: (() => void) | null = null;

/** Non-template icon — a taskbar overlay badge is drawn, not tinted. */
function badgeImage(): Electron.NativeImage {
  return nativeImage.createFromPath(path.join(__dirname, 'tray-icon.png'));
}

export function createDock(next: DockHandlers, window: () => BrowserWindow | null): void {
  handlers = next;
  getWindow = window;
  refresh();
  unsubscribe = subscribeShellState(refresh);
}

function menuTemplate(): MenuItemConstructorOptions[] {
  const status = shellStatus();
  return [
    ...(status.hasUnfinished || status.resumeLabel
      ? ([
          {
            label: status.hasUnfinished
              ? 'Resume unfinished test'
              : `Continue ${status.resumeLabel}`,
            click: () => handlers?.resume(),
          },
          { type: 'separator' },
        ] as MenuItemConstructorOptions[])
      : []),
    ...QUICK_ACTIONS.map((action) => ({
      label: action.label,
      click: () => handlers?.navigate(action.route),
    })),
  ];
}

function refresh(): void {
  const pending = practicePending();

  if (process.platform === 'darwin') {
    app.dock?.setMenu(Menu.buildFromTemplate(menuTemplate()));
    // A dot rather than a count: there is one thing outstanding, not five.
    app.dock?.setBadge(pending ? '•' : '');
  } else if (process.platform === 'win32') {
    // Windows jump list: right-clicking the taskbar button (or the Start tile)
    // gets the same actions. Each one relaunches with a --goto argument, which
    // the running instance picks up in its second-instance handler.
    app.setUserTasks(
      QUICK_ACTIONS.map((action) => ({
        program: process.execPath,
        arguments: `${GOTO_FLAG}${action.route}`,
        iconPath: process.execPath,
        iconIndex: 0,
        title: action.label,
        description: action.description,
      })),
    );
    const win = getWindow?.();
    if (win && !win.isDestroyed()) {
      const icon = badgeImage();
      if (pending && !icon.isEmpty()) win.setOverlayIcon(icon, 'Typing practice pending');
      else win.setOverlayIcon(null, '');
      setThumbnailButtons(win);
    }
  } else {
    // Unity/GNOME launchers read the badge count.
    app.setBadgeCount(pending ? 1 : 0);
  }
}

/**
 * Buttons under the Windows taskbar thumbnail — the row of controls a chat or
 * media app puts there. Hovering the taskbar button offers the two things worth
 * doing without raising the window, plus resuming when something is waiting.
 */
function setThumbnailButtons(win: BrowserWindow): void {
  if (process.platform !== 'win32') return;
  const icon = badgeImage();
  if (icon.isEmpty()) return;
  const thumb = icon.resize({ width: 16, height: 16 });
  const status = shellStatus();

  win.setThumbarButtons([
    ...(status.hasUnfinished || status.resumeLabel
      ? [
          {
            tooltip: status.hasUnfinished
              ? 'Resume unfinished test'
              : `Continue ${status.resumeLabel}`,
            icon: thumb,
            click: () => handlers?.resume(),
          },
        ]
      : []),
    ...PRIMARY_ACTIONS.map((action) => ({
      tooltip: action.description,
      icon: thumb,
      click: () => handlers?.navigate(action.route),
    })),
  ]);
}

/**
 * Exam progress on the dock/taskbar icon, so a running test is visible while
 * the user is in another window. `null` clears it.
 */
export function setShellProgress(fraction: number | null): void {
  const win = getWindow?.();
  if (!win || win.isDestroyed()) return;
  if (fraction === null) {
    win.setProgressBar(-1);
    return;
  }
  win.setProgressBar(Math.min(1, Math.max(0, fraction)));
}

/** Ask for attention without stealing focus — a bounce or a taskbar flash. */
export function requestAttention(): void {
  if (process.platform === 'darwin') {
    app.dock?.bounce('informational');
    return;
  }
  const win = getWindow?.();
  if (win && !win.isDestroyed() && !win.isFocused()) win.flashFrame(true);
}

export function destroyDock(): void {
  unsubscribe?.();
  unsubscribe = null;
  setShellProgress(null);
  handlers = null;
  getWindow = null;
}
