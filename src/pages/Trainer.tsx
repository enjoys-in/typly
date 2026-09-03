import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Play } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { drillBase, useSettingsStore } from '@/store/settingsStore';
import { useAsync } from '@/hooks/useAsync';
import { KEYSTROKE_SCAN_TESTS, SourceType } from '@/core/constants';
import { confusedPairs, weakKeys, weakWords } from '@/core/analysis/analysis';
import { generateSpeedDrill, generateWeaknessDrill } from '@/core/practice/generators';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { SkeletonCard } from '@/ui/Skeleton';
import { Chip, ChipRow } from '@/components/trainer/Chips';
import { KeyHeatmap } from '@/components/trainer/KeyHeatmap';
import { SpeedPanel, speedFocus } from '@/components/trainer/SpeedPanel';

/** Accuracy and speed are separate weaknesses and need separate drills. */
type Focus = 'errors' | 'speed';

const FOCUS_OPTIONS: SegmentedOption<Focus>[] = [
  { value: 'errors', label: 'Accuracy', title: 'Keys and words you get wrong' },
  { value: 'speed', label: 'Speed', title: 'Keys and transitions that cost you time' },
];

export function Trainer() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const setConfig = useExamStore((s) => s.setConfig);
  const settings = useSettingsStore();
  const [focus, setFocus] = useState<Focus>('errors');

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
    };
  }, [data.data]);

  const hasErrors = !!errors && errors.keys.length > 0;
  const hasSpeed = (data.data?.keystrokes.length ?? 0) > 0;

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
          <h1 className="text-3xl font-bold tracking-tight">Trainer</h1>
          <p className="mt-1 text-fg-muted">
            Targeted practice generated from your own results — what you get wrong, and what slows
            you down.
          </p>
        </div>
        {canDrill && (
          <Button onClick={startDrill}>
            <Play size={16} /> Start {focus === 'speed' ? 'rhythm' : 'targeted'} drill
          </Button>
        )}
      </div>

      <Segmented options={FOCUS_OPTIONS} value={focus} onChange={setFocus} ariaLabel="Drill focus" />

      {data.loading ? (
        <SkeletonCard lines={4} />
      ) : focus === 'speed' ? (
        <SpeedPanel keystrokes={data.data?.keystrokes ?? []} />
      ) : !hasErrors ? (
        <Card className="flex flex-col items-start gap-3">
          <Crosshair className="text-fg-subtle" />
          <p className="text-sm text-fg-muted">
            No mistakes recorded yet. Take a few tests and your weak spots will show up here.
          </p>
        </Card>
      ) : (
        <>
          <Card className="space-y-3">
            <h2 className="font-semibold">Weak-key heatmap</h2>
            <KeyHeatmap
              values={errors.heat}
              max={errors.max}
              tone="error"
              describe={(n) => `${n} error${n === 1 ? '' : 's'}`}
              emptyLabel="no errors"
            />
          </Card>

          {errors.pairs.length > 0 && (
            <Card className="space-y-3">
              <h2 className="font-semibold">Most-confused keys</h2>
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
              <h2 className="font-semibold">Most-missed words</h2>
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
