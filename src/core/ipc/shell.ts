/**
 * What the OS shell (tray, dock badge, jump list, window title) is allowed to
 * know about the user's practice. The renderer owns the data, the main process
 * only renders it — so the shape lives here, shared by both, and every value
 * arriving over IPC is validated against it.
 */

export interface ShellStatus {
  /** Real attempts completed today. */
  testsToday: number;
  /** The daily goal those attempts count towards. */
  dailyGoal: number;
  /** Consecutive days practised. */
  streak: number;
  /** An interrupted attempt is checkpointed and can be resumed. */
  hasUnfinished: boolean;
  /** A split document is part-way through, with its next part waiting. */
  resumeLabel: string | null;
  /** Do not disturb: every notification is being held. */
  dnd: boolean;
}

export const EMPTY_SHELL_STATUS: ShellStatus = {
  testsToday: 0,
  dailyGoal: 0,
  streak: 0,
  hasUnfinished: false,
  resumeLabel: null,
  dnd: false,
};

/** One line of practice status, for the tray menu header and its tooltip. */
export function statusLine(status: ShellStatus): string {
  const goal =
    status.dailyGoal > 0
      ? `${status.testsToday} of ${status.dailyGoal} tests today`
      : `${status.testsToday} ${status.testsToday === 1 ? 'test' : 'tests'} today`;
  const head = status.testsToday === 0 ? 'No practice yet today' : goal;
  return status.streak > 0 ? `${head} · ${status.streak}-day streak` : head;
}

/** Tray/dock tooltip: the app, then the status, then any outstanding nudge. */
export function shellTooltip(status: ShellStatus, pending: boolean, appName = 'Typly'): string {
  const lines = [`${appName} — ${statusLine(status)}`];
  if (pending) lines.push('Typing practice pending');
  if (status.dnd) lines.push('Do not disturb');
  return lines.join('\n');
}

/** Guards the renderer→main status push; a bad payload is dropped, not trusted. */
export function isShellStatus(value: unknown): value is ShellStatus {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Partial<ShellStatus>;
  return (
    Number.isFinite(s.testsToday) &&
    Number.isFinite(s.dailyGoal) &&
    Number.isFinite(s.streak) &&
    typeof s.hasUnfinished === 'boolean' &&
    typeof s.dnd === 'boolean' &&
    (s.resumeLabel === null || typeof s.resumeLabel === 'string')
  );
}

/** Routes the shell is allowed to send the renderer to (no arbitrary strings). */
export const SHELL_ROUTES = [
  '/app',
  '/app/new',
  '/app/exam',
  '/app/practice',
  '/app/lessons',
  '/app/trainer',
  '/app/library',
  '/app/history',
  '/app/progress',
  '/app/tools',
  '/app/settings',
] as const;

export type ShellRoute = (typeof SHELL_ROUTES)[number];

export function isShellRoute(value: unknown): value is ShellRoute {
  return typeof value === 'string' && (SHELL_ROUTES as readonly string[]).includes(value);
}
