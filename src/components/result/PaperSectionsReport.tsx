import { CheckCircle2, Layers, XCircle } from 'lucide-react';
import type { PaperReportSummary } from '@/core/exam/paper';
import { LANG_LABEL } from '@/core/constants';
import { Card } from '@/ui/Card';
import { Stat } from '@/ui/Stat';
import { useT } from '@/i18n';

interface Props {
  summary: PaperReportSummary;
  /** False while sections are still to come, so the verdict waits. */
  complete: boolean;
}

/**
 * The combined report for a multi-section paper.
 *
 * A paper is marked the way the exam marks it: every section has to clear its
 * own cut-off, so an average that looks fine can still be a fail. Showing the
 * average *and* the weakest section is the honest reading, and the weakest
 * section is what tells the candidate which language to go and drill.
 */
export function PaperSectionsReport({ summary, complete }: Props) {
  const t = useT();

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <Layers size={16} className="shrink-0 text-fg-subtle" />
          {t('paper.reportTitle')}
        </h2>
        <p className="mt-0.5 text-sm text-fg-muted">
          {!complete
            ? t('paper.incomplete')
            : summary.cleared
              ? t('paper.cleared')
              : t('paper.notCleared', { section: summary.weakest?.title ?? '' })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Stat
          label={t('paper.average')}
          value={String(summary.averageNet)}
          hint="net WPM"
          accent={summary.cleared}
        />
        <Stat label={t('dashboard.accuracy')} value={`${summary.averageAccuracy}%`} />
      </div>

      <ul className="space-y-1.5 border-t border-line pt-4">
        {summary.sections.map((section, index) => (
          <li
            key={`${section.title}-${index}`}
            className="flex flex-wrap items-center justify-between gap-2 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              {section.passed ? (
                <CheckCircle2 size={15} className="shrink-0 text-accent-text" />
              ) : (
                <XCircle size={15} className="shrink-0 text-danger-text" />
              )}
              <span className="truncate">{section.title}</span>
              <span className="shrink-0 text-[11px] text-fg-subtle">
                {LANG_LABEL[section.lang]}
              </span>
            </span>
            <span className="shrink-0 tabular-nums">
              <span className="font-semibold">{section.netWpm}</span>
              <span className="text-fg-muted"> WPM · {section.accuracy}%</span>
              <span className="ml-2 text-[11px] text-fg-subtle">
                {t('paper.section')} {t('stats.target', { value: section.profile.rules.minWpm })}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
