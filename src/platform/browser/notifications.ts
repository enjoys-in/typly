import type { Notifications, NotificationPermission } from '../ports';

// Desktop/web notifications via the Notification API. No-ops gracefully when the
// API is missing or permission is denied.
export class BrowserNotifications implements Notifications {
  available(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  permission(): NotificationPermission {
    if (!this.available()) return 'unsupported';
    return Notification.permission as NotificationPermission;
  }

  async ensurePermission(): Promise<boolean> {
    if (!this.available()) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  notify(title: string, body?: string): void {
    if (!this.available() || Notification.permission !== 'granted') return;
    try {
      new Notification(title, { body, icon: '/favicon.svg' });
    } catch {
      // Some browsers require notifications to originate from a SW; ignore failures.
    }
  }
}
