import { Ghost, User } from 'lucide-react';
import { ghostCharsAt, type GhostPoint } from '@/core/typing/replay';

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
  const ghostChars = ghostCharsAt(track, elapsedMs);
  const lead = typedChars - ghostChars;
  const pct = (chars: number) => (passageLength ? Math.min(100, (chars / passageLength) * 100) : 0);

  return (
    <div className="space-y-2 rounded-panel border border-line bg-surface px-4 py-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold tracking-wide text-fg-muted uppercase">Ghost race</span>
        <span
          className={`font-semibold tabular-nums ${
            lead >= 0 ? 'text-accent-text' : 'text-danger-text'
          }`}
        >
          {lead >= 0 ? `+${lead}` : lead} chars
        </span>
      </div>
      <Lane
        icon={User}
        label="You"
        pct={pct(typedChars)}
        chars={typedChars}
        tone="bg-accent"
      />
      <Lane
        icon={Ghost}
        label={`Best · ${ghostWpm} WPM`}
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
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
        <span className={`block h-full rounded-full transition-all ${tone}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-fg-subtle">
        {chars}
      </span>
    </div>
  );
}
