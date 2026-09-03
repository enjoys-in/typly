import { FileText, ScanLine, SpellCheck, Undo2 } from 'lucide-react';
import { LANG_LABEL } from '@/core/constants';
import type { Lang } from '@/core/constants';
import { isLatin } from '@/core/text/scripts';

interface Props {
  lang: Lang;
  words: number;
  chars: number;
  backspaces: number;
}

/**
 * Stands in for the passage when there is nothing to show: the text is on paper
 * in front of the typist. It says what is being measured, because without a
 * passage on screen the scoring is not self-evident.
 */
export function PaperPanel({ lang, words, chars, backspaces }: Props) {
  // Spelling and grammar are dictionary-driven, and only English ships one.
  const checkable = isLatin(lang);

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-between gap-6 rounded-panel border border-line bg-surface p-6">
      <div className="flex items-start gap-3">
        <span className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-white">
          <ScanLine size={20} />
        </span>
        <div>
          <h2 className="text-base font-semibold">Type from your paper</h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">
            There is no passage on screen — read from the sheet in front of you and type it below.
            The clock started with your first keystroke.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Count icon={FileText} label="Words" value={words} />
        <Count icon={SpellCheck} label="Characters" value={chars} />
        <Count icon={Undo2} label="Corrections" value={backspaces} />
      </div>

      <div className="space-y-1.5 border-t border-line pt-4 text-xs text-fg-muted">
        <p className="font-semibold tracking-wide uppercase">Scored on</p>
        <p className="leading-relaxed">
          Words and speed from what you type, corrections from your backspaces, and mistakes from{' '}
          {checkable
            ? 'the dictionary and grammar check.'
            : `spelling — not available for ${LANG_LABEL[lang]}, so only words, speed and corrections are measured.`}
        </p>
      </div>
    </div>
  );
}

function Count({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-fg-muted uppercase">
        <Icon size={13} className="shrink-0" />
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
