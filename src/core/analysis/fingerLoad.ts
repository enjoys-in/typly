/**
 * What each finger actually did — presses, distance travelled, and errors.
 *
 * A plateau at 35 WPM is usually mechanical: the right hand doing 60% of the
 * work, or a pinky reaching for keys the ring finger should have. No amount of
 * "practice more" fixes that, and nothing else in the app shows it, because
 * `weakKeys` counts characters rather than the hands that produced them.
 *
 * Distance is measured on the physical key grid (`keyGeometry`) in key widths,
 * which is unit-free but proportional to real travel — the comparison between
 * fingers is what matters, not the absolute centimetres.
 */

import type { Keystroke } from '../types';
import { KEY_ROWS, keyForChar, type Finger, type Key } from '../keyboard/layout';

export type Hand = 'left' | 'right';

export interface FingerStat {
  finger: Finger;
  hand: Hand;
  presses: number;
  /** Share of all presses, 0–100. */
  share: number;
  /** Travel in key widths, from each press to the next on the same finger. */
  travel: number;
  errors: number;
  /** Errors as a share of this finger's own presses, 0–100. */
  errorRate: number;
}

export interface FingerLoad {
  fingers: FingerStat[];
  /** Share of presses taken by each hand, 0–100. */
  leftShare: number;
  rightShare: number;
  /** The finger carrying more than its fair share, if one clearly is. */
  overloaded: FingerStat | null;
  totalPresses: number;
}

/**
 * Home position per finger, and which hand it belongs to. The left hand owns
 * the keys left of the g/h seam; the index fingers' stretch keys stay with
 * their own hand, as a tutor teaches them.
 */
const HOME: Record<Finger, { key: string; hand: Hand }[]> = {
  pinky: [
    { key: 'a', hand: 'left' },
    { key: ';', hand: 'right' },
  ],
  ring: [
    { key: 's', hand: 'left' },
    { key: 'l', hand: 'right' },
  ],
  middle: [
    { key: 'd', hand: 'left' },
    { key: 'k', hand: 'right' },
  ],
  index: [
    { key: 'f', hand: 'left' },
    { key: 'j', hand: 'right' },
  ],
  thumb: [{ key: ' ', hand: 'left' }],
};

/** Column/row centre of every key, so travel between two keys is measurable. */
const GEOMETRY: Map<string, { x: number; y: number }> = buildGeometry();

function buildGeometry(): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  KEY_ROWS.forEach((row, y) => {
    // Rows are staggered by roughly a quarter key each, as on a real board.
    let x = y * 0.25;
    for (const key of row) {
      map.set(key.id, { x: x + key.width / 2, y });
      x += key.width;
    }
  });
  return map;
}

/** Which hand a key sits under, from its distance to each home position. */
function handFor(key: Key): Hand {
  const homes = HOME[key.finger];
  if (homes.length === 1) return homes[0]!.hand;
  const pos = GEOMETRY.get(key.id);
  if (!pos) return 'left';
  let best: Hand = 'left';
  let bestGap = Infinity;
  for (const home of homes) {
    const homePos = GEOMETRY.get(home.key);
    if (!homePos) continue;
    const gap = Math.abs(pos.x - homePos.x);
    if (gap < bestGap) {
      bestGap = gap;
      best = home.hand;
    }
  }
  return best;
}

function distance(from: string, to: string): number {
  const a = GEOMETRY.get(from);
  const b = GEOMETRY.get(to);
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Presses, travel and errors per finger over a keystroke log. */
export function fingerLoad(keystrokes: Keystroke[]): FingerLoad {
  const stats = new Map<string, FingerStat>();
  // Where each finger last was, so travel accumulates per finger rather than
  // as one path across the whole board.
  const lastKey = new Map<string, string>();
  let total = 0;

  for (const stroke of keystrokes) {
    if (stroke.key.length !== 1) continue;
    const key = keyForChar(stroke.key);
    if (!key) continue;
    const hand = handFor(key);
    const id = `${hand}:${key.finger}`;
    const stat =
      stats.get(id) ??
      ({ finger: key.finger, hand, presses: 0, share: 0, travel: 0, errors: 0, errorRate: 0 } as FingerStat);

    const previous = lastKey.get(id);
    if (previous) stat.travel += distance(previous, key.id);
    lastKey.set(id, key.id);

    stat.presses++;
    if (!stroke.correct) stat.errors++;
    stats.set(id, stat);
    total++;
  }

  const fingers = [...stats.values()]
    .map((stat) => ({
      ...stat,
      share: total ? round1((stat.presses / total) * 100) : 0,
      travel: round1(stat.travel),
      errorRate: stat.presses ? round1((stat.errors / stat.presses) * 100) : 0,
    }))
    .sort((a, b) => b.presses - a.presses);

  const share = (hand: Hand) =>
    round1(fingers.filter((f) => f.hand === hand).reduce((sum, f) => sum + f.share, 0));

  // "Overloaded" only means anything against an even split. With n fingers in
  // play, a fair share is 100/n; half again as much is worth naming.
  const fair = fingers.length ? 100 / fingers.length : 0;
  const overloaded =
    fingers.find((f) => f.finger !== 'thumb' && f.share > fair * 1.5) ?? null;

  return {
    fingers,
    leftShare: share('left'),
    rightShare: share('right'),
    overloaded,
    totalPresses: total,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
