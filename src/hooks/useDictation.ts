import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import {
  chunkAt,
  dictationProgress,
  planDictation,
  type DictationChunk,
  type DictationPlan,
} from '@/core/dictation/dictation';
import type { Lang } from '@/core/constants';

export interface DictationState {
  /** The schedule being read, so a caller can show chunk counts and length. */
  plan: DictationPlan;
  /** The chunk currently being spoken, or null before it starts. */
  current: DictationChunk | null;
  /** Chunks already read. */
  spoken: number;
  /** Progress through the dictation, 0–100. */
  progress: number;
  /** True while the dictation is running. */
  playing: boolean;
  /** True once every chunk has been read. */
  finished: boolean;
  /** True where the platform has no voice at all. */
  unsupported: boolean;
  start: () => void;
  pause: () => void;
  /** Read the current chunk again without losing the schedule. */
  repeat: () => void;
  stop: () => void;
}

/** How often the schedule is checked against the clock. */
const TICK_MS = 200;

/**
 * Drives a dictation: keeps the wall clock, hands each chunk to the speech port
 * when its turn comes, and never lets two chunks overlap.
 *
 * The clock, not the voice, owns the pace — an engine that finishes a chunk
 * early simply waits, which is what keeps the delivered speed on target.
 */
export function useDictation(passage: string, wpm: number, lang: Lang): DictationState {
  const platform = usePlatform();
  const [plan] = useState(() => planDictation(passage, wpm));
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [spoken, setSpoken] = useState(0);
  // The last chunk handed to the voice, so a tick cannot speak it twice.
  const lastSpoken = useRef(-1);
  const startedAt = useRef<number | null>(null);

  const speakChunk = useCallback(
    (chunk: DictationChunk) => {
      lastSpoken.current = chunk.index;
      setSpoken(chunk.index + 1);
      platform.tts.speak(chunk.text, { lang, rate: plan.rate });
    },
    [platform, lang, plan.rate],
  );

  useEffect(() => {
    if (!playing) return;
    startedAt.current = Date.now() - elapsedMs;
    const id = setInterval(() => {
      if (startedAt.current === null) return;
      setElapsedMs(Date.now() - startedAt.current);
    }, TICK_MS);
    return () => clearInterval(id);
    // `elapsedMs` is read once to re-base the clock; re-running on every tick
    // would restart the interval two hundred milliseconds at a time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // The schedule, enforced: whichever chunk is due gets spoken, once.
  useEffect(() => {
    if (!playing) return;
    const due = chunkAt(plan, elapsedMs);
    if (due && due.index > lastSpoken.current) speakChunk(due);
  }, [playing, elapsedMs, plan, speakChunk]);

  // Leaving the page must not leave a voice talking to an empty room.
  useEffect(() => {
    const tts = platform.tts;
    return () => tts.stop();
  }, [platform]);

  const finished = spoken >= plan.chunks.length && elapsedMs >= plan.totalMs;

  useEffect(() => {
    if (finished && playing) setPlaying(false);
  }, [finished, playing]);

  const stop = useCallback(() => {
    setPlaying(false);
    platform.tts.stop();
  }, [platform]);

  const repeat = useCallback(() => {
    const current = chunkAt(plan, elapsedMs);
    if (current) platform.tts.speak(current.text, { lang, rate: plan.rate });
  }, [plan, elapsedMs, platform, lang]);

  return {
    plan,
    current: chunkAt(plan, elapsedMs),
    spoken,
    progress: dictationProgress(plan, elapsedMs),
    playing,
    finished,
    unsupported: !platform.tts.available(),
    start: () => setPlaying(true),
    pause: stop,
    repeat,
    stop,
  };
}
