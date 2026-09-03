import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import type { Keystroke } from '@/core/types';
import { countAt, typedAfter, typedBetween } from '@/core/typing/replay';
import { Button } from '@/ui/Button';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { PassageView } from '@/components/exam/PassageView';
import { useT } from '@/i18n';

type Speed = '1' | '2' | '4';

const SPEED_OPTIONS: SegmentedOption<Speed>[] = [
  { value: '1', label: '1×' },
  { value: '2', label: '2×' },
  { value: '4', label: '4×' },
];

interface Props {
  passage: string;
  keystrokes: Keystroke[];
  fontFamily?: string;
}

function clock(ms: number): string {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * Plays an attempt back keystroke by keystroke. Where the mistake list says
 * *what* went wrong, watching the run shows *when* — the stall before a word,
 * the burst that outran accuracy.
 */
export function ReplayPlayer({ passage, keystrokes, fontFamily }: Props) {
  const t = useT();
  const duration = keystrokes[keystrokes.length - 1]?.t ?? 0;
  const [ms, setMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('1');
  const frame = useRef(0);

  const cursor = countAt(keystrokes, ms);
  // Rebuilding the whole run every frame is quadratic on a long attempt, so the
  // last position is cached and playback only applies the new keystrokes.
  // Scrubbing backwards is the one case that has to start over.
  const built = useRef({ cursor: 0, typed: '' });
  const typed = useMemo(() => {
    const cache = built.current;
    cache.typed =
      cursor < cache.cursor
        ? typedAfter(keystrokes, cursor)
        : typedBetween(keystrokes, cache.typed, cache.cursor, cursor);
    cache.cursor = cursor;
    return cache.typed;
  }, [keystrokes, cursor]);

  // A different attempt loaded into the same player starts from scratch.
  useEffect(() => {
    built.current = { cursor: 0, typed: '' };
    setMs(0);
    setPlaying(false);
  }, [keystrokes]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const rate = Number(speed);
    const tick = (now: number) => {
      const delta = (now - last) * rate;
      last = now;
      setMs((current) => {
        const next = current + delta;
        if (next >= duration) {
          setPlaying(false);
          return duration;
        }
        return next;
      });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [playing, speed, duration]);

  function restart() {
    setMs(0);
    setPlaying(true);
  }

  function toggle() {
    if (ms >= duration) restart();
    else setPlaying((p) => !p);
  }

  if (keystrokes.length === 0) {
    return (
      <p className="text-sm text-fg-muted">
        {t('replay.none')}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <PassageView
        passage={passage}
        typed={typed}
        fontFamily={fontFamily}
        caret
        className="max-h-72"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          onClick={toggle}
          aria-label={t(playing ? 'replay.pause' : 'replay.play')}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {t(playing ? 'replay.pause' : ms >= duration ? 'replay.again' : 'replay.play')}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setMs(0)} aria-label={t('replay.backToStart')}>
          <RotateCcw size={14} />
        </Button>
        <input
          type="range"
          min={0}
          max={Math.max(duration, 1)}
          value={ms}
          onChange={(e) => {
            setPlaying(false);
            setMs(Number(e.target.value));
          }}
          aria-label={t('replay.position')}
          className="h-1.5 min-w-40 flex-1 cursor-pointer accent-[var(--accent)]"
        />
        <span className="text-xs tabular-nums text-fg-muted">
          {clock(ms)} / {clock(duration)}
        </span>
        <Segmented options={SPEED_OPTIONS} value={speed} onChange={setSpeed} ariaLabel={t('replay.speed')} />
      </div>
    </div>
  );
}
