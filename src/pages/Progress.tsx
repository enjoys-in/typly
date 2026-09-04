import { useEffect, useMemo, useState } from 'react';
import { Award, Flame, Lock, Medal, Sparkles, Target, Trophy } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useSettingsStore } from '@/store/settingsStore';
import type { TestRow } from '@/core/types';
import { TestStatus } from '@/core/constants';
import { profileFor } from '@/core/scoring/examProfiles';
import {
  currentStreak,
  realAttempts,
  testsThisMonth,
  testsThisWeek,
  testsToday,
  totalPoints,
} from '@/core/stats';
import { computeBadges } from '@/core/achievements/badges';
import { monthlyRecap } from '@/core/achievements/recap';
import { eligibility } from '@/core/exam/eligibility';
import { fatigueCurve, longitudinalKeys } from '@/core/analysis/longitudinal';
import { KEYSTROKE_SCAN_TESTS } from '@/core/constants';
import { useAsync } from '@/hooks/useAsync';
import { LongitudinalHeatmap } from '@/components/analysis/LongitudinalHeatmap';
import { FatigueCurveCard } from '@/components/analysis/FatigueCurveCard';
import { EligibilityCard } from '@/components/eligibility/EligibilityCard';
import { RecapCard } from '@/components/achievements/RecapCard';
import { Card } from '@/ui/Card';
import { ProgressBar } from '@/ui/ProgressBar';
import { Skeleton, SkeletonCard } from '@/ui/Skeleton';
import { Stat } from '@/ui/Stat';
import { useT } from '@/i18n';
import { useDateFormat } from '@/hooks/useDateFormat';

export function Progress() {
  const platform = usePlatform();
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const [rows, setRows] = useState<TestRow[] | null>(null);
  const t = useT();

  useEffect(() => {
    platform.repo.listHistory().then(setRows);
  }, [platform]);

  // Recent attempts as summaries — mistakes and the stored per-minute timeline,
  // no keystroke logs — for the two readings that need history rather than one
  // attempt. Capped so this never turns into reading the whole database.
  const recent = useAsync(
    () => platform.repo.recentSummaries(KEYSTROKE_SCAN_TESTS * 3),
    [platform],
  );

  const overTime = useMemo(() => {
    const results = recent.data;
    if (!results || results.length === 0) return null;
    return { keys: longitudinalKeys(results), fatigue: fatigueCurve(results) };
  }, [recent.data]);

  // Two whole-history readings. Both are pure arithmetic over rows already
  // loaded, so they cost nothing beyond the memo.
  const posts = useMemo(() => (rows ? eligibility(rows) : null), [rows]);
  const recap = useMemo(() => (rows ? monthlyRecap(rows) : null), [rows]);

  const stats = useMemo(() => {
    if (!rows) return null;
    const real = realAttempts(rows);
    if (real.length === 0) return null;
    const bestWpm = Math.max(...real.map((r) => r.netWpm));
    const avgWpm = Math.round(real.reduce((s, r) => s + r.netWpm, 0) / real.length);
    const avgAcc = Math.round(real.reduce((s, r) => s + r.accuracy, 0) / real.length);
    const passed = real.filter((r) => r.status === TestStatus.Passed).length;
    const recent = [...real]
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
      .slice(-15);
    return {
      total: real.length,
      bestWpm,
      avgWpm,
      avgAcc,
      passRate: Math.round((passed / real.length) * 100),
      streak: currentStreak(real),
      today: testsToday(real),
      week: testsThisWeek(real),
      month: testsThisMonth(real),
      points: totalPoints(real),
      badges: computeBadges(real),
      topRuns: [...real].sort((a, b) => b.netWpm - a.netWpm).slice(0, 10),
      recent,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('progress.title')}</h1>
        <p className="mt-1 text-fg-muted">{t('progress.subtitle')}</p>
      </div>

      {rows === null ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="rounded-panel border border-line bg-surface p-4">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="mt-3 h-6 w-14" />
              </div>
            ))}
          </div>
          <SkeletonCard lines={4} />
        </>
      ) : !stats ? (
        <Card>
          <p className="text-sm text-fg-muted">{t('progress.emptyLong')}</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Highlight
              icon={Trophy}
              tint="primary"
              label={t('progress.bestWpm')}
              value={String(stats.bestWpm)}
            />
            <Highlight
              icon={Flame}
              tint="secondary"
              label={t('progress.dayStreak')}
              value={String(stats.streak)}
            />
            <Highlight
              icon={Sparkles}
              tint="primary"
              label={t('dashboard.points')}
              value={String(stats.points)}
            />
            <Highlight
              icon={Target}
              tint="secondary"
              label={t('progress.passRate')}
              value={`${stats.passRate}%`}
            />
          </div>

          <Card className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat label={t('progress.testsTaken')} value={String(stats.total)} />
            <Stat label={t('progress.avgWpm')} value={String(stats.avgWpm)} />
            <Stat label={t('progress.avgAccuracy')} value={`${stats.avgAcc}%`} />
            <Stat label={t('progress.bestWpm')} value={String(stats.bestWpm)} accent />
          </Card>

          <Card className="space-y-4">
            <h2 className="font-semibold">{t('progress.recentSpeed')}</h2>
            <WpmBars rows={stats.recent} max={stats.bestWpm} />
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t('progress.dailyGoal')}</h2>
              <span className="text-sm tabular-nums text-fg-muted">
                {t('progress.goalCount', { done: Math.min(stats.today, dailyGoal), goal: dailyGoal })}
              </span>
            </div>
            <ProgressBar value={dailyGoal > 0 ? (stats.today / dailyGoal) * 100 : 0} />
            <p className="text-xs text-fg-muted">
              {stats.today >= dailyGoal
                ? t('progress.goalDone')
                : t('progress.goalLeft', { count: dailyGoal - stats.today })}
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-semibold">{t('progress.challenges')}</h2>
            <ChallengeRow
              label={t('progress.thisWeek')}
              done={stats.week}
              target={Math.max(1, dailyGoal * 5)}
            />
            <ChallengeRow
              label={t('progress.thisMonth')}
              done={stats.month}
              target={Math.max(1, dailyGoal * 20)}
            />
          </Card>

          {/* The reward ladder, extended: badges run out inside a fortnight,
              a monthly recap has as many rungs as there are months. */}
          {recap && <RecapCard recap={recap} />}

          <Card className="space-y-4">
            <h2 className="font-semibold">{t('progress.badgesTitle')}</h2>
            <BadgeGrid badges={stats.badges} />
          </Card>

          {/* The whole history, re-scored against every profile — the question
              aspirants actually agonise over. */}
          {posts && <EligibilityCard report={posts} />}

          {overTime && (
            <>
              <LongitudinalHeatmap data={overTime.keys} />
              <FatigueCurveCard curve={overTime.fatigue} />
            </>
          )}

          <Card className="space-y-3">
            <h2 className="font-semibold">{t('progress.topRunsTitle')}</h2>
            <Leaderboard runs={stats.topRuns} />
          </Card>
        </>
      )}
    </div>
  );
}

const RANK_TINT = ['text-amber-500', 'text-slate-400', 'text-orange-500'];

function Leaderboard({ runs }: { runs: TestRow[] }) {
  const d = useDateFormat();
  return (
    <ol>
      {runs.map((r, i) => (
        <li
          key={r.id}
          className="flex items-center gap-3 border-b border-line py-2 tabular-nums last:border-0"
        >
          <span className={`w-8 text-center text-sm font-bold ${i < 3 ? RANK_TINT[i] : 'text-fg-subtle'}`}>
            {i < 3 ? <Medal size={16} className="inline" /> : `#${i + 1}`}
          </span>
          <span className="w-14 text-lg font-bold text-accent-text">{r.netWpm}</span>
          <span className="hidden w-14 text-sm text-fg-muted sm:inline">{r.accuracy}%</span>
          <span className="flex-1 truncate text-sm">{profileFor(r.examBoard).name}</span>
          <span className="text-xs text-fg-subtle">{d.dateShort(r.createdAt)}</span>
        </li>
      ))}
    </ol>
  );
}

function ChallengeRow({ label, done, target }: { label: string; done: number; target: number }) {
  const t = useT();
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-fg-muted">
          {t('progress.goalCount', { done: Math.min(done, target), goal: target })}
        </span>
      </div>
      <ProgressBar value={Math.min(100, (done / target) * 100)} />
      {done >= target && <p className="text-xs text-accent-text">{t('progress.challengeDone')}</p>}
    </div>
  );
}

function BadgeGrid({ badges }: { badges: ReturnType<typeof computeBadges> }) {
  const t = useT();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {badges.map((b) => (
        <div
          key={b.id}
          title={t(`badge.${b.id}.desc`)}
          className={`flex flex-col items-center gap-2 rounded-panel border p-3 text-center ${
            b.earned
              ? 'border-accent-soft bg-accent-soft text-accent-soft-fg'
              : 'border-line bg-surface-2 text-fg-subtle'
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
            {b.earned ? <Award size={18} /> : <Lock size={16} />}
          </span>
          <span className="text-xs font-semibold leading-tight">{t(`badge.${b.id}`)}</span>
        </div>
      ))}
    </div>
  );
}

// Decorative alternating tints for the highlight tiles — both are positive
// stats, so neither uses the danger role.
const TINT = {
  primary: 'bg-accent-soft text-accent-soft-fg',
  secondary: 'bg-accent2-soft text-accent2-soft-fg',
} as const;

function Highlight({
  icon: Icon,
  tint,
  label,
  value,
}: {
  icon: typeof Trophy;
  tint: keyof typeof TINT;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-3">
      <span className={`flex h-10 w-10 items-center justify-center rounded-panel ${TINT[tint]}`}>
        <Icon size={20} />
      </span>
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-fg-muted">{label}</span>
        <span className="text-xl font-bold tabular-nums">{value}</span>
      </div>
    </Card>
  );
}

function WpmBars({ rows, max }: { rows: TestRow[]; max: number }) {
  const t = useT();
  const scale = Math.max(max, 1);
  return (
    <div>
      <div className="flex justify-between text-[10px] text-fg-subtle">
        <span>{t('chart.netWpm')}</span>
        <span className="tabular-nums">{t('chart.peak', { value: max })}</span>
      </div>
      {/* Fixed-height track so each bar's percentage height resolves correctly. */}
      <div className="mt-1 flex h-44 items-end justify-center gap-2 border-b border-line">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex h-full max-w-12 flex-1 flex-col justify-end"
            title={`${r.netWpm} WPM`}
          >
            <div
              className="w-full rounded-t bg-accent transition-[height] duration-300"
              style={{ height: `${Math.max(4, Math.round((r.netWpm / scale) * 100))}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-center gap-2">
        {rows.map((r) => (
          <span
            key={r.id}
            className="max-w-12 flex-1 text-center text-[10px] tabular-nums text-fg-subtle"
          >
            {r.netWpm}
          </span>
        ))}
      </div>
    </div>
  );
}
