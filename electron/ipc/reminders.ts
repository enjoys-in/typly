import { Notification } from 'electron';
import type { SqliteRepository } from '../data/db';

function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function hhmm(d = new Date()): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Main-process daily reminder. Runs off a main timer (not the renderer, which is
// throttled when hidden) and shares `reminderLastFired` with the renderer store.
export function createReminderScheduler(db: SqliteRepository, onActivate: () => void) {
  let enabled = false;
  let time = '19:00';
  let timer: ReturnType<typeof setInterval> | null = null;

  function tick() {
    if (!enabled || hhmm() < time) return;
    const today = dayKey();
    if (db.getSetting('reminderLastFired') === today) return;
    const practiced = db.listHistory().some((t) => dayKey(new Date(t.createdAt)) === today);
    db.setSetting('reminderLastFired', today);
    if (!practiced && Notification.isSupported()) {
      const n = new Notification({
        title: 'Time to practice ⌨️',
        body: 'Keep your streak going with a quick typing test.',
      });
      n.on('click', onActivate);
      n.show();
    }
  }

  function configure(nextEnabled: boolean, nextTime: string): void {
    enabled = nextEnabled;
    time = nextTime || '19:00';
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (enabled) {
      tick();
      timer = setInterval(tick, 60_000);
    }
  }

  return { configure };
}
