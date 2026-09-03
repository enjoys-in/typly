import type { ShellRoute } from '../../src/core/ipc/shell';

/**
 * The actions Typly offers *outside* its window — in the tray menu, the macOS
 * dock menu, the Windows jump list and the app menu bar. One list so all four
 * stay identical; each is only a route the renderer is told to open.
 */
export interface QuickAction {
  label: string;
  route: ShellRoute;
  /** Shown in the jump list, which has room for a second line. */
  description: string;
  accelerator?: string;
}

/** Promoted to the top of every menu — the two things people come back for. */
export const PRIMARY_ACTIONS: QuickAction[] = [
  {
    label: 'New test',
    route: '/app/new',
    description: 'Paste or upload a passage and start a test',
    accelerator: 'CmdOrCtrl+N',
  },
  {
    label: 'Practice drill',
    route: '/app/practice',
    description: 'Generated rows, numbers and symbols drills',
    accelerator: 'CmdOrCtrl+D',
  },
];

/** The rest of the app, one level down. */
export const SECONDARY_ACTIONS: QuickAction[] = [
  {
    label: 'Lessons',
    route: '/app/lessons',
    description: 'Work through the typing curriculum',
  },
  {
    label: 'Trainer',
    route: '/app/trainer',
    description: 'Drill your weakest keys',
    accelerator: 'CmdOrCtrl+T',
  },
  {
    label: 'Library',
    route: '/app/library',
    description: 'Your saved paragraphs and split documents',
    accelerator: 'CmdOrCtrl+L',
  },
  {
    label: 'Results',
    route: '/app/history',
    description: 'Every past attempt',
  },
  {
    label: 'Progress',
    route: '/app/progress',
    description: 'Speed and accuracy over time',
  },
  {
    label: 'Settings',
    route: '/app/settings',
    description: 'Exam profile, language and reminders',
    accelerator: 'CmdOrCtrl+,',
  },
];

export const QUICK_ACTIONS: QuickAction[] = [...PRIMARY_ACTIONS, ...SECONDARY_ACTIONS];
