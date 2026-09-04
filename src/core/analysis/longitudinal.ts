/**
 * The same analysis, but over time instead of over one run.
 *
 * `KeyHeatmap` is per-session, which answers "what went wrong just now" and
 * never "is my weak `e` healing". And `WpmChart` shows one run's per-minute
 * speed, which hides the thing that actually fails a 10-minute DEST: most
 * aspirants do not lose on peak speed, they lose because minute ten is six WPM
 * slower than minute one. Both readings need history, so both live here.
 */

import { differenceInCalendarDays } from 'date-fns';
import { diffChars } from 'diff';
import type { TestSummary } from '@/platform/ports';
import type { Mistake } from '../types';
import { keyIdForChar } from '../keyboard/layout';

/** Days a "recent" window covers, and the comparison window before it. */
export const HEATMAP_WINDOW_DAYS = 30;

export interface KeyTrend {
  /** Key id, as the on-screen keyboard names it. */
  key: string;
  /** Errors inside the recent window. */
  recent: number;
  /** Errors in the window of the same length before it. */
  previous: number;
  /** recent − previous: negative means the key is healing. */
  delta: number;
}

export interface LongitudinalKeys {
  /** Key id → error count inside the window, for the heatmap. */
  values: Map<string, number>;
  /** Highest count in the map, so the heatmap can scale itself. */
  max: number;
  /** Keys getting better and worse, biggest movement first. */
  healing: KeyTrend[];
  worsening: KeyTrend[];
  /** Runs the window covered — zero means there is nothing to read. */
  runs: number;
  days: number;
}

const TRACKABLE = /^[a-z0-9!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~ ]$/;

/**
 * Per-key errors over the last `days`, plus how each key compares with the
 * window before it. Mistakes are char-diffed the same way `weakKeys` does it,
 * so a key counted here is the same key the Trainer would drill.
 */
export function longitudinalKeys(
  results: TestSummary[],
  days = HEATMAP_WINDOW_DAYS,
  now = new Date(),
): LongitudinalKeys {
  const recent = new Map<string, number>();
  const previous = new Map<string, number>();
  let runs = 0;

  for (const full of results) {
    const age = differenceInCalendarDays(now, new Date(full.row.createdAt));
    const bucket = age < days ? recent : age < days * 2 ? previous : null;
    if (!bucket) continue;
    if (bucket === recent) runs++;
    for (const [key, count] of errorKeys(full.mistakes)) {
      bucket.set(key, (bucket.get(key) ?? 0) + count);
    }
  }

  const keys = new Set([...recent.keys(), ...previous.keys()]);
  const trends: KeyTrend[] = [...keys].map((key) => {
    const now_ = recent.get(key) ?? 0;
    const then = previous.get(key) ?? 0;
    return { key, recent: now_, previous: then, delta: now_ - then };
  });

  return {
    values: recent,
    max: Math.max(0, ...recent.values()),
    healing: trends.filter((t) => t.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 6),
    worsening: trends.filter((t) => t.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 6),
    runs,
    days,
  };
}

/** Which key ids one run's mistakes blame, and how often. */
function errorKeys(mistakes: Mistake[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const m of mistakes) {
    if (!m.expected) continue;
    for (const part of diffChars(m.expected, m.typed || '')) {
      if (!part.removed) continue;
      for (const ch of part.value.toLowerCase()) {
        if (!TRACKABLE.test(ch)) continue;
        const id = keyIdForChar(ch);
        if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
  }
  return counts;
}

export interface FatiguePoint {
  /** Minute index inside a run, 0-based. */
  minute: number;
  /** Mean WPM at this minute across every run long enough to reach it. */
  wpm: number;
  /** How many runs contributed — later minutes are averaged over fewer. */
  samples: number;
}

export interface FatigueCurve {
  points: FatiguePoint[];
  /** Mean WPM over the first minute of every run. */
  firstMinute: number;
  /** Mean WPM over each run's own last full minute. */
  lastMinute: number;
  /** lastMinute − firstMinute: negative is fade. */
  drop: number;
  /** The drop as a share of the first minute, 0–100. */
  dropPct: number;
  runs: number;
}

/** Runs shorter than this have no "late" minute to compare against. */
const MIN_MINUTES = 3;

/**
 * How speed holds up *inside* a run, averaged across runs.
 *
 * Reads the per-minute timeline each attempt already stored. That data was
 * being written from the first release and never read across attempts, which
 * is why the question "do I fade?" had no answer despite the numbers existing.
 */
export function fatigueCurve(results: TestSummary[]): FatigueCurve {
  const sums: number[] = [];
  const counts: number[] = [];
  const firsts: number[] = [];
  const lasts: number[] = [];
  let runs = 0;

  for (const full of results) {
    const timeline = full.timeline;
    if (timeline.length < MIN_MINUTES) continue;
    runs++;
    timeline.forEach((point, minute) => {
      sums[minute] = (sums[minute] ?? 0) + point.wpm;
      counts[minute] = (counts[minute] ?? 0) + 1;
    });
    firsts.push(timeline[0]!.wpm);
    lasts.push(timeline[timeline.length - 1]!.wpm);
  }

  const points: FatiguePoint[] = sums.map((sum, minute) => ({
    minute,
    wpm: round1(sum / (counts[minute] ?? 1)),
    samples: counts[minute] ?? 0,
  }));

  const firstMinute = mean(firsts);
  const lastMinute = mean(lasts);
  return {
    points,
    firstMinute,
    lastMinute,
    drop: round1(lastMinute - firstMinute),
    dropPct: firstMinute > 0 ? round1(((lastMinute - firstMinute) / firstMinute) * 100) : 0,
    runs,
  };
}

function mean(values: number[]): number {
  return values.length ? round1(values.reduce((s, v) => s + v, 0) / values.length) : 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
