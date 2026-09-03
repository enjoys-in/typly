import { useMemo } from 'react';
import { Activity, Timer } from 'lucide-react';
import type { Keystroke } from '@/core/types';
import { burstCpm, fingerTimings, rhythm, slowDigraphs, slowKeys } from '@/core/analysis/speed';
import { keyIdForChar } from '@/core/keyboard/layout';
import { FINGER_DOT, FINGER_LABEL } from '@/components/exam/fingerStyles';
import { Card } from '@/ui/Card';
import { ProgressBar } from '@/ui/ProgressBar';
import { Chip, ChipRow } from './Chips';
import { KeyHeatmap } from './KeyHeatmap';
import { useT } from '@/i18n';

interface Props {
  keystrokes: Keystroke[];
}

/** The space bar is a real key with real latency, but it needs a visible glyph. */
function display(ch: string): string {
  return ch === ' ' ? '␣' : ch;
}

export interface SpeedFocus {
  /** Slowest characters, worst first. */
  keys: string[];
  /** Slowest two-character transitions, worst first. */
  pairs: string[];
}

/** The drill material the panel's findings point at. */
export function speedFocus(keystrokes: Keystroke[]): SpeedFocus {
  return {
    keys: slowKeys(keystrokes).map((k) => k.key),
    pairs: slowDigraphs(keystrokes).map((d) => `${d.from}${d.to}`),
  };
}

/**
 * Where time goes, as opposed to where errors happen. A typist can be perfectly
 * accurate and still stall on the same three transitions every run.
 */
export function SpeedPanel({ keystrokes }: Props) {
  const t = useT();
  const stats = useMemo(() => {
    const keys = slowKeys(keystrokes);
    return {
      keys,
      pairs: slowDigraphs(keystrokes),
      fingers: fingerTimings(keystrokes),
      beat: rhythm(keystrokes),
      cpm: burstCpm(keystrokes),
      // Heat is keyed by physical key so shifted characters land on their key.
      heat: new Map(keys.map((k) => [keyIdForChar(k.key), k.meanMs])),
      max: keys.reduce((m, k) => Math.max(m, k.meanMs), 0),
    };
  }, [keystrokes]);

  if (stats.keys.length === 0) {
    return (
      <Card className="flex flex-col items-start gap-3">
        <Timer className="text-fg-subtle" />
        <p className="text-sm text-fg-muted">
          {t('trainer.noTiming')}
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-semibold">{t('trainer.rhythm')}</h2>
          <span className="text-sm text-fg-muted tabular-nums">
            {t('trainer.beat', { ms: stats.beat.meanMs, cpm: stats.cpm })}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium tracking-wide text-fg-muted uppercase">
              <Activity size={13} /> {t('trainer.consistency')}
            </span>
            <span className="font-semibold tabular-nums">{stats.beat.consistency}%</span>
          </div>
          <ProgressBar value={stats.beat.consistency} />
          <p className="text-xs text-fg-muted">
            {t('trainer.consistencyHint')}
          </p>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold">{t('trainer.slowestKeys')}</h2>
        <KeyHeatmap
          values={stats.heat}
          max={stats.max}
          tone="slow"
          describe={(ms) => t('trainer.msToPress', { ms })}
          emptyLabel={t('trainer.notMeasured')}
        />
      </Card>

      {stats.fingers.length > 0 && (
        <Card className="space-y-3">
          <h2 className="font-semibold">{t('trainer.perFinger')}</h2>
          <ul className="space-y-2">
            {stats.fingers.map((f) => (
              <li key={f.finger} className="flex items-center gap-3 text-sm">
                <span className="flex w-20 shrink-0 items-center gap-2 text-fg-muted">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${FINGER_DOT[f.finger]}`} />
                  {FINGER_LABEL[f.finger]}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${(f.meanMs / (stats.fingers[0]?.meanMs || 1)) * 100}%` }}
                  />
                </span>
                <span className="w-20 shrink-0 text-right text-xs tabular-nums text-fg-subtle">
                  {f.meanMs} ms
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-fg-muted">
            {t('trainer.perFingerHint')}
          </p>
        </Card>
      )}

      {stats.pairs.length > 0 && (
        <Card className="space-y-3">
          <h2 className="font-semibold">{t('trainer.slowestPairs')}</h2>
          <ChipRow>
            {stats.pairs.map((p) => (
              <Chip key={`${p.from}${p.to}`} meta={`${p.meanMs} ms`}>
                <span className="font-mono font-semibold">
                  {display(p.from)}
                  {display(p.to)}
                </span>
              </Chip>
            ))}
          </ChipRow>
          <p className="text-xs text-fg-muted">
            {t('trainer.slowestPairsHint')}
          </p>
        </Card>
      )}
    </>
  );
}
