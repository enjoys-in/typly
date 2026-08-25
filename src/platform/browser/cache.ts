import type { Cache } from '../ports';

interface Entry<T> {
  v: T;
  exp: number | null; // epoch ms, or null = no expiry
}

const PREFIX = 'typly:cache:';

// Simple TTL cache over localStorage — the browser Cache port.
export class BrowserCache implements Cache {
  async get<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    try {
      const entry = JSON.parse(raw) as Entry<T>;
      if (entry.exp !== null && Date.now() > entry.exp) {
        localStorage.removeItem(PREFIX + key);
        return null;
      }
      return entry.v;
    } catch {
      return null;
    }
  }

  async put<T>(key: string, value: T, ttlSec?: number): Promise<void> {
    const entry: Entry<T> = {
      v: value,
      exp: ttlSec ? Date.now() + ttlSec * 1000 : null,
    };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  }
}
