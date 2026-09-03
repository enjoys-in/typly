import type { Account, Auth } from '../ports';
import { normalizeEmail, normalizeName, type Profile } from '@/core/profile/profile';

const KEY = 'typly:auth';

/** Only the fields we recognise, so a hand-edited record cannot inject others. */
function sanitize(raw: unknown): Account | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = raw as Partial<Account>;
  if (typeof value.id !== 'string' || typeof value.guest !== 'boolean') return null;
  return {
    id: value.id,
    guest: value.guest,
    ...(typeof value.plan === 'string' ? { plan: value.plan } : {}),
    ...(typeof value.name === 'string' ? { name: value.name } : {}),
    ...(typeof value.email === 'string' ? { email: value.email } : {}),
  };
}

// Guest-first auth. Real login/subscription arrives later via the Fastify backend.
export class BrowserAuth implements Auth {
  private read(): Account | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return sanitize(JSON.parse(raw));
    } catch {
      // A corrupt record must not take the whole app down at boot.
      return null;
    }
  }

  private write(account: Account): Account {
    localStorage.setItem(KEY, JSON.stringify(account));
    return account;
  }

  /** Drop an empty email rather than storing one, so `email` means "provided". */
  private withProfile(account: Account, profile: Partial<Profile>): Account {
    const name = profile.name === undefined ? account.name : normalizeName(profile.name);
    const email = profile.email === undefined ? account.email : normalizeEmail(profile.email);
    return {
      ...account,
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
    };
  }

  async current(): Promise<Account | null> {
    return this.read();
  }

  async continueAsGuest(profile: Profile): Promise<Account> {
    const account: Account = { id: `guest-${crypto.randomUUID()}`, guest: true };
    return this.write(this.withProfile(account, profile));
  }

  async login(email: string, _password: string): Promise<Account> {
    // Stub until the backend exists; keeps the UI flow working.
    const existing = this.read();
    const account: Account = { id: email, guest: false, plan: 'free', email: normalizeEmail(email) };
    return this.write({ ...account, ...(existing?.name ? { name: existing.name } : {}) });
  }

  async updateProfile(patch: Partial<Profile>): Promise<Account | null> {
    const account = this.read();
    if (!account) return null;
    // An explicitly blank email clears it, which re-locks the extras.
    const cleared = patch.email !== undefined && patch.email.trim() === '';
    const next = this.withProfile(account, patch);
    if (cleared) delete next.email;
    return this.write(next);
  }

  async logout(): Promise<void> {
    localStorage.removeItem(KEY);
  }
}
