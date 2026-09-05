import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Printer, Share2 } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ScoringMode, SETTING_KEY, SERIES_ADVANCE_SECONDS, TestStatus } from '@/core/constants';
import { profileFor, shortNameFor } from '@/core/scoring/examProfiles';
import { applyDifficulty, applyMode } from '@/core/scoring/scoring';
import { isDevanagari } from '@/core/text/scripts';
import { computeBadges, type Badge } from '@/core/achievements/badges';
import type { AdaptiveRun } from '@/core/exam/adaptive';
import { summarisePaper } from '@/core/exam/paper';
import type { Series } from '@/core/types';
import { currentStreak, testsToday } from '@/core/stats';
import { useAuthStore } from '@/store/authStore';
import { useIncomingStore } from '@/store/incomingStore';
import { ResultSummary } from '@/components/result/ResultSummary';
import { MistakeList } from '@/components/result/MistakeList';
import { WpmChart } from '@/components/result/WpmChart';
import { CoachPanel } from '@/components/result/CoachPanel';
import { CertificateCard } from '@/components/result/CertificateCard';
import { CutoffCard } from '@/components/result/CutoffCard';
import { PaperReport } from '@/components/result/PaperReport';
import { ReplayPlayer } from '@/components/result/ReplayPlayer';
import { MistakeTaxonomy } from '@/components/result/MistakeTaxonomy';
import { BackspaceCostCard } from '@/components/result/BackspaceCostCard';
import { KdphCard } from '@/components/result/KdphCard';
import { ShareCard } from '@/components/share/ShareCard';
import { ChallengeCard } from '@/components/share/ChallengeCard';
import { FingerLoadCard } from '@/components/analysis/FingerLoadCard';
import { EndlessReport } from '@/components/result/EndlessReport';
import { PaperSectionsReport } from '@/components/result/PaperSectionsReport';
import { useEndlessRun } from '@/hooks/useEndlessRun';
import { useAsync } from '@/hooks/useAsync';
import { gradeRunAgainstDeck } from '@/hooks/useReviewDeck';
import { useDateFormat } from '@/hooks/useDateFormat';
import { HindiFont } from '@/core/constants';
import { FONT_FAMILY } from '@/ui/fonts';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { translate, useT } from '@/i18n';
import { useNotify } from '@/hooks/useNotify';

/**
 * A series is a *paper* rather than a split document when its sections carry
 * their own settings — which is exactly what `paperSeries` puts on them.
 */
function isPaperSeries(series: Series): boolean {
  return series.items.some((item) => item.board !== undefined || item.lang !== undefined);
}

export function Results() {
  const t = useT();
  const d = useDateFormat();
  const navigate = useNavigate();
  const platform = usePlatform();
  const finished = useExamStore((s) => s.finished);
  const config = useExamStore((s) => s.config);
  const series = useExamStore((s) => s.series);
  const advanceSeries = useExamStore((s) => s.advanceSeries);
  const clearSeries = useExamStore((s) => s.clearSeries);
  const adaptive = useExamStore((s) => s.adaptive);
  const endAdaptive = useExamStore((s) => s.endAdaptive);
  const endless = useEndlessRun();
  const notifier = useNotify();
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const hindiFont = useSettingsStore((s) => s.hindiFont);
  const account = useAuthStore((s) => s.account);
  // Set when this run answered a challenge file, so the head-to-head can show.
  const answering = useIncomingStore((s) => s.challenge);
  // The notification is built outside render, so it translates explicitly.
  const uiLang = useSettingsStore((s) => s.uiLang);

  const hasNext = !!series && series.index + 1 < series.items.length;
  const [countdown, setCountdown] = useState(SERIES_ADVANCE_SECONDS);
  // The endless run, after this lap has been folded in. Null until it is.
  const [endlessRun, setEndlessRun] = useState<AdaptiveRun | null>(null);
  const [endlessGoing, setEndlessGoing] = useState(false);
  const endlessDone = useRef(false);
  const [unlocked, setUnlocked] = useState<Badge[]>([]);
  const [goalHit, setGoalHit] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const rewardsDone = useRef(false);
  const reviewDone = useRef(false);

  const board = finished?.payload.examBoard;
  const savedId = finished?.savedId ?? null;
  // The rules this run was graded against — difficulty and mode included.
  const rules = useMemo(() => {
    if (!board) return null;
    const base = profileFor(board).rules;
    return config ? applyMode(applyDifficulty(base, config.difficulty), config.examMode) : base;
  }, [board, config]);

  /**
   * A multi-section paper's combined report.
   *
   * The sections ran as ordinary tests, so their scores are the last N rows of
   * history — matched by order, which is safe because a series runs them in
   * order and cannot skip one. That means no extra storage for the feature.
   */
  const paperSummary = useAsync(async () => {
    if (!finished || !series || !isPaperSeries(series)) return null;
    const rows = await platform.repo.listHistory();
    const sections = series.items.map((item) => ({
      title: item.title,
      passage: item.passage,
      lang: item.lang ?? finished.payload.lang,
      durationSec: item.durationSec ?? 0,
      board: item.board ?? finished.payload.examBoard,
    }));
    // History is newest-first; the sections finished oldest-first.
    const done = rows.slice(0, series.index + 1).reverse();
    return { summary: summarisePaper(sections, done), complete: !hasNext };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, platform, savedId, finished]);

  // Earlier attempts, so the score can be ranked against the user's own runs —
  // and the streak, which the shareable card puts on the image.
  const history = useAsync(async () => {
    const rows = await platform.repo.listHistory();
    return {
      priorWpm: rows.filter((row) => row.id !== savedId && row.netWpm > 0).map((row) => row.netWpm),
      streak: currentStreak(rows),
    };
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

  /**
   * An endless run: this lap is judged, the difficulty moves, and the next
   * passage is queued — or the run ends. Guarded by a ref because folding the
   * same lap in twice would double-count the minutes it earned.
   */
  useEffect(() => {
    if (!finished || !rules || !adaptive || endlessDone.current) return;
    endlessDone.current = true;
    void endless
      .next(adaptive, finished.result, finished.payload.durationSec * 1000, rules)
      .then(({ run, continued }) => {
        setEndlessRun(run);
        setEndlessGoing(continued);
      });
  }, [finished, rules, adaptive, endless]);

  /**
   * Fold this run into the review deck.
   *
   * Any finished run grades whatever cards it happened to cover — there is no
   * separate review session to start or remember, so practice done anywhere
   * counts. The passage comes from the run's config because the saved payload
   * keeps only its length, and the deck needs the text to know which cards the
   * run actually put in front of the typist.
   *
   * Skipped when the run was never saved: without an id there is nothing to
   * guard against grading the same run twice.
   */
  useEffect(() => {
    if (!finished || savedId === null || !config || reviewDone.current) return;
    reviewDone.current = true;
    void gradeRunAgainstDeck(platform.repo, savedId, {
      passage: config.passage,
      mistakes: finished.mistakes,
    }).catch(() => {
      // A schedule is derived data. Losing one grading is not worth surfacing
      // an error over the top of the user's result.
    });
  }, [finished, savedId, config, platform]);

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
        notifier.notify(
          translate(uiLang, 'notify.badgeTitle'),
          fresh.map((b) => translate(uiLang, `badge.${b.id}`)).join(', '),
        );
        await platform.repo.setSetting(SETTING_KEY.NotifiedBadges, JSON.stringify(earnedNow));
      }
      const today = testsToday(rows);
      if (dailyGoal > 0 && today >= dailyGoal) {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if ((await platform.repo.getSetting('goalNotifiedDate')) !== todayStr) {
          setGoalHit(true);
          notifier.notify(
            translate(uiLang, 'notify.goalTitle'),
            translate(uiLang, 'notify.goalBody', { count: today }),
          );
          await platform.repo.setSetting('goalNotifiedDate', todayStr);
        }
      }
    })();
  }, [finished, platform, notifier, dailyGoal, uiLang]);

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
    const text = t('result.shareText', { wpm: r.netWpm, accuracy: r.accuracy });
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Typly result', text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShareNote(t('result.copied'));
      }
    } catch {
      // user dismissed the share sheet
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('result.title')}</h1>
        {series && (
          <span className="rounded-full bg-surface-3 px-3 py-1 text-xs font-semibold text-fg-muted">
            {t('result.seriesOf', {
              current: series.index + 1,
              total: series.items.length,
            })}
          </span>
        )}
      </div>

      {(goalHit || unlocked.length > 0) && (
        <Card className="space-y-2 border-accent-border bg-accent-soft">
          {goalHit && (
            <p className="text-sm font-semibold text-fg">
              {t('badge.goalHit')}
            </p>
          )}
          {unlocked.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-fg">
                {t(unlocked.length > 1 ? 'badge.newMany' : 'badge.newOne')}
              </span>
              {unlocked.map((b) => (
                <span
                  key={b.id}
                  className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold"
                >
                  {t(`badge.${b.id}`)}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {paperSummary.data && (
        <PaperSectionsReport
          summary={paperSummary.data.summary}
          complete={paperSummary.data.complete}
        />
      )}

      {endlessRun && (
        <EndlessReport
          run={endlessRun}
          continuing={endlessGoing}
          onStop={() => {
            endAdaptive();
            setEndlessGoing(false);
          }}
        />
      )}

      {hasNext && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-accent-border bg-accent-soft">
          <p className="text-sm font-medium text-fg">
            {t('result.nextIn', { seconds: countdown })}
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={skipNext}>
              {t('result.startNow')}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSeries}>
              {t('result.stopSeries')}
            </Button>
          </div>
        </Card>
      )}

      <div id="print-area">
        <div className="mb-4 hidden print:block">
          <h2 className="text-xl font-bold">{t('result.printHeading')}</h2>
          <p className="text-sm">
            {profileFor(finished.payload.examBoard).name} ·{' '}
            {d.dateTime(finished.payload.createdAt)}
          </p>
        </div>
        <Card>
          <ResultSummary result={finished.result} durationSec={finished.payload.durationSec} />
        </Card>
      </div>
      {/* The score, in the unit the notification uses — a DEST candidate needs
          depressions per hour, not words per minute. */}
      {rules?.scoringMode === ScoringMode.Kdph && (
        <KdphCard
          result={finished.result}
          durationSec={finished.payload.durationSec}
          rules={rules}
        />
      )}

      {/* The square card is what actually spreads; the certificate is the
          document you print. Both, in that order. */}
      <ShareCard
        wpm={finished.result.netWpm}
        accuracy={finished.result.accuracy}
        examName={shortNameFor(finished.payload.examBoard)}
        streak={history.data?.streak ?? 0}
        passed={finished.result.status === TestStatus.Passed}
        defaultName={account?.name ?? ''}
        dateLabel={d.date(finished.payload.createdAt)}
      />
      {finished.result.status === TestStatus.Passed && <CertificateCard finished={finished} />}
      <Card className="space-y-3">
        <h2 className="font-semibold">{t('chart.title')}</h2>
        <WpmChart timeline={finished.payload.timeline} />
      </Card>
      {/* KdphCard above is this card's equivalent for a depression-scored post,
          where `minWpm` is zero and would read as "0 WPM required". */}
      {rules && rules.scoringMode !== ScoringMode.Kdph && (
        <CutoffCard
          result={finished.result}
          rules={rules}
          examName={profileFor(finished.payload.examBoard).name}
          history={history.data?.priorWpm ?? []}
        />
      )}
      {finished.paper ? (
        <PaperReport paper={finished.paper} />
      ) : (
        <>
          {/* How the mistakes were made comes before the list of them: the
              pattern is the actionable half, the words are the evidence. */}
          <MistakeTaxonomy mistakes={finished.mistakes} />
          <Card className="space-y-3">
            <h2 className="font-semibold">{t('result.mistakes')}</h2>
            <MistakeList mistakes={finished.mistakes} />
          </Card>
        </>
      )}

      {rules && finished.payload.keystrokes.length > 0 && (
        <BackspaceCostCard
          keystrokes={finished.payload.keystrokes}
          elapsedMs={finished.payload.durationSec * 1000}
          rules={rules}
        />
      )}
      <FingerLoadCard keystrokes={finished.payload.keystrokes} />
      {finished.payload.keystrokes.length > 0 && config && (
        <Card className="space-y-3">
          <h2 className="font-semibold">{t('result.replay')}</h2>
          <p className="text-sm text-fg-muted">
            {t('result.replayHint')}
          </p>
          <ReplayPlayer
            passage={finished.paper ? finished.paper.typed : config.passage}
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
      {config && !config.paper && (
        <ChallengeCard
          title={config.title}
          passage={config.passage}
          lang={finished.payload.lang}
          board={finished.payload.examBoard}
          durationSec={finished.payload.durationSec}
          netWpm={finished.result.netWpm}
          accuracy={finished.result.accuracy}
          name={account?.name ?? ''}
          answering={answering}
        />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={again}>{t('result.newTest')}</Button>
        <Button variant="secondary" onClick={() => navigate('/app/history')}>
          {t('result.viewHistory')}
        </Button>
        <Button variant="ghost" onClick={printReport}>
          <Printer size={16} /> {t('result.print')}
        </Button>
        <Button variant="ghost" onClick={shareResult}>
          <Share2 size={16} /> {t('result.share')}
        </Button>
        {shareNote && <span className="text-xs text-fg-muted">{shareNote}</span>}
      </div>
    </div>
  );
}
