import { Ghost, User } from 'lucide-react';
import { ghostCharsAt, type GhostPoint } from '@/core/typing/replay';
import { useT } from '@/i18n';

interface Props {
  track: GhostPoint[];
  elapsedMs: number;
  typedChars: number;
  passageLength: number;
  /** Net WPM of the run being raced, for the label. */
  ghostWpm: number;
}

/**
 * Live race against a past run: two progress lanes on the same passage. Seeing
 * the gap is what makes a personal best something to chase mid-test.
 */
export function GhostBar({ track, elapsedMs, typedChars, passageLength, ghostWpm }: Props) {
  const t = useT();
  const ghostChars = ghostCharsAt(track, elapsedMs);
  const lead = typedChars - ghostChars;
  const pct = (chars: number) => (passageLength ? Math.min(100, (chars / passageLength) * 100) : 0);

  return (
    <div className="panel-lit shrink-0 space-y-2 rounded-panel border border-line bg-surface px-4 py-3 shadow-e1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold tracking-[0.09em] text-fg-muted uppercase">
          {t('ghost.title')}
        </span>
        <span
          className={`font-semibold tabular-nums ${
            lead >= 0 ? 'text-accent-text' : 'text-danger-text'
          }`}
        >
          {t('ghost.chars', { value: lead >= 0 ? `+${lead}` : lead })}
        </span>
      </div>
      <Lane
        icon={User}
        label={t('ghost.you')}
        pct={pct(typedChars)}
        chars={typedChars}
        tone="bg-accent"
      />
      <Lane
        icon={Ghost}
        label={t('ghost.best', { wpm: ghostWpm })}
        pct={pct(ghostChars)}
        chars={ghostChars}
        tone="bg-fg-subtle"
      />
    </div>
  );
}

function Lane({
  icon: Icon,
  label,
  pct,
  chars,
  tone,
}: {
  icon: typeof Ghost;
  label: string;
  pct: number;
  chars: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-32 shrink-0 items-center gap-1.5 text-[11px] text-fg-muted">
        <Icon size={12} className="shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3 ring-1 ring-line ring-inset">
        <span
          className={`block h-full rounded-full transition-[width] duration-300 ease-out ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-fg-subtle">
        {chars}
      </span>
    </div>
  );
}
