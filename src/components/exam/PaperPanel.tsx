import { ScanLine } from 'lucide-react';
import { LANG_LABEL } from '@/core/constants';
import type { Lang } from '@/core/constants';
import { isLatin } from '@/core/text/scripts';
import { useT } from '@/i18n';

interface Props {
  lang: Lang;
}

/**
 * The one-line header of a paper run.
 *
 * This used to be a full-height panel standing where the passage would be: a
 * heading, a paragraph, three big counters and a footnote about scoring. All of
 * it was true and none of it was needed after the first ten seconds — the
 * passage is on the desk, the candidate is looking down at it, and the panel
 * was holding two thirds of the screen to explain that. Meanwhile the field
 * they were actually typing into was four lines tall.
 *
 * So it collapsed to a strip. The explanation survives as its tooltip, where
 * someone who wants it can still find it, and the height it was using goes to
 * the field — which in paper mode is the entire point of the screen.
 */
export function PaperPanel({ lang }: Props) {
  const t = useT();
  // Spelling and grammar are dictionary-driven, and only English ships one.
  const checkable = isLatin(lang);

  return (
    <div
      title={
        checkable
          ? t('paper.scoredHint')
          : t('paper.scoredHintNoDict', { lang: LANG_LABEL[lang] })
      }
      className="flex shrink-0 items-center gap-2.5 rounded-control border border-line bg-surface-2 px-3 py-2"
    >
      <ScanLine size={15} className="shrink-0 text-accent-text" />
      <p className="min-w-0 truncate text-xs font-semibold">{t('paper.heading')}</p>
      <p className="hidden min-w-0 truncate text-xs text-fg-muted sm:block">{t('paper.body')}</p>
    </div>
  );
}
