/**
 * Exam-hall nerves, on purpose.
 *
 * People lose five to eight WPM on the day to things that have nothing to do
 * with typing: a clock they cannot stop watching, a hall full of other people's
 * keyboards, the sense that everyone else is further ahead. None of that can be
 * rehearsed in a quiet room with a calm interface, so this adds it back — every
 * distraction opt-in, and every one modelled on something that is really there.
 */

/** Seconds left at which the clock starts flashing, as the invigilator's call. */
export const FLASH_AT_SECONDS = 120;
/** And again, harder, at the last stretch. */
export const FLASH_URGENT_SECONDS = 30;

export type ClockAlarm = 'calm' | 'warning' | 'urgent';

export function clockAlarm(remainingSec: number): ClockAlarm {
  if (remainingSec <= FLASH_URGENT_SECONDS) return 'urgent';
  if (remainingSec <= FLASH_AT_SECONDS) return 'warning';
  return 'calm';
}

export interface RankTick {
  /** Position among the notional hall, 1-based. */
  rank: number;
  /** Candidates in the hall this rank is out of. */
  of: number;
  /** Movement since the last tick: positive is gaining ground. */
  moved: number;
}

/** Candidates in the notional hall — a plausible centre, not a real one. */
export const HALL_SIZE = 60;

/**
 * A rank ticker, derived from the typist's own pace rather than invented.
 *
 * The hall is modelled as a spread of speeds around the cut-off, so the rank
 * responds honestly to how the run is going: type faster and you climb. It is
 * pressure, not a leaderboard, and it is deterministic — the same run always
 * produces the same rank, so nobody is chasing a random number.
 */
export function rankFor(currentWpm: number, targetWpm: number, previousRank?: number): RankTick {
  // Rivals are spread ±40% around the cut-off; where the typist sits in that
  // spread is their percentile, and the rank follows from it.
  const floor = targetWpm * 0.6;
  const ceiling = targetWpm * 1.4;
  const share = ceiling > floor ? (currentWpm - floor) / (ceiling - floor) : 0.5;
  const beaten = Math.round(clamp(share, 0, 1) * (HALL_SIZE - 1));
  const rank = HALL_SIZE - beaten;
  return { rank, of: HALL_SIZE, moved: previousRank === undefined ? 0 : previousRank - rank };
}

/** Ambient hall noise, as a data URI-free synthesis recipe the sound port plays. */
export interface HallNoise {
  /** How loud, 0–1. Low by default: it has to be ignorable to be realistic. */
  volume: number;
  /** Keystrokes per second across the whole notional hall. */
  density: number;
}

export const HALL_NOISE: HallNoise = { volume: 0.12, density: 9 };

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
