import { AlertTriangle, Check, X } from 'lucide-react';
import type { PreflightCheck } from '@/core/exam/preflight';
import { preflightClear } from '@/core/exam/preflight';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n/en';

interface Props {
  checks: PreflightCheck[];
}

const ICON = {
  ok: Check,
  warn: AlertTriangle,
  blocked: X,
} as const;

const TONE = {
  ok: 'text-accent-text',
  warn: 'text-fg-muted',
  blocked: 'text-danger-text',
} as const;

/**
 * The short green checklist before the clock starts.
 *
 * Caps Lock left on, an OS input method fighting InScript, a Kruti Dev board
 * with no font uploaded — each of these silently ruins an attempt and each is
 * detectable. Ten minutes are otherwise wasted discovering it at character
 * three, which is why this sits in the briefing rather than in Settings.
 */
export function PreflightChecklist({ checks }: Props) {
  const t = useT();
  if (checks.length === 0) return null;
  const clear = preflightClear(checks);

  return (
    <div
      className={`space-y-3 rounded-panel border p-4 ${
        clear ? 'border-line' : 'border-danger-border bg-danger-soft'
      }`}
    >
      <p className="text-sm font-semibold">
        {t(clear ? 'preflight.title' : 'preflight.titleBlocked')}
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {checks.map((check) => {
          const Icon = ICON[check.level];
          return (
            <li key={check.id} className="flex items-start gap-2 text-sm">
              <Icon size={15} className={`mt-0.5 shrink-0 ${TONE[check.level]}`} />
              <span className={check.level === 'blocked' ? 'font-semibold' : 'text-fg-muted'}>
                {t(`preflight.${check.id}.${check.level === 'ok' ? 'ok' : 'bad'}` as TKey)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
