import { Notification } from 'electron';
import type { SqliteRepository } from '../data/db';
import { SETTING_KEY } from '../../src/core/constants';
import {
  DEFAULT_REMINDER_TIME,
  dayKey,
  decideReminder,
  reminderMessage,
} from '../../src/core/reminder/schedule';
import { countdownFrom } from '../../src/core/exam/countdown';

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
    const history = db.listHistory();
    const decision = decideReminder({
      enabled,
      time,
      now,
      practicedToday: history.some((t) => dayKey(new Date(t.createdAt)) === dayKey(now)),
      firedFor: db.getSetting(SETTING_KEY.ReminderFired),
      nudgedFor: db.getSetting(SETTING_KEY.ReminderNudged),
      dismissedFor: db.getSetting(SETTING_KEY.ReminderDismissed),
    });

    if (decision.notifyDue || decision.notifyMissed) {
      // The same wording as the web timer, exam countdown included.
      const countdown = countdownFrom(db.getSetting(SETTING_KEY.ExamTarget), history, now);
      const message = reminderMessage(decision.notifyDue ? 'due' : 'missed', countdown);
      db.setSetting(
        decision.notifyDue ? SETTING_KEY.ReminderFired : SETTING_KEY.ReminderNudged,
        decision.today,
      );
      notify(message.title, message.body);
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
