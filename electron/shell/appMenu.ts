import { app, Menu, shell, type MenuItemConstructorOptions } from 'electron';
import type { ShellRoute } from '../../src/core/ipc/shell';
import { QUICK_HOTKEY } from './quickTest';
import { PRIMARY_ACTIONS, SECONDARY_ACTIONS } from './quickActions';

/**
 * The application menu. Beyond looking like a real desktop app, it is what
 * gives the quick actions *working* keyboard shortcuts — a tray or dock menu
 * accelerator is only a label, the binding has to live here.
 */

export interface AppMenuHandlers {
  navigate: (route: ShellRoute) => void;
  /** File ▸ Open… — the picker counterpart to "Open with Typly". */
  openFile: () => void;
  resume: () => void;
  /** The 60-second drill in its own small window. */
  quickTest: () => void;
  quit: () => void;
}

const HOMEPAGE = 'https://enjoys.in';

export function createAppMenu(handlers: AppMenuHandlers): void {
  const isMac = process.platform === 'darwin';

  const goItems = (actions: typeof PRIMARY_ACTIONS): MenuItemConstructorOptions[] =>
    actions.map((action) => ({
      label: action.label,
      ...(action.accelerator ? { accelerator: action.accelerator } : {}),
      click: () => handlers.navigate(action.route),
    }));

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? ([
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              {
                label: 'Settings…',
                accelerator: 'Cmd+,',
                click: () => handlers.navigate('/app/settings'),
              },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { label: 'Quit Typly', accelerator: 'Cmd+Q', click: () => handlers.quit() },
            ],
          },
        ] as MenuItemConstructorOptions[])
      : []),
    {
      label: '&File',
      submenu: [
        ...goItems(PRIMARY_ACTIONS.slice(0, 1)),
        {
          label: 'Open Text File…',
          accelerator: 'CmdOrCtrl+O',
          click: () => handlers.openFile(),
        },
        // Populated by app.addRecentDocument whenever a file is opened with Typly.
        ...(isMac
          ? ([{ role: 'recentDocuments', submenu: [{ role: 'clearRecentDocuments' }] }] as MenuItemConstructorOptions[])
          : []),
        { type: 'separator' },
        {
          label: 'Quick 60-Second Drill',
          accelerator: QUICK_HOTKEY,
          click: () => handlers.quickTest(),
        },
        { label: 'Resume Unfinished Test', click: () => handlers.resume() },
        { type: 'separator' },
        isMac ? { role: 'close' } : { label: 'Quit Typly', accelerator: 'Alt+F4', click: () => handlers.quit() },
      ],
    },
    {
      label: '&Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: '&Practice',
      submenu: [
        ...goItems(PRIMARY_ACTIONS.slice(1)),
        { type: 'separator' },
        ...goItems(SECONDARY_ACTIONS),
      ],
    },
    {
      label: '&View',
      submenu: [
        { label: 'Dashboard', accelerator: 'CmdOrCtrl+0', click: () => handlers.navigate('/app') },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: '&Window',
      submenu: isMac
        ? [{ role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }]
        : [{ role: 'minimize' }],
    },
    {
      label: '&Help',
      submenu: [
        { label: 'Typly on the Web', click: () => void shell.openExternal(HOMEPAGE) },
        { label: `Version ${app.getVersion()}`, enabled: false },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
