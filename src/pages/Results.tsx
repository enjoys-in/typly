import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Printer, Share2 } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import { SETTING_KEY, SERIES_ADVANCE_SECONDS, TestStatus } from '@/core/constants';
import { profileFor } from '@/core/scoring/examProfiles';
import { applyDifficulty, applyMode } from '@/core/scoring/scoring';
import { isDevanagari } from '@/core/text/scripts';
import { computeBadges, type Badge } from '@/core/achievements/badges';
import { testsToday } from '@/core/stats';
import { ResultSummary } from '@/components/result/ResultSummary';
import { MistakeList } from '@/components/result/MistakeList';
import { WpmChart } from '@/components/result/WpmChart';
import { CoachPanel } from '@/components/result/CoachPanel';
import { CertificateCard } from '@/components/result/CertificateCard';
import { CutoffCard } from '@/components/result/CutoffCard';
import { ReplayPlayer } from '@/components/result/ReplayPlayer';
import { useAsync } from '@/hooks/useAsync';
import { HindiFont } from '@/core/constants';
import { FONT_FAMILY } from '@/ui/fonts';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';

export function Results() {
  const navigate = useNavigate();
  const platform = usePlatform();
  const finished = useExamStore((s) => s.finished);
  const config = useExamStore((s) => s.config);
  const series = useExamStore((s) => s.series);
  const advanceSeries = useExamStore((s) => s.advanceSeries);
  const clearSeries = useExamStore((s) => s.clearSeries);
  const notify = useSettingsStore((s) => s.notify);
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const hindiFont = useSettingsStore((s) => s.hindiFont);

  const hasNext = !!series && series.index + 1 < series.items.length;
  const [countdown, setCountdown] = useState(SERIES_ADVANCE_SECONDS);
  const [unlocked, setUnlocked] = useState<Badge[]>([]);
  const [goalHit, setGoalHit] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const rewardsDone = useRef(false);

  const board = finished?.payload.examBoard;
  const savedId = finished?.savedId ?? null;
  // The rules this run was graded against — difficulty and mode included.
  const rules = useMemo(() => {
    if (!board) return null;
    const base = profileFor(board).rules;
    return config ? applyMode(applyDifficulty(base, config.difficulty), config.examMode) : base;
  }, [board, config]);

  // Earlier attempts, so the score can be ranked against the user's own runs.
  const priorWpm = useAsync(async () => {
    const rows = await platform.repo.listHistory();
    return rows.filter((row) => row.id !== savedId && row.netWpm > 0).map((row) => row.netWpm);
  }, [platform, savedId]);

  useEffect(() => {
    if (!finished) navigate('/app', { replace: true });
  }, [finished, navigate]);

  // Auto-advance to the next test in a series once the countdown elapses.
  useEffect(() => {
    if (!finished || !hasNext) return;
    setCountdown(SERIES_ADVANCE_SECONDS);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          if (advanceSeries()) navigate('/app/exam');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [finished, hasNext, advanceSeries, navigate]);

  // Detect newly earned badges and a reached daily goal, then celebrate + notify once.
  useEffect(() => {
    if (!finished || rewardsDone.current) return;
    rewardsDone.current = true;
    void (async () => {
      const rows = await platform.repo.listHistory();
      const badges = computeBadges(rows);
      const earnedNow = badges.filter((b) => b.earned).map((b) => b.id);
      let prev: string[] = [];
      try {
        prev = JSON.parse((await platform.repo.getSetting(SETTING_KEY.NotifiedBadges)) ?? '[]');
      } catch {
        prev = [];
      }
      const fresh = badges.filter((b) => b.earned && !prev.includes(b.id));
      if (fresh.length) {
        setUnlocked(fresh);
        if (notify)
          platform.notifications.notify(
            `Achievement unlocked 🏅`,
            fresh.map((b) => b.label).join(', '),
          );
        await platform.repo.setSetting(SETTING_KEY.NotifiedBadges, JSON.stringify(earnedNow));
      }
      const today = testsToday(rows);
      if (dailyGoal > 0 && today >= dailyGoal) {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if ((await platform.repo.getSetting('goalNotifiedDate')) !== todayStr) {
          setGoalHit(true);
          if (notify)
            platform.notifications.notify('Daily goal reached 🎯', `You completed ${today} tests today.`);
          await platform.repo.setSetting('goalNotifiedDate', todayStr);
        }
      }
    })();
  }, [finished, platform, notify, dailyGoal]);

  if (!finished) return null;

  function again() {
    clearSeries();
    // setConfig (in the setup step) clears `finished`; navigating first avoids
    // the redirect race from this page's own not-finished guard.
    navigate('/app/new');
  }

  function skipNext() {
    if (advanceSeries()) navigate('/app/exam');
  }

  function printReport() {
    window.print();
  }

  async function shareResult() {
    const r = finished!.result;
    const text = `I scored ${r.netWpm} net WPM at ${r.accuracy}% accuracy on Typly.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Typly result', text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShareNote('Copied to clipboard');
      }
    } catch {
      // user dismissed the share sheet
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Result</h1>
        {series && (
          <span className="rounded-full bg-surface-3 px-3 py-1 text-xs font-semibold text-fg-muted">
            Series · test {series.index + 1} of {series.items.length}
          </span>
        )}
      </div>

      {(goalHit || unlocked.length > 0) && (
        <Card className="space-y-2 border-accent-border bg-accent-soft">
          {goalHit && (
            <p className="text-sm font-semibold text-fg">
              🎯 Daily goal reached — great consistency!
            </p>
          )}
          {unlocked.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-fg">
                🏅 New achievement{unlocked.length > 1 ? 's' : ''}:
              </span>
              {unlocked.map((b) => (
                <span
                  key={b.id}
                  className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold"
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {hasNext && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-accent-border bg-accent-soft">
          <p className="text-sm font-medium text-fg">
            Next test starts in <span className="tabular-nums">{countdown}</span>s…
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={skipNext}>
              Start now
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSeries}>
              Stop series
            </Button>
          </div>
        </Card>
      )}

      <div id="print-area">
        <div className="mb-4 hidden print:block">
          <h2 className="text-xl font-bold">Typly — Typing Result</h2>
          <p className="text-sm">
            {profileFor(finished.payload.examBoard).name} ·{' '}
            {format(new Date(finished.payload.createdAt), 'dd MMM yyyy, HH:mm')}
          </p>
        </div>
        <Card>
          <ResultSummary result={finished.result} durationSec={finished.payload.durationSec} />
        </Card>
      </div>
      {finished.result.status === TestStatus.Passed && <CertificateCard finished={finished} />}
      <Card className="space-y-3">
        <h2 className="font-semibold">Speed &amp; accuracy over time</h2>
        <WpmChart timeline={finished.payload.timeline} />
      </Card>
      {rules && (
        <CutoffCard
          result={finished.result}
          rules={rules}
          examName={profileFor(finished.payload.examBoard).name}
          history={priorWpm.data ?? []}
        />
      )}
      <Card className="space-y-3">
        <h2 className="font-semibold">Mistakes</h2>
        <MistakeList mistakes={finished.mistakes} />
      </Card>
      {finished.payload.keystrokes.length > 0 && config && (
        <Card className="space-y-3">
          <h2 className="font-semibold">Replay</h2>
          <p className="text-sm text-fg-muted">
            Watch the attempt back to see where the time went, not just where the errors were.
          </p>
          <ReplayPlayer
            passage={config.passage}
            keystrokes={finished.payload.keystrokes}
            fontFamily={
              isDevanagari(finished.payload.lang) && hindiFont !== HindiFont.System
                ? FONT_FAMILY[hindiFont]
                : undefined
            }
          />
        </Card>
      )}
      <CoachPanel finished={finished} />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={again}>New test</Button>
        <Button variant="secondary" onClick={() => navigate('/app/history')}>
          View history
        </Button>
        <Button variant="ghost" onClick={printReport}>
          <Printer size={16} /> Print
        </Button>
        <Button variant="ghost" onClick={shareResult}>
          <Share2 size={16} /> Share
        </Button>
        {shareNote && <span className="text-xs text-fg-muted">{shareNote}</span>}
      </div>
    </div>
  );
}
