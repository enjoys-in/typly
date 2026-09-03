import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowRight,
  Crosshair,
  Dumbbell,
  History as HistoryIcon,
  PlusCircle,
  type LucideIcon,
} from 'lucide-react';
import { appConfig } from '@/config/appConfig';
import { usePlatform } from '@/platform/PlatformContext';
import { useAuthStore } from '@/store/authStore';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAsync } from '@/hooks/useAsync';
import { clearExamSnapshot, readExamSnapshot } from '@/hooks/useExamSnapshot';
import { readSampleDocument, seedSampleLibrary } from '@/hooks/useSampleLibrary';
import { profileFor } from '@/core/scoring/examProfiles';
import { weakKeys } from '@/core/analysis/analysis';
import { currentStreak, realAttempts, testsToday, totalPoints, wpmAverages } from '@/core/stats';
import { DAYPART_GREETING, RETURNING_GREETING, TestStatus } from '@/core/constants';
import { firstName } from '@/core/profile/profile';
import { greetingFor } from '@/core/profile/greeting';
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
    ? RETURNING_GREETING
    : (DAYPART_GREETING[greeting.daypart] ?? '');

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
        {who && (
          <p className="relative mt-6 text-sm font-medium text-white/85">
            {greetingLine}, {who}
          </p>
        )}
        <h1 className={`relative text-3xl font-bold tracking-tight ${who ? 'mt-1' : 'mt-6'}`}>
          Dashboard
        </h1>
        <p className="relative mt-1.5 max-w-sm text-sm leading-relaxed text-white/75">
          Turn any image, PDF, or paragraph into a typing exam.
        </p>
      </section>

      {snapshot && <ResumeCard snapshot={snapshot} onResume={resume} onDiscard={() => void discard()} />}

      {overview.loading ? (
        <SkeletonCard lines={3} />
      ) : summary ? (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <GoalCard today={summary.today} goal={dailyGoal} streak={summary.streak} />
            <Card className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-2">
              <Stat label="Best WPM" value={String(summary.bestWpm)} accent />
              <Stat label="Avg accuracy" value={`${summary.avgAccuracy}%`} />
              <Stat label="Tests" value={String(summary.count)} />
              <Stat label="Points" value={String(summary.points)} />
            </Card>
          </div>

          <WpmAveragesCard averages={summary.averages} />

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="space-y-3">
              <h2 className="text-base font-semibold">Last test</h2>
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{profileFor(summary.last.examBoard).name}</p>
                  <p className="text-xs text-fg-muted">
                    {format(new Date(summary.last.createdAt), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    summary.last.status === TestStatus.Passed
                      ? 'bg-accent-soft text-accent-soft-fg'
                      : 'bg-danger-soft text-danger-soft-fg'
                  }`}
                >
                  {summary.last.status === TestStatus.Passed ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="flex gap-6 border-t border-line pt-3">
                <Stat label="Net WPM" value={String(summary.last.netWpm)} accent />
                <Stat label="Accuracy" value={`${summary.last.accuracy}%`} />
                <Stat label="Errors" value={String(summary.last.errors)} />
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/app/history')}>
                <HistoryIcon size={14} /> All results
              </Button>
            </Card>

            <Card className="space-y-3">
              <h2 className="text-base font-semibold">Weakest keys</h2>
              {summary.weakest.length === 0 ? (
                <p className="text-sm text-fg-muted">
                  No mistakes recorded yet — nothing to drill. Keep it that way.
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
                    The Trainer builds a drill from these, and from the transitions that cost you
                    the most time.
                  </p>
                </>
              )}
              <Button variant="secondary" size="sm" onClick={() => navigate('/app/trainer')}>
                <Crosshair size={14} /> Open Trainer
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
          title="Start a new test"
          desc="Paste text or upload an image / PDF / document."
          onClick={() => navigate('/app/new')}
        />
        <ActionCard
          icon={Dumbbell}
          tone="accent"
          title="Practice drills"
          desc="Rows, numbers, symbols and shortcuts, generated fresh."
          onClick={() => navigate('/app/practice')}
        />
      </div>
    </div>
  );
}

/* Static walkthrough of the flow — shown until there is real history to report. */
const STEPS = [
  { title: 'Add a passage', desc: 'Paste text, or drop an image, PDF or .docx.' },
  { title: 'Pick the exam', desc: 'Choose the board, duration and language.' },
  { title: 'Type & review', desc: 'WPM, accuracy, and every mistake categorised.' },
];

function FlowStrip() {
  return (
    <section className="rounded-panel border border-line bg-surface p-6">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">
        How it works
      </p>
      <ol className="mt-5 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="brand-gradient-text mt-px text-sm font-bold tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{step.desc}</p>
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
