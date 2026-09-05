import { memo } from 'react';
import { Flag, User } from 'lucide-react';
import type { ScoringRules } from '@/core/types';
import { pacerState } from '@/core/exam/pacer';
import { useT } from '@/i18n';

interface Props {
  rules: ScoringRules;
  elapsedMs: number;
  typedChars: number;
  passageLength: number;
}

/**
 * A marker moving at exactly the exam's cut-off speed.
 *
 * The ghost race asks "am I beating last Tuesday". This asks the only question
 * the exam asks — am I above the pass line right now — and it needs no prior
 * attempt, so it works from the very first run.
 *
 * Memoized on its inputs: the exam re-renders on every keystroke, and this
 * only changes when the clock or the character count does.
 */
export const PacerBar = memo(function PacerBar({
  rules,
  elapsedMs,
  typedChars,
  passageLength,
}: Props) {
  const t = useT();
  const state = pacerState(rules, elapsedMs, typedChars, passageLength);

  return (
    <div className="panel-lit shrink-0 space-y-2 rounded-panel border border-line bg-surface px-4 py-3 shadow-e1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold tracking-[0.09em] text-fg-muted uppercase">
          {t('pacer.title', { wpm: state.targetWpm })}
        </span>
        <span
          className={`font-semibold tabular-nums ${
            state.passing ? 'text-accent-text' : 'text-danger-text'
          }`}
        >
          {state.passing
            ? t('pacer.ahead', { seconds: state.leadSeconds })
            : t('pacer.behind', { seconds: Math.abs(state.leadSeconds) })}
        </span>
      </div>

      <Lane
        icon={User}
        label={t('pacer.you')}
        pct={state.typedPct}
        chars={state.typedChars}
        tone={state.passing ? 'bg-accent' : 'bg-danger'}
      />
      <Lane
        icon={Flag}
        label={t('pacer.cutoff', { wpm: state.targetWpm })}
        pct={state.pacerPct}
        chars={state.pacerChars}
        tone="bg-fg-subtle"
      />

      <p className="text-[11px] text-fg-subtle">
        {state.passing ? t('pacer.hintAhead') : t('pacer.hintBehind')}
      </p>
    </div>
  );
});

function Lane({
  icon: Icon,
  label,
  pct,
  chars,
  tone,
}: {
  icon: typeof Flag;
  label: string;
  pct: number;
  chars: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-36 shrink-0 items-center gap-1.5 text-[11px] text-fg-muted">
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
