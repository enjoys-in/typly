import { useEffect, useState } from 'react';
import { Check, Lock, Mail, Sparkles, User } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useAuthStore } from '@/store/authStore';
import {
  featuresFor,
  isAcceptableEmail,
  isValidName,
  MAX_NAME_LENGTH,
  normalizeEmail,
  normalizeName,
} from '@/core/profile/profile';
import { GUEST_MAX_DURATION_MIN, MAX_DURATION_MIN } from '@/core/constants';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

/**
 * Where a name and email are added or changed later — the only route in for an
 * account created before profiles existed, and the way to unlock the extras.
 */
export function ProfileCard() {
  const platform = usePlatform();
  const t = useT();
  const account = useAuthStore((s) => s.account);
  const setAccount = useAuthStore((s) => s.setAccount);

  const [name, setName] = useState(account?.name ?? '');
  const [email, setEmail] = useState(account?.email ?? '');
  const [saved, setSaved] = useState(false);

  // Adopt the stored values once the session has been restored.
  useEffect(() => {
    setName(account?.name ?? '');
    setEmail(account?.email ?? '');
  }, [account?.name, account?.email]);

  const nameOk = isValidName(name);
  const emailOk = isAcceptableEmail(email);
  const changed =
    normalizeName(name) !== (account?.name ?? '') ||
    normalizeEmail(email) !== (account?.email ?? '');
  const unlocked = featuresFor({ email: normalizeEmail(email) || undefined });

  async function save() {
    if (!nameOk || !emailOk) return;
    const next = await platform.auth.updateProfile({ name, email });
    if (next) setAccount(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">{t('profile.title')}</h2>
        <p className="mt-1 text-xs text-fg-muted">
          {t('profile.hint')}
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          <User size={14} className="shrink-0 text-fg-subtle" /> {t('profile.name')}
        </span>
        <input
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('profile.namePlaceholder')}
          aria-invalid={name.length > 0 && !nameOk}
          className="select max-w-sm"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Mail size={14} className="shrink-0 text-fg-subtle" /> {t('profile.email')}
          <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-bold tracking-wide text-fg-muted uppercase">
            {t('landing.optional')}
          </span>
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('profile.emailPlaceholder')}
          aria-invalid={email.length > 0 && !emailOk}
          className="select max-w-sm"
        />
      </label>

      <div className="space-y-2 rounded-panel border border-line p-4">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
          {unlocked.longSessions ? (
            <Sparkles size={13} className="text-accent-text" />
          ) : (
            <Lock size={13} className="text-fg-subtle" />
          )}
          {t(unlocked.longSessions ? 'profile.unlocked' : 'profile.locked')}
        </p>
        <ul className="space-y-1 text-xs text-fg-muted">
          <li>
            {t('profile.perkSessions', {
              short: GUEST_MAX_DURATION_MIN,
              long: MAX_DURATION_MIN,
            })}
          </li>
          <li>{t('profile.perkCertificate')}</li>
          <li>{t('profile.perkExport')}</li>
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => void save()} disabled={!nameOk || !emailOk || !changed}>
          {t('profile.save')}
        </Button>
        {saved && (
          <span role="status" className="flex items-center gap-1.5 text-xs text-accent-text">
            <Check size={14} /> {t('profile.saved')}
          </span>
        )}
      </div>
    </Card>
  );
}
