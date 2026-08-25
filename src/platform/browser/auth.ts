import type { Account, Auth } from '../ports';

const KEY = 'typly:auth';

// Guest-first auth. Real login/subscription arrives later via the Fastify backend.
export class BrowserAuth implements Auth {
  async current(): Promise<Account | null> {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Account) : null;
  }

  async continueAsGuest(): Promise<Account> {
    const account: Account = { id: `guest-${crypto.randomUUID()}`, guest: true };
    localStorage.setItem(KEY, JSON.stringify(account));
    return account;
  }

  async login(email: string, _password: string): Promise<Account> {
    // Stub until the backend exists; keeps the UI flow working.
    const account: Account = { id: email, guest: false, plan: 'free' };
    localStorage.setItem(KEY, JSON.stringify(account));
    return account;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(KEY);
  }
}
