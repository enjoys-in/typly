/** Which part of the day it is, for how the app greets you. */
export type Daypart = 'lateNight' | 'morning' | 'afternoon' | 'evening' | 'night';

export interface Greeting {
  daypart: Daypart;
  /** True when the last practice was a day or more ago. */
  returning: boolean;
}

/** Hours a daypart starts at, latest first, so the first match wins. */
const BANDS: { from: number; daypart: Daypart }[] = [
  { from: 21, daypart: 'night' },
  { from: 17, daypart: 'evening' },
  { from: 12, daypart: 'afternoon' },
  { from: 5, daypart: 'morning' },
  { from: 0, daypart: 'lateNight' },
];

const DAY_MS = 86_400_000;

export function daypartOf(now: Date): Daypart {
  const hour = now.getHours();
  return BANDS.find((band) => hour >= band.from)?.daypart ?? 'morning';
}

/**
 * The greeting for a moment in time. Returns data, not a sentence, so the
 * wording lives with the rest of the interface copy and can be translated.
 *
 * `lastPracticedAt` is the most recent attempt, if there is one.
 */
export function greetingFor(now: Date, lastPracticedAt?: string | null): Greeting {
  const last = lastPracticedAt ? new Date(lastPracticedAt).getTime() : NaN;
  const returning = Number.isFinite(last) && now.getTime() - last >= DAY_MS;
  return { daypart: daypartOf(now), returning };
}
