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

/**
 * A stored HH:MM setting as a friendly clock reading — `'19:00'` → `'7:00 pm'`.
 * The same 12-hour wording the app uses for every other time, so the tray menu
 * and the Settings switch never disagree about when the reminder fires.
 */
export function formatClock(time: string): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
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
  /** Day the user said "not today" for, as stored. */
  dismissedFor?: string | null;
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
  // Saying "not today" silences the nudge without turning the reminder off, so
  // it has to be remembered per day rather than as a setting.
  const pending =
    input.enabled &&
    hhmm(input.now) >= input.time &&
    !input.practicedToday &&
    input.dismissedFor !== today;
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

/** What the exam countdown contributes to a nudge, when a date has been set. */
export interface ReminderCountdown {
  /** Calendar days to exam day. */
  daysLeft: number;
  /** Short exam name, e.g. "SSC CHSL". */
  examName: string;
  /** Net WPM still missing from the cut-off; zero once it is met. */
  wpmGap: number;
}

/**
 * The nudge, said in terms of the exam when there is one.
 *
 * "Time to practice" is a nag. "68 days to SSC CHSL, you are 4 WPM short" is a
 * reason — the same notification, carrying the one fact that makes opening the
 * app worth it. With no exam set, or one already sat, it falls back to the
 * plain wording.
 */
export function reminderMessage(
  kind: 'due' | 'missed',
  countdown: ReminderCountdown | null,
): { title: string; body: string } {
  if (!countdown || countdown.daysLeft < 0) return REMINDER_MESSAGE[kind];

  const { daysLeft, examName, wpmGap } = countdown;
  const title =
    daysLeft === 0
      ? `${examName} is today`
      : daysLeft === 1
        ? `${examName} is tomorrow`
        : `${daysLeft} days to ${examName}`;

  if (kind === 'missed') {
    return { title, body: "Today's practice is still pending — 10 minutes holds your trend." };
  }
  return {
    title,
    body:
      wpmGap > 0
        ? `You are ${wpmGap} WPM short of the cut-off. One test today keeps you on trend.`
        : 'You are at the cut-off — one test today keeps it there.',
  };
}

/** Tray tooltip/title while practice is outstanding. */
export const TRAY_PENDING_TOOLTIP = 'Typly — missing you, typing practice pending';
export const TRAY_PENDING_TITLE = 'Typing pending';
