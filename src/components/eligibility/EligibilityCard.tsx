import { Check, ChevronRight, CircleDashed, Target } from 'lucide-react';
import type { EligibilityReport, PostStanding } from '@/core/exam/eligibility';
import { ScoringMode } from '@/core/constants';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

interface Props {
  report: EligibilityReport;
}

/**
 * "Which post could I actually clear?"
 *
 * Scoring is pure and every attempt is stored, so the whole history can be
 * re-graded against every profile — no new data, only arithmetic. It answers
 * the question aspirants genuinely agonise over, and answers it honestly:
 * cleared, one or two WPM away, or out of reach for now.
 *
 * Only attempts in a post's own language count towards it. A 45 WPM English run
 * says nothing about a Hindi Remington test, and pretending otherwise is the
 * one way a report like this could send somebody to the wrong exam.
 */
export function EligibilityCard({ report }: Props) {
  const t = useT();

  if (report.attempts === 0) {
    return (
      <Card className="space-y-1">
        <h2 className="font-semibold">{t('eligibility.title')}</h2>
        <p className="text-sm text-fg-muted">{t('eligibility.empty')}</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <Target size={16} className="shrink-0 text-fg-subtle" />
          {t('eligibility.title')}
        </h2>
        <p className="mt-0.5 text-sm text-fg-muted">
          {t('eligibility.subtitle', {
            attempts: report.attempts,
            cleared: report.cleared.length,
          })}
        </p>
      </div>

      <Group
        icon={Check}
        tone="text-accent-text"
        title={t('eligibility.cleared')}
        hint={t('eligibility.clearedHint')}
        standings={report.cleared}
        empty={t('eligibility.noneCleared')}
      />
      <Group
        icon={ChevronRight}
        tone="text-fg"
        title={t('eligibility.close')}
        hint={t('eligibility.closeHint')}
        standings={report.close}
        empty={t('eligibility.noneClose')}
      />
      <Group
        icon={CircleDashed}
        tone="text-fg-subtle"
        title={t('eligibility.far')}
        hint={t('eligibility.farHint')}
        standings={report.far}
        empty={t('eligibility.noneFar')}
        collapsed
      />
    </Card>
  );
}

function Group({
  icon: Icon,
  tone,
  title,
  hint,
  standings,
  empty,
  collapsed = false,
}: {
  icon: typeof Check;
  tone: string;
  title: string;
  hint: string;
  standings: PostStanding[];
  empty: string;
  /** Render as a compact chip list — used for the out-of-reach group. */
  collapsed?: boolean;
}) {
  const t = useT();

  return (
    <section className="space-y-2">
      <p className={`flex items-center gap-1.5 text-sm font-semibold ${tone}`}>
        <Icon size={14} className="shrink-0" />
        {title}
        <span className="font-normal text-fg-subtle">({standings.length})</span>
      </p>

      {standings.length === 0 ? (
        <p className="text-xs text-fg-muted">{empty}</p>
      ) : collapsed ? (
        <ul className="flex flex-wrap gap-1.5">
          {standings.map((standing) => (
            <li
              key={standing.board}
              title={gapLabel(standing, t)}
              className="rounded-inner bg-surface-2 px-2 py-1 text-xs text-fg-muted"
            >
              {standing.profile.name}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-1.5">
          {standings.map((standing) => (
            <li
              key={standing.board}
              className="flex flex-wrap items-center justify-between gap-2 rounded-inner border border-line px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{standing.profile.name}</p>
                <p className="truncate text-[11px] text-fg-muted">
                  {standing.repeatable
                    ? t('eligibility.repeatable', { runs: standing.clearedRuns })
                    : standing.clearedRuns > 0
                      ? t('eligibility.onceOnly', { runs: standing.clearedRuns })
                      : t('eligibility.bestSoFar', {
                          wpm: standing.bestWpm,
                          accuracy: standing.bestAccuracy,
                        })}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums">
                {gapLabel(standing, t)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-fg-subtle">{hint}</p>
    </section>
  );
}

/** The shortfall, in the post's own unit — WPM or key depressions. */
function gapLabel(standing: PostStanding, t: ReturnType<typeof useT>): string {
  const kdph = standing.profile.rules.scoringMode === ScoringMode.Kdph;
  if (standing.speedGap === 0 && standing.accuracyGap === 0) return t('eligibility.met');
  if (standing.speedGap > 0) {
    return kdph
      ? t('eligibility.kdphShort', { value: standing.speedGap.toLocaleString() })
      : t('eligibility.wpmShort', { value: standing.speedGap });
  }
  return t('eligibility.accuracyShort', { value: standing.accuracyGap });
}
