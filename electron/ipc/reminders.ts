import { Notification } from 'electron';
import type { SqliteRepository } from '../data/db';
import { SETTING_KEY } from '../../src/core/constants';
import {
  DEFAULT_REMINDER_TIME,
  dayKey,
  decideReminder,
  REMINDER_MESSAGE,
} from '../../src/core/reminder/schedule';

// Main-process daily reminder. Runs off a main timer (not the renderer, which is
// throttled when hidden) and shares its stored flags with the renderer store.
// The schedule itself lives in src/core/reminder so web and desktop agree.
export function createReminderScheduler(
  db: SqliteRepository,
  onActivate: () => void,
  /** Called whenever the outstanding-practice state changes (drives the tray). */
  onPending: (pending: boolean) => void = () => {},
) {
  let enabled = false;
  let time = DEFAULT_REMINDER_TIME;
  let timer: ReturnType<typeof setInterval> | null = null;
  let lastPending: boolean | null = null;

  function notify(title: string, body: string): void {
    if (!Notification.isSupported()) return;
    const n = new Notification({ title, body });
    n.on('click', onActivate);
    n.show();
  }

  function tick() {
    const now = new Date();
    const decision = decideReminder({
      enabled,
      time,
      now,
      practicedToday: db.listHistory().some((t) => dayKey(new Date(t.createdAt)) === dayKey(now)),
      firedFor: db.getSetting(SETTING_KEY.ReminderFired),
      nudgedFor: db.getSetting(SETTING_KEY.ReminderNudged),
      dismissedFor: db.getSetting(SETTING_KEY.ReminderDismissed),
    });

    if (decision.notifyDue) {
      db.setSetting(SETTING_KEY.ReminderFired, decision.today);
      notify(REMINDER_MESSAGE.due.title, REMINDER_MESSAGE.due.body);
    } else if (decision.notifyMissed) {
      db.setSetting(SETTING_KEY.ReminderNudged, decision.today);
      notify(REMINDER_MESSAGE.missed.title, REMINDER_MESSAGE.missed.body);
    }

    // Only touch the tray when the state actually changes.
    if (decision.pending !== lastPending) {
      lastPending = decision.pending;
      onPending(decision.pending);
    }
  }

  function configure(nextEnabled: boolean, nextTime: string): void {
    enabled = nextEnabled;
    time = nextTime || DEFAULT_REMINDER_TIME;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (!enabled) {
      // Turning reminders off must clear any nudge already on the tray.
      if (lastPending) {
        lastPending = false;
        onPending(false);
      }
      return;
    }
    tick();
    timer = setInterval(tick, 60_000);
  }

  /**
   * "Not today, thanks", from the tray. The reminder stays on for tomorrow —
   * only today's nudge is dropped, which is why it is stored per day rather
   * than by flipping the setting the user chose.
   */
  function dismissToday(): void {
    db.setSetting(SETTING_KEY.ReminderDismissed, dayKey(new Date()));
    tick();
  }

  return { configure, dismissToday };
}
