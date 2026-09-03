import { EMPTY_SHELL_STATUS, type ShellStatus } from '../../src/core/ipc/shell';
import { DEFAULT_REMINDER_TIME } from '../../src/core/reminder/schedule';

/**
 * The single copy of "what the shell should say", shared by the tray, the dock
 * badge, the jump list and the app menu. They subscribe instead of each holding
 * their own snapshot, so a status push can never leave one of them stale.
 */

/** The daily reminder as the renderer last configured it. */
export interface ReminderState {
  enabled: boolean;
  /** Local time of day, HH:MM. */
  time: string;
}

let status: ShellStatus = EMPTY_SHELL_STATUS;
let pending = false;
let reminder: ReminderState = { enabled: false, time: DEFAULT_REMINDER_TIME };

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeShellState(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function shellStatus(): ShellStatus {
  return status;
}

/** Practice is overdue today (drives the tray nudge and the dock badge). */
export function practicePending(): boolean {
  return pending;
}

/** Where the reminder stands, so the tray menu can say so. */
export function reminderState(): ReminderState {
  return reminder;
}

export function setReminderState(next: ReminderState): void {
  reminder = next;
  emit();
}

export function setShellStatus(next: ShellStatus): void {
  status = next;
  emit();
}

export function setPracticePending(next: boolean): void {
  if (pending === next) return;
  pending = next;
  emit();
}
