import { Fragment, useMemo } from 'react';
import { evaluate, type CharState } from '@/core/typing/typingEngine';
import { useT } from '@/i18n';

// Panel-tinted variant of the exam palette (PassageView colors don't read on a
// gradient surface). Same three states, same meaning.
const STATE_CLASS: Record<CharState, string> = {
  untyped: 'text-white/45',
  correct: 'text-white',
  incorrect: 'rounded-inner bg-[color-mix(in_oklab,var(--brand-accent-from)_80%,transparent)] text-black',
};

interface Props {
  passage: string;
  typed: string;
}

/** Static, non-interactive sample of the exam view — shows what scoring looks like. */
export function TypingPreview({ passage, typed }: Props) {
  const t = useT();
  const states = useMemo(() => evaluate(passage, typed).states, [passage, typed]);

  return (
    <div className="rounded-panel border border-white/15 bg-black/20 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[var(--brand-accent-from)]" />
        <span className="text-[11px] font-semibold tracking-wide text-white/60 uppercase">
          {t('landing.liveScoring')}
        </span>
      </div>
      <p className="font-mono text-sm leading-relaxed break-words select-none">
        {passage.split('').map((ch, i) => (
          <Fragment key={i}>
            {i === typed.length && <Caret />}
            <span className={STATE_CLASS[states[i] ?? 'untyped']}>{ch}</span>
          </Fragment>
        ))}
        {typed.length >= passage.length && <Caret />}
      </p>
    </div>
  );
}

function Caret() {
  return (
    <span className="caret mx-px inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-white/90" />
  );
}
