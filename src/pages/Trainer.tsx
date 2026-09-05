import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Play } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { drillBase, useSettingsStore } from '@/store/settingsStore';
import { useAsync } from '@/hooks/useAsync';
import { KEYSTROKE_SCAN_TESTS, SourceType } from '@/core/constants';
import { confusedPairs, weakKeys, weakWords } from '@/core/analysis/analysis';
import { mistakeTaxonomy } from '@/core/analysis/taxonomy';
import { generateSpeedDrill, generateWeaknessDrill } from '@/core/practice/generators';
import { drillSeed } from '@/core/review/review';
import { useReviewDeck } from '@/hooks/useReviewDeck';
import { ReviewPanel } from '@/components/trainer/ReviewPanel';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { SkeletonCard } from '@/ui/Skeleton';
import { Chip, ChipRow } from '@/components/trainer/Chips';
import { KeyHeatmap } from '@/components/trainer/KeyHeatmap';
import { SpeedPanel, speedFocus } from '@/components/trainer/SpeedPanel';
import { FingerLoadCard } from '@/components/analysis/FingerLoadCard';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n/en';

/** Accuracy and speed are separate weaknesses and need separate drills. */
type Focus = 'errors' | 'speed';

export function Trainer() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const setConfig = useExamStore((s) => s.setConfig);
  const settings = useSettingsStore();
  const [focus, setFocus] = useState<Focus>('errors');
  const t = useT();
  const review = useReviewDeck();

  const focusOptions: SegmentedOption<Focus>[] = [
    { value: 'errors', label: t('trainer.accuracy'), title: t('trainer.accuracyHint') },
    { value: 'speed', label: t('trainer.speed'), title: t('trainer.speedHint') },
  ];

  const data = useAsync(
    async () => ({
      mistakes: await platform.repo.aggregateMistakes(),
      keystrokes: await platform.repo.recentKeystrokes(KEYSTROKE_SCAN_TESTS),
    }),
    [platform],
  );

  const errors = useMemo(() => {
    if (!data.data) return null;
    const keys = weakKeys(data.data.mistakes);
    return {
      keys,
      pairs: confusedPairs(data.data.mistakes),
      words: weakWords(data.data.mistakes, 12),
      heat: new Map(keys.map((k) => [k.key, k.count])),
      max: keys.reduce((m, k) => Math.max(m, k.count), 0),
      // Across the whole history rather than one run: a pattern that shows up
      // in every attempt is the one actually worth a change of technique.
      kinds: mistakeTaxonomy(data.data.mistakes),
    };
  }, [data.data]);

  const hasErrors = !!errors && errors.keys.length > 0;
  const hasSpeed = (data.data?.keystrokes.length ?? 0) > 0;

  /**
   * A drill built from the cards that are due, rather than from whatever is
   * currently worst. That is the whole difference between the queue and the
   * heatmap: the queue decides what today is for.
   */
  function startReview() {
    const seed = drillSeed(review.due);
    setConfig({
      ...drillBase(settings),
      passage: generateWeaknessDrill(seed.keys, seed.words),
      title: t('review.drillTitle'),
      documentId: null,
      sourceType: SourceType.Text,
    });
    navigate('/app/exam');
  }

  function startDrill() {
    const passage =
      focus === 'speed'
        ? speedDrillPassage()
        : generateWeaknessDrill(
            errors?.keys.map((k) => k.key) ?? [],
            errors?.words.map((w) => w.expected) ?? [],
          );
    setConfig({
      ...drillBase(settings),
      passage,
      title: focus === 'speed' ? 'Rhythm trainer' : 'Weak-spot trainer',
      documentId: null,
      sourceType: SourceType.Text,
    });
    navigate('/app/exam');
  }

  function speedDrillPassage(): string {
    const { keys, pairs } = speedFocus(data.data?.keystrokes ?? []);
    return generateSpeedDrill(pairs, keys);
  }

  const canDrill = focus === 'speed' ? hasSpeed : hasErrors;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('trainer.title')}</h1>
          <p className="mt-1 text-fg-muted">
            {t('trainer.subtitle')}
          </p>
        </div>
        {canDrill && (
          <Button onClick={startDrill}>
            <Play size={16} /> {t(focus === 'speed' ? 'trainer.startRhythm' : 'trainer.startTargeted')}
          </Button>
        )}
      </div>

      {/* Above the diagnosis on purpose. "What should I do today" is a more
          useful first answer than "here is everything wrong with you". */}
      {!review.loading && (
        <ReviewPanel due={review.due} stats={review.stats} onStart={startReview} />
      )}

      <Segmented options={focusOptions} value={focus} onChange={setFocus} ariaLabel={t('trainer.focus')} />

      {data.loading ? (
        <SkeletonCard lines={4} />
      ) : focus === 'speed' ? (
        <>
          <SpeedPanel keystrokes={data.data?.keystrokes ?? []} />
          {/* The mechanics behind a plateau: which finger is overloaded, and
              how far each one is travelling. */}
          <FingerLoadCard keystrokes={data.data?.keystrokes ?? []} />
        </>
      ) : !hasErrors ? (
        <Card className="flex flex-col items-start gap-3">
          <Crosshair className="text-fg-subtle" />
          <p className="text-sm text-fg-muted">
            {t('trainer.noMistakes')}
          </p>
        </Card>
      ) : (
        <>
          <Card className="space-y-3">
            <h2 className="font-semibold">{t('trainer.heatmap')}</h2>
            <KeyHeatmap
              values={errors.heat}
              max={errors.max}
              tone="error"
              describe={(n) => (n === 1 ? t('trainer.errorCountOne') : t('trainer.errorCount', { count: n }))}
              emptyLabel={t('trainer.noErrors')}
            />
          </Card>

          {errors.kinds.length > 0 && (
            <Card className="space-y-3">
              <h2 className="font-semibold">{t('trainer.taxonomy')}</h2>
              <p className="text-sm text-fg-muted">
                {t('trainer.taxonomyHint', {
                  kind: t(`mistakeKind.${errors.kinds[0]!.kind}` as TKey),
                  share: errors.kinds[0]!.share,
                })}
              </p>
              <ChipRow>
                {errors.kinds.map((kind) => (
                  <Chip key={kind.kind} meta={`${kind.share}%`}>
                    {t(`mistakeKind.${kind.kind}` as TKey)}
                  </Chip>
                ))}
              </ChipRow>
              <p className="text-xs text-fg-muted">
                {t(`mistakeFix.${errors.kinds[0]!.kind}` as TKey)}
              </p>
            </Card>
          )}

          {errors.pairs.length > 0 && (
            <Card className="space-y-3">
              <h2 className="font-semibold">{t('trainer.confused')}</h2>
              <ChipRow>
                {errors.pairs.map((p) => (
                  <Chip key={p.expected + p.typed} meta={`×${p.count}`}>
                    <span className="font-mono font-semibold">{p.expected}</span>
                    <span className="mx-1 text-fg-subtle">→</span>
                    <span className="font-mono font-semibold text-danger-text">{p.typed}</span>
                  </Chip>
                ))}
              </ChipRow>
            </Card>
          )}

          {errors.words.length > 0 && (
            <Card className="space-y-3">
              <h2 className="font-semibold">{t('trainer.missedWords')}</h2>
              <ChipRow>
                {errors.words.map((w) => (
                  <Chip key={w.expected} meta={`×${w.count}`}>
                    <span className="font-mono">{w.expected}</span>
                  </Chip>
                ))}
              </ChipRow>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
