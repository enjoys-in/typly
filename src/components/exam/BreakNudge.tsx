import { useEffect, useState } from 'react';
import { Eye, PersonStanding, X } from 'lucide-react';
import { BREAK_MESSAGE, EYE_REST_SECONDS, type BreakKind } from '@/core/reminder/breaks';
import { Button } from '@/ui/Button';
import { useT } from '@/i18n';

interface Props {
  kind: BreakKind;
  onDismiss: () => void;
}

const ICON: Record<BreakKind, typeof Eye> = {
  eye: Eye,
  posture: PersonStanding,
};

/**
 * The break prompt itself, with a rest countdown for the eye break.
 *
 * Advice to "look away for twenty seconds" that leaves you counting in your
 * head gets ignored; a timer makes it a thing you can actually finish. The copy
 * comes from `BREAK_MESSAGE`, so the banner and the desktop notification say
 * exactly the same words.
 */
export function BreakNudge({ kind, onDismiss }: Props) {
  const t = useT();
  const Icon = ICON[kind];
  const [rest, setRest] = useState(kind === 'eye' ? EYE_REST_SECONDS : 0);

  useEffect(() => {
    if (rest <= 0) return;
    const id = setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [rest]);

  const message = BREAK_MESSAGE[kind];

  return (
    <div
      role="status"
      className="flex flex-wrap items-start gap-3 rounded-panel border border-accent-border bg-accent-soft px-4 py-3"
    >
      <Icon size={18} className="mt-0.5 shrink-0 text-accent-soft-fg" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{message.title}</p>
        <p className="mt-0.5 text-xs text-fg-muted">{message.body}</p>
      </div>
      {rest > 0 ? (
        <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-sm font-bold tabular-nums">
          {rest}s
        </span>
      ) : (
        <Button size="sm" variant="secondary" onClick={onDismiss}>
          <X size={14} /> {t('breaks.done')}
        </Button>
      )}
    </div>
  );
}
