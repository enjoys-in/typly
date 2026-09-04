import { memo, useEffect, useRef, useState } from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { clockAlarm, rankFor, HALL_NOISE } from '@/core/exam/pressure';
import { usePlatform } from '@/platform/PlatformContext';
import { useT } from '@/i18n';

interface Props {
  remainingSec: number;
  currentWpm: number;
  targetWpm: number;
  /** Only true while the run is actually going, so nothing fires when paused. */
  active: boolean;
  /** Ambient hall noise, which needs the sound setting as well as pressure mode. */
  sound: boolean;
}

/** How often the rank re-reads, so the ticker moves without flickering. */
const RANK_TICK_MS = 4_000;

/**
 * Exam-hall pressure, on purpose: a clock that starts flashing near the end, a
 * rank among a notional hall, and the sound of other people typing.
 *
 * People lose five to eight WPM on the day to exactly these things and have no
 * way to rehearse them. Every part is derived from the run's own numbers, so
 * the pressure is honest — type faster and the rank really does climb.
 */
export const PressureLayer = memo(function PressureLayer({
  remainingSec,
  currentWpm,
  targetWpm,
  active,
  sound,
}: Props) {
  const t = useT();
  const platform = usePlatform();
  const alarm = clockAlarm(remainingSec);
  const [rank, setRank] = useState(() => rankFor(currentWpm, targetWpm));
  // The rank shown at the previous tick, so movement is measured against what
  // the user actually saw rather than against a value recomputed here.
  const previous = useRef(rank.rank);
  // Read from a ref inside the interval so the ticker's own cadence is fixed
  // rather than restarting on every keystroke.
  const speed = useRef(currentWpm);
  speed.current = currentWpm;

  useEffect(() => {
    if (!active || targetWpm <= 0) return;
    const id = setInterval(() => {
      const next = rankFor(speed.current, targetWpm, previous.current);
      previous.current = next.rank;
      setRank(next);
    }, RANK_TICK_MS);
    return () => clearInterval(id);
  }, [active, targetWpm]);

  // Hall noise: one keystroke cue per notional typist, at a low volume. It
  // needs the sound setting too — silent practice must stay silent.
  useEffect(() => {
    if (!active || !sound || !platform.sound.available()) return;
    const id = setInterval(() => platform.sound.play('hall'), 1000 / HALL_NOISE.density);
    return () => clearInterval(id);
  }, [active, sound, platform]);

  return (
    <div
      aria-live="off"
      className={`flex flex-wrap items-center justify-between gap-3 rounded-panel border px-4 py-2.5 text-xs ${
        alarm === 'urgent'
          ? 'animate-pulse border-danger bg-danger-soft'
          : alarm === 'warning'
            ? 'border-danger-border bg-danger-soft/60'
            : 'border-line bg-surface'
      }`}
    >
      <span className="flex items-center gap-2 font-semibold">
        <Users size={14} className="shrink-0 text-fg-subtle" />
        {t('pressure.rank', { rank: rank.rank, of: rank.of })}
        {rank.moved !== 0 && (
          <span
            className={`inline-flex items-center gap-0.5 tabular-nums ${
              rank.moved > 0 ? 'text-accent-text' : 'text-danger-text'
            }`}
          >
            <TrendingUp size={12} className={rank.moved > 0 ? '' : 'rotate-180'} />
            {Math.abs(rank.moved)}
          </span>
        )}
      </span>
      <span className={alarm === 'calm' ? 'text-fg-muted' : 'font-bold text-danger-text'}>
        {alarm === 'calm'
          ? t('pressure.hint')
          : t(alarm === 'urgent' ? 'pressure.urgent' : 'pressure.warning', {
              seconds: remainingSec,
            })}
      </span>
    </div>
  );
});
