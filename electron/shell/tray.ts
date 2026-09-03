import { app, Menu, Tray, nativeImage, type MenuItemConstructorOptions } from 'electron';
import path from 'node:path';
import { statusLine, shellTooltip, type ShellRoute } from '../../src/core/ipc/shell';
import { formatClock, TRAY_PENDING_TITLE } from '../../src/core/reminder/schedule';
import { PRIMARY_ACTIONS, SECONDARY_ACTIONS } from './quickActions';
import { practicePending, reminderState, shellStatus, subscribeShellState } from './state';

/** Whether this platform can be told to start the app at login. */
const CAN_OPEN_AT_LOGIN = process.platform === 'darwin' || process.platform === 'win32';

/**
 * The tray icon: the brand mark, in colour, on every platform.
 *
 * macOS would also accept a *template* image — alpha only, which the system
 * tints for a light or dark menu bar — but that throws the green away, and the
 * mark is a white letter on a green tile, which reads on either. So the icon is
 * handed over as drawn, with templating explicitly off in case a future
 * nativeImage guesses otherwise.
 *
 * nativeImage picks the @2x variant sitting next to the file it is given. Both
 * are copied into dist-electron by electron/build.mjs, so the path is the same
 * in dev and inside the packaged asar.
 */
function trayImage(): Electron.NativeImage {
  const img = nativeImage.createFromPath(path.join(__dirname, 'tray-icon.png'));
  img.setTemplateImage(false);
  return img;
}

export interface TrayHandlers {
  /** Bring the window forward (creating it again if it was closed). */
  show: () => void;
  /** Ask the app to hold (or resume) every notification. */
  setDnd: (dnd: boolean) => void;
  /** Send the renderer to a route, showing the window first. */
  navigate: (route: ShellRoute) => void;
  /** Resume the checkpointed attempt, or the next part of a split document. */
  resume: () => void;
  /** Stop nudging about today's practice, without turning the reminder off. */
  dismissReminder: () => void;
  /** Really quit, rather than hiding back to the tray. */
  quit: () => void;
}

let tray: Tray | null = null;
let iconMissing = false;
let handlers: TrayHandlers | null = null;
let unsubscribe: (() => void) | null = null;

/**
 * System tray: a live status line, where the daily reminder stands, the same
 * quick actions as the dock menu and jump list, and a way out. Rebuilt whenever
 * the practice status changes, so the menu is never showing yesterday's numbers.
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

/**
 * The reminder block. Practice being overdue is the one thing the tray exists to
 * say when the window is closed, so it sits at the top with both replies to it:
 * do it now, or leave it for today.
 */
function reminderItems(pending: boolean): MenuItemConstructorOptions[] {
  // Do not disturb reaches here as `enabled: false`, because the app pushes the
  // reminder it actually wants run — so a held reminder shows no line at all,
  // and the switch below is what says why.
  const { enabled, time } = reminderState();
  if (!enabled) return [];

  if (!pending) {
    return [{ label: `Daily reminder at ${formatClock(time)}`, enabled: false }, { type: 'separator' }];
  }
  return [
    { label: 'Typing practice pending today', enabled: false },
    { label: 'Practice now', click: () => handlers?.navigate('/app/new') },
    { label: 'Not today, thanks', click: () => handlers?.dismissReminder() },
    { type: 'separator' },
  ];
}

/**
 * Do not disturb, reachable without opening the window — which is the point of
 * it. The app owns the setting (it has to persist and travel with a backup), so
 * this only asks; the checkbox reflects whatever the app then publishes back.
 */
function dndItem(): MenuItemConstructorOptions[] {
  const dnd = shellStatus().dnd;
  return [
    {
      label: 'Do not disturb',
      type: 'checkbox',
      checked: dnd,
      click: () => handlers?.setDnd(!dnd),
    },
  ];
}

/**
 * Starting with the machine is what makes a daily reminder dependable — the app
 * cannot nudge anyone if nobody opened it. Electron can only set this on macOS
 * and Windows; Linux autostart is the desktop environment's business.
 */
function loginItem(): MenuItemConstructorOptions[] {
  if (!CAN_OPEN_AT_LOGIN) return [];
  const { openAtLogin } = app.getLoginItemSettings();
  return [
    {
      label: 'Open at login',
      type: 'checkbox',
      checked: openAtLogin,
      click: () => app.setLoginItemSettings({ openAtLogin: !openAtLogin }),
    },
  ];
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
      ...reminderItems(pending),
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
      ...dndItem(),
      ...loginItem(),
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
