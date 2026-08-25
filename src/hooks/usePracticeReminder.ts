import { useEffect } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import { useSettingsStore } from '@/store/settingsStore';

function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function hhmm(d = new Date()): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// While the app is open, nudge once a day at the chosen time if the user hasn't
// practiced yet. Desktop stays alive via the tray, so it fires even when hidden.
export function usePracticeReminder(): void {
  const platform = usePlatform();
  const enabled = useSettingsStore((s) => s.reminderEnabled);
  const time = useSettingsStore((s) => s.reminderTime);

  useEffect(() => {
    // Desktop: let the main process run the timer (survives renderer throttling).
    const desktop = window.bridge?.reminder;
    if (desktop) {
      void desktop.set(enabled, time);
      return;
    }
    if (!enabled) return;
    let cancelled = false;

    async function check() {
      if (cancelled || hhmm() < time) return;
      const today = dayKey();
      // Only handle one reminder per day.
      if ((await platform.repo.getSetting('reminderLastFired')) === today) return;
      const history = await platform.repo.listHistory();
      const practiced = history.some((t) => dayKey(new Date(t.createdAt)) === today);
      await platform.repo.setSetting('reminderLastFired', today);
      if (!practiced) {
        platform.notifications.notify(
          'Time to practice ⌨️',
          'Keep your streak going with a quick typing test.',
        );
      }
    }

    void check();
    const id = window.setInterval(() => void check(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled, time, platform]);
}
