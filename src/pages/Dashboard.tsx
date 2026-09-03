import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Crosshair,
  Dumbbell,
  History as HistoryIcon,
  PlusCircle,
  ScanLine,
  type LucideIcon,
} from 'lucide-react';
import { appConfig } from '@/config/appConfig';
import { usePlatform } from '@/platform/PlatformContext';
import { useAuthStore } from '@/store/authStore';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAsync } from '@/hooks/useAsync';
import { usePaperRun } from '@/hooks/usePaperRun';
import { clearExamSnapshot, readExamSnapshot } from '@/hooks/useExamSnapshot';
import { readSampleDocument, seedSampleLibrary } from '@/hooks/useSampleLibrary';
import { profileFor } from '@/core/scoring/examProfiles';
import { weakKeys } from '@/core/analysis/analysis';
import { currentStreak, realAttempts, testsToday, totalPoints, wpmAverages } from '@/core/stats';
import { TestStatus } from '@/core/constants';
import { firstName } from '@/core/profile/profile';
import { greetingFor } from '@/core/profile/greeting';
import { useT } from '@/i18n';
import { useDateFormat } from '@/hooks/useDateFormat';
import { GoalCard } from '@/components/dashboard/GoalCard';
import { ResumeCard } from '@/components/dashboard/ResumeCard';
import { SampleCard } from '@/components/dashboard/SampleCard';
import { WpmAveragesCard } from '@/components/dashboard/WpmAveragesCard';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Stat } from '@/ui/Stat';
import { SkeletonCard } from '@/ui/Skeleton';

export function Dashboard() {
  const navigate = useNavigate();
  const platform = usePlatform();
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const resumeFrom = useExamStore((s) => s.resumeFrom);
  const setDraft = useExamStore((s) => s.setDraft);
  const account = useAuthStore((s) => s.account);
  const t = useT();
  const d = useDateFormat();
  const startPaperRun = usePaperRun();
  const Logo = appConfig.logo;

  const overview = useAsync(async () => {
    // Shares the boot hook's single seeding run, so the demo paragraph is
    // already there on a first ever load rather than after a refresh.
    await seedSampleLibrary(platform.repo);
    return {
      rows: await platform.repo.listHistory(),
      mistakes: await platform.repo.aggregateMistakes(),
      snapshot: await readExamSnapshot(platform.repo),
      sample: await readSampleDocument(platform.repo),
    };
  }, [platform]);

  const summary = useMemo(() => {
    if (!overview.data) return null;
    const real = realAttempts(overview.data.rows);
    if (real.length === 0) return null;
    const last = real[0]!; // listHistory is newest-first
    return {
      count: real.length,
      last,
      bestWpm: Math.max(...real.map((r) => r.netWpm)),
      avgAccuracy: Math.round(real.reduce((sum, r) => sum + r.accuracy, 0) / real.length),
      points: totalPoints(real),
      averages: wpmAverages(overview.data.rows),
      streak: currentStreak(real),
      today: testsToday(real),
      weakest: weakKeys(overview.data.mistakes, 5),
    };
  }, [overview.data]);

  const snapshot = overview.data?.snapshot ?? null;
  const sample = overview.data?.sample ?? null;

  // Greet by name only when there is one, so an account saved before profiles
  // existed sees exactly the hero it saw before.
  const who = firstName(account?.name ?? '');
  const greeting = useMemo(
    () => greetingFor(new Date(), overview.data?.rows[0]?.createdAt ?? null),
    [overview.data],
  );
  const greetingLine = greeting.returning
    ? t('greeting.returning')
    : t(`greeting.${greeting.daypart}`);

  function startSample() {
    if (!sample) return;
    setDraft({
      passage: sample.content,
      title: sample.title,
      documentId: sample.id,
      sourceType: sample.sourceType,
      lang: sample.lang,
    });
    navigate('/app/setup');
  }

  function resume() {
    if (!snapshot) return;
    resumeFrom(snapshot);
    navigate('/app/exam');
  }

  async function discard() {
    await clearExamSnapshot(platform.repo);
    overview.reload();
  }

  return (
    <div className="space-y-7">
      {/* Home hero — same brand mesh as the landing screen, contained as a card. */}
      <section className="brand-mesh-band brand-grid relative overflow-hidden rounded-panel p-7 text-white shadow-sm sm:p-8">
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-control bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <Logo size={18} />
          </span>
          <span className="text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase">
            {appConfig.name}
          </span>
        </div>
        {/* Two headings on one line: what the page is, and who it is for. The
            greeting sits opposite the title and reads as its equal — it is the
            first thing a returning user looks at. It wraps under the title on
            narrow windows rather than shrinking. */}
        <div className="relative mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/75">
              {t('dashboard.tagline')}
            </p>
          </div>
          {who && (
            <p
              className="min-w-0 text-3xl leading-tight font-bold tracking-tight text-white/95 sm:text-[2rem] sm:text-right lg:text-4xl"
              // The name can be long; let it wrap rather than overflow the band.
              style={{ overflowWrap: 'anywhere' }}
            >
              {greetingLine},{' '}
              <span className="brand-hero-name whitespace-nowrap">{who}</span>
            </p>
          )}
        </div>
      </section>

      {snapshot && <ResumeCard snapshot={snapshot} onResume={resume} onDiscard={() => void discard()} />}

      {overview.loading ? (
        <SkeletonCard lines={3} />
      ) : summary ? (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <GoalCard today={summary.today} goal={dailyGoal} streak={summary.streak} />
            <Card className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-2">
              <Stat label={t('dashboard.bestWpm')} value={String(summary.bestWpm)} accent />
              <Stat label={t('dashboard.avgAccuracy')} value={`${summary.avgAccuracy}%`} />
              <Stat label={t('dashboard.tests')} value={String(summary.count)} />
              <Stat label={t('dashboard.points')} value={String(summary.points)} />
            </Card>
          </div>

          <WpmAveragesCard averages={summary.averages} />

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="space-y-3">
              <h2 className="text-base font-semibold">{t('dashboard.lastTest')}</h2>
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{profileFor(summary.last.examBoard).name}</p>
                  <p className="text-xs text-fg-muted">
                    {d.dateTime(summary.last.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    summary.last.status === TestStatus.Passed
                      ? 'bg-accent-soft text-accent-soft-fg'
                      : 'bg-danger-soft text-danger-soft-fg'
                  }`}
                >
                  {t(summary.last.status === TestStatus.Passed ? 'dashboard.passed' : 'dashboard.failed')}
                </span>
              </div>
              <div className="flex gap-6 border-t border-line pt-3">
                <Stat label={t('dashboard.netWpm')} value={String(summary.last.netWpm)} accent />
                <Stat label={t('dashboard.accuracy')} value={`${summary.last.accuracy}%`} />
                <Stat label={t('dashboard.errors')} value={String(summary.last.errors)} />
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/app/history')}>
                <HistoryIcon size={14} /> {t('dashboard.allResults')}
              </Button>
            </Card>

            <Card className="space-y-3">
              <h2 className="text-base font-semibold">{t('dashboard.weakestKeys')}</h2>
              {summary.weakest.length === 0 ? (
                <p className="text-sm text-fg-muted">
                  {t('dashboard.noMistakes')}
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {summary.weakest.map((k) => (
                      <span
                        key={k.key}
                        className="rounded-full bg-surface-2 px-3 py-1 font-mono text-sm font-semibold tabular-nums"
                      >
                        {k.key}
                        <span className="ml-2 font-sans text-xs text-fg-muted">×{k.count}</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-fg-muted">
                    {t('dashboard.trainerNote')}
                  </p>
                </>
              )}
              <Button variant="secondary" size="sm" onClick={() => navigate('/app/trainer')}>
                <Crosshair size={14} /> {t('dashboard.openTrainer')}
              </Button>
            </Card>
          </div>
        </>
      ) : (
        <>
          {sample && <SampleCard document={sample} onStart={startSample} />}
          <FlowStrip />
        </>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <ActionCard
          icon={PlusCircle}
          tone="primary"
          title={t('dashboard.newTestTitle')}
          desc={t('dashboard.newTestDesc')}
          onClick={() => navigate('/app/new')}
        />
        <ActionCard
          icon={ScanLine}
          tone="accent"
          title={t('paperCard.dashTitle')}
          desc={t('paperCard.dashDesc')}
          onClick={startPaperRun}
        />
        <ActionCard
          icon={Dumbbell}
          tone="primary"
          title={t('dashboard.practiceTitle')}
          desc={t('dashboard.practiceDesc')}
          onClick={() => navigate('/app/practice')}
        />
      </div>
    </div>
  );
}

/* Static walkthrough of the flow — shown until there is real history to report. */
const STEP_KEYS = [
  { title: 'dashboard.step1', desc: 'dashboard.step1Desc' },
  { title: 'dashboard.step2', desc: 'dashboard.step2Desc' },
  { title: 'dashboard.step3', desc: 'dashboard.step3Desc' },
] as const;

function FlowStrip() {
  const t = useT();

  return (
    <section className="rounded-panel border border-line bg-surface p-6">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">
        {t('dashboard.howItWorks')}
      </p>
      <ol className="mt-5 grid gap-6 sm:grid-cols-3">
        {STEP_KEYS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="brand-gradient-text mt-px text-sm font-bold tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="text-sm font-semibold">{t(step.title)}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{t(step.desc)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const TONE = {
  primary: { border: 'tile-primary', glow: 'tile-glow-primary', icon: 'brand-gradient' },
  accent: { border: 'tile-accent', glow: 'tile-glow-accent', icon: 'brand-accent-gradient' },
};

function ActionCard({
  icon: Icon,
  tone,
  title,
  desc,
  onClick,
}: {
  icon: LucideIcon;
  tone: keyof typeof TONE;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  const t = TONE[tone];
  return (
    <button
      onClick={onClick}
      className={`group relative flex cursor-pointer flex-col items-start overflow-hidden rounded-panel border border-line bg-surface p-6 text-left transition-colors duration-150 hover:bg-surface-2 ${t.border}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${t.glow}`}
      />
      <div className="relative flex w-full items-start justify-between">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-control text-white ${t.icon}`}
        >
          <Icon size={22} />
        </span>
        <ArrowRight
          size={18}
          className="mt-1 shrink-0 text-fg-subtle transition-colors duration-150 group-hover:text-fg-muted"
        />
      </div>
      <h2 className="relative mt-4 text-base font-semibold">{title}</h2>
      <p className="relative mt-1 text-sm leading-relaxed text-fg-muted">{desc}</p>
    </button>
  );
}
