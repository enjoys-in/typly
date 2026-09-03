import { useEffect } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import { useSettingsStore } from '@/store/settingsStore';
import { SETTING_KEY } from '@/core/constants';
import { appConfig } from '@/config/appConfig';
import { dayKey, decideReminder, REMINDER_MESSAGE } from '@/core/reminder/schedule';

const BASE_TITLE = `${appConfig.name} — ${appConfig.tagline}`;
const PENDING_TITLE = `⌨️ Typing pending — ${appConfig.name}`;

// While the app is open, nudge once a day at the chosen time if the user hasn't
// practiced yet, then keep the tab title saying so until they do. Desktop stays
// alive via the tray, so the main process runs the same schedule there instead.
export function usePracticeReminder(): void {
  const platform = usePlatform();
  const reminderEnabled = useSettingsStore((s) => s.reminderEnabled);
  const time = useSettingsStore((s) => s.reminderTime);
  const dnd = useSettingsStore((s) => s.dnd);
  // Do not disturb holds the nudge without forgetting it: the setting stays on,
  // and the schedule resumes the moment it is lifted.
  const enabled = reminderEnabled && !dnd;

  useEffect(() => {
    // Desktop: let the main process run the timer (survives renderer throttling)
    // and show the pending state in the tray.
    const desktop = window.bridge?.reminder;
    if (desktop) {
      void desktop.set(enabled, time);
      return;
    }
    if (!enabled) {
      document.title = BASE_TITLE;
      return;
    }
    let cancelled = false;

    async function check() {
      if (cancelled) return;
      const now = new Date();
      const history = await platform.repo.listHistory();
      const decision = decideReminder({
        enabled: true,
        time,
        now,
        practicedToday: history.some((t) => dayKey(new Date(t.createdAt)) === dayKey(now)),
        firedFor: await platform.repo.getSetting(SETTING_KEY.ReminderFired),
        nudgedFor: await platform.repo.getSetting(SETTING_KEY.ReminderNudged),
        dismissedFor: await platform.repo.getSetting(SETTING_KEY.ReminderDismissed),
      });
      if (cancelled) return;

      if (decision.notifyDue) {
        await platform.repo.setSetting(SETTING_KEY.ReminderFired, decision.today);
        platform.notifications.notify(REMINDER_MESSAGE.due.title, REMINDER_MESSAGE.due.body);
      } else if (decision.notifyMissed) {
        await platform.repo.setSetting(SETTING_KEY.ReminderNudged, decision.today);
        platform.notifications.notify(REMINDER_MESSAGE.missed.title, REMINDER_MESSAGE.missed.body);
      }
      // The tab title is the web's tray: it keeps asking until practice is done.
      document.title = decision.pending ? PENDING_TITLE : BASE_TITLE;
    }

    void check();
    const id = window.setInterval(() => void check(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.title = BASE_TITLE;
    };
  }, [enabled, time, platform]);
}
