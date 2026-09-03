/**
 * When the daily practice nudge should fire, and when practice counts as missed.
 * Shared by the web timer and the Electron main-process timer so both behave
 * identically — the only difference is how each one surfaces the result.
 */

/** Gap after the reminder time before a still-unpractised day is nudged again. */
export const MISSED_NUDGE_MINUTES = 60;

export const DEFAULT_REMINDER_TIME = '19:00';

export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function hhmm(d = new Date()): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Minutes from a HH:MM time of day to `now`; negative before that time. */
export function minutesSince(time: string, now = new Date()): number {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  return Math.floor((now.getTime() - target.getTime()) / 60_000);
}

export interface ReminderInput {
  enabled: boolean;
  /** Reminder time of day, HH:MM. */
  time: string;
  now: Date;
  practicedToday: boolean;
  /** Day the reminder has already fired for, as stored. */
  firedFor: string | null;
  /** Day the follow-up nudge has already fired for, as stored. */
  nudgedFor: string | null;
}

export interface ReminderDecision {
  /** Fire the daily reminder now. */
  notifyDue: boolean;
  /** Fire the follow-up "still waiting" nudge now. */
  notifyMissed: boolean;
  /** Practice is overdue today — keep saying so (tray, title) until it is done. */
  pending: boolean;
  /** The day key both flags should be stored under. */
  today: string;
}

export function decideReminder(input: ReminderInput): ReminderDecision {
  const today = dayKey(input.now);
  const pending =
    input.enabled && hhmm(input.now) >= input.time && !input.practicedToday;
  const alreadyFired = input.firedFor === today;

  return {
    today,
    pending,
    notifyDue: pending && !alreadyFired,
    notifyMissed:
      pending &&
      alreadyFired &&
      input.nudgedFor !== today &&
      minutesSince(input.time, input.now) >= MISSED_NUDGE_MINUTES,
  };
}

/** Copy for each nudge, so the wording is the same on every platform. */
export const REMINDER_MESSAGE = {
  due: {
    title: 'Time to practice ⌨️',
    body: 'Keep your streak going with a quick typing test.',
  },
  missed: {
    title: 'Missing you ⌨️',
    body: "Today's typing practice is still pending — a 10-minute test is enough.",
  },
} as const;

/** Tray tooltip/title while practice is outstanding. */
export const TRAY_PENDING_TOOLTIP = 'Typly — missing you, typing practice pending';
export const TRAY_PENDING_TITLE = 'Typing pending';
