import type { Keystroke } from '../types';
import { keyForChar, type Finger } from '../keyboard/layout';

export interface KeyTiming {
  /** The character the user was aiming for. */
  key: string;
  count: number;
  meanMs: number;
}

export interface DigraphTiming {
  from: string;
  to: string;
  count: number;
  meanMs: number;
}

export interface FingerTiming {
  finger: Finger;
  count: number;
  meanMs: number;
}

export interface Rhythm {
  meanMs: number;
  stdDevMs: number;
  /** 0–100: how even the gaps between keystrokes are (100 = metronomic). */
  consistency: number;
}

/**
 * Gaps longer than this are thinking/reading pauses, not typing speed, and are
 * excluded so a single hesitation doesn't define a key's average.
 */
const MAX_GAP_MS = 2_000;

/**
 * Any single character a typist presses, in any script — so this accepts
 * Devanagari, unlike the QWERTY-only predicate the error heatmap uses, and the
 * space bar, which is the most-pressed key on the board and the one that sets
 * the rhythm between words. Line breaks are structure, not typing.
 */
function isTypedChar(ch: string): boolean {
  return ch.length === 1 && ch !== '\n' && ch !== '\r' && ch !== '\t';
}

// Corrections carry the passage character they were aiming at, so they have to
// be excluded by key, not by what they expected.
const CONTROL_KEYS = new Set(['Backspace', 'Delete', 'Enter', 'Tab']);

interface Interval {
  /** The character being aimed at when the key was pressed. */
  target: string;
  /** The character aimed at immediately before it. */
  previous: string;
  gapMs: number;
}

/**
 * Time-to-press for each keystroke, attributed to the character the user was
 * aiming for (`expected`) rather than what they hit, so the result says what to
 * practise. Corrections and reading pauses are dropped.
 */
function intervals(keystrokes: Keystroke[]): Interval[] {
  const out: Interval[] = [];
  let previous: Keystroke | null = null;

  for (const k of keystrokes) {
    if (CONTROL_KEYS.has(k.key)) {
      previous = null; // a correction breaks the run
      continue;
    }
    const target = targetOf(k);
    if (!isTypedChar(target)) {
      previous = null;
      continue;
    }
    if (previous) {
      const gapMs = k.t - previous.t;
      if (gapMs > 0 && gapMs <= MAX_GAP_MS) {
        out.push({ target, previous: targetOf(previous), gapMs });
      }
    }
    previous = k;
  }
  return out;
}

/**
 * The character a keystroke was aiming for. A remapped layout emits clusters,
 * so the passage's own character is the meaningful unit to attribute time to.
 */
function targetOf(k: Keystroke): string {
  return isTypedChar(k.expected) ? k.expected : k.key.slice(0, 1);
}

function meanOf(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length;
}

function round(n: number): number {
  return Math.round(n);
}

/** Aggregate `gapMs` by a caller-chosen bucket, then rank slowest first. */
function rankByMean<T>(
  items: Interval[],
  keyOf: (i: Interval) => string | null,
  build: (bucket: string, count: number, meanMs: number) => T,
  minCount: number,
  limit: number,
): T[] {
  const groups = new Map<string, number[]>();
  for (const i of items) {
    const bucket = keyOf(i);
    if (bucket === null) continue;
    const list = groups.get(bucket);
    if (list) list.push(i.gapMs);
    else groups.set(bucket, [i.gapMs]);
  }
  return [...groups.entries()]
    .filter(([, gaps]) => gaps.length >= minCount)
    .map(([bucket, gaps]) => ({ bucket, count: gaps.length, meanMs: meanOf(gaps) }))
    .sort((a, b) => b.meanMs - a.meanMs)
    .slice(0, limit)
    .map((g) => build(g.bucket, g.count, round(g.meanMs)));
}

/** Slowest individual characters, ignoring keys with too few samples to trust. */
export function slowKeys(keystrokes: Keystroke[], limit = 12, minCount = 3): KeyTiming[] {
  return rankByMean(
    intervals(keystrokes),
    (i) => i.target,
    (key, count, meanMs) => ({ key, count, meanMs }),
    minCount,
    limit,
  );
}

/** Slowest two-character transitions — the pairs that actually cost time. */
export function slowDigraphs(keystrokes: Keystroke[], limit = 10, minCount = 3): DigraphTiming[] {
  // Any character the user can type would collide with a digraph that
  // contains it (a space, most of all), so the delimiter is one that cannot
  // appear in typed text. Written as an escape — never a raw byte.
  const SEP = '\u0000';
  return rankByMean(
    intervals(keystrokes),
    (i) => `${i.previous}${SEP}${i.target}`,
    (bucket, count, meanMs) => {
      const [from = '', to = ''] = bucket.split(SEP);
      return { from, to, count, meanMs };
    },
    minCount,
    limit,
  );
}

/** Mean time-to-press per finger, using the QWERTY finger assignment. */
export function fingerTimings(keystrokes: Keystroke[]): FingerTiming[] {
  return rankByMean(
    intervals(keystrokes),
    (i) => keyForChar(i.target)?.finger ?? null,
    (finger, count, meanMs) => ({ finger: finger as Finger, count, meanMs }),
    1,
    Infinity,
  );
}

/**
 * Evenness of the typing beat. Erratic rhythm — bursts then stalls — is what
 * separates a plateaued typist from a fast one, and accuracy never shows it.
 */
export function rhythm(keystrokes: Keystroke[]): Rhythm {
  const gaps = intervals(keystrokes).map((i) => i.gapMs);
  if (gaps.length < 2) return { meanMs: 0, stdDevMs: 0, consistency: 0 };
  const mean = meanOf(gaps);
  const variance = meanOf(gaps.map((g) => (g - mean) ** 2));
  const stdDev = Math.sqrt(variance);
  // Coefficient of variation, inverted into a 0–100 score.
  const consistency = mean === 0 ? 0 : Math.max(0, Math.min(100, 100 - (stdDev / mean) * 100));
  return { meanMs: round(mean), stdDevMs: round(stdDev), consistency: round(consistency) };
}

/** Effective characters-per-minute implied by the typing gaps alone. */
export function burstCpm(keystrokes: Keystroke[]): number {
  const mean = meanOf(intervals(keystrokes).map((i) => i.gapMs));
  return mean === 0 ? 0 : round(60_000 / mean);
}
