import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Play } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { Mistake } from '@/core/types';
import { SourceType } from '@/core/constants';
import { confusedPairs, weakKeys, weakWords } from '@/core/analysis/analysis';
import { generateWeaknessDrill } from '@/core/practice/generators';
import { KEY_ROWS } from '@/core/keyboard/layout';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';

export function Trainer() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const setConfig = useExamStore((s) => s.setConfig);
  const settings = useSettingsStore();
  const [mistakes, setMistakes] = useState<Mistake[] | null>(null);

  useEffect(() => {
    platform.repo.aggregateMistakes().then(setMistakes);
  }, [platform]);

  const analysis = useMemo(() => {
    if (!mistakes) return null;
    const keys = weakKeys(mistakes);
    return {
      keys,
      pairs: confusedPairs(mistakes),
      words: weakWords(mistakes, 12),
      keyMap: new Map(keys.map((k) => [k.key, k.count])),
      max: keys.reduce((m, k) => Math.max(m, k.count), 0),
      total: mistakes.length,
    };
  }, [mistakes]);

  const hasData = !!analysis && analysis.total > 0 && analysis.keys.length > 0;

  function startDrill() {
    if (!analysis) return;
    setConfig({
      passage: generateWeaknessDrill(
        analysis.keys.map((k) => k.key),
        analysis.words.map((w) => w.expected),
      ),
      title: 'Weak-spot trainer',
      documentId: null,
      lang: settings.lang,
      board: settings.board,
      timing: settings.timing,
      durationSec: settings.durationSec,
      sourceType: SourceType.Text,
      difficulty: settings.difficulty,
      examMode: settings.examMode,
      backspaceEnabled: settings.backspaceEnabled,
      spaceEnabled: settings.spaceEnabled,
      enterEnabled: settings.enterEnabled,
      examLock: settings.examLock,
    });
    navigate('/app/exam');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trainer</h1>
          <p className="mt-1 text-fg-muted">Targeted practice generated from your own mistakes.</p>
        </div>
        {hasData && (
          <Button onClick={startDrill}>
            <Play size={16} /> Start targeted drill
          </Button>
        )}
      </div>

      {mistakes === null ? (
        <Card>
          <p className="text-sm text-fg-muted">Loading…</p>
        </Card>
      ) : !hasData ? (
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
            <KeyHeatmap counts={analysis.keyMap} max={analysis.max} />
          </Card>

          {analysis.pairs.length > 0 && (
            <Card className="space-y-3">
              <h2 className="font-semibold">Most-confused keys</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.pairs.map((p) => (
                  <span
                    key={p.expected + p.typed}
                    className="rounded-full bg-surface-2 px-3 py-1 text-sm tabular-nums"
                  >
                    <span className="font-mono font-semibold">{p.expected}</span>
                    <span className="mx-1 text-fg-subtle">→</span>
                    <span className="font-mono font-semibold text-danger-text">{p.typed}</span>
                    <span className="ml-2 text-xs text-fg-muted">×{p.count}</span>
                  </span>
                ))}
              </div>
            </Card>
          )}

          {analysis.words.length > 0 && (
            <Card className="space-y-3">
              <h2 className="font-semibold">Most-missed words</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.words.map((w) => (
                  <span key={w.expected} className="rounded-full bg-surface-2 px-3 py-1 text-sm">
                    <span className="font-mono">{w.expected}</span>
                    <span className="ml-2 text-xs text-fg-muted">×{w.count}</span>
                  </span>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function KeyHeatmap({ counts, max }: { counts: Map<string, number>; max: number }) {
  const scale = Math.max(max, 1);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
      {KEY_ROWS.map((row, r) => (
        <div key={r} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const count = counts.get(key.id) ?? 0;
            const intensity = count / scale;
            return (
              <span
                key={key.id}
                title={count ? `${count} error${count === 1 ? '' : 's'}` : 'no errors'}
                style={{
                  flexGrow: key.width,
                  flexBasis: 0,
                  backgroundColor: count ? `rgba(239,68,68,${0.12 + 0.78 * intensity})` : undefined,
                }}
                className={`flex h-9 items-center justify-center rounded-lg text-xs font-semibold ${
                  count ? 'text-white' : 'bg-surface-2 text-fg-subtle'
                }`}
              >
                {key.label}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
