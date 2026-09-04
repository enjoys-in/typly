/**
 * Break nudges for a long session.
 *
 * Someone drilling two hours a day for eight months is running a real risk of
 * RSI and eye strain, and the app is the only thing that knows how long they
 * have been at it. Two prompts, both standard occupational-health advice:
 *
 * - 20-20-20: every twenty minutes, look twenty feet away for twenty seconds.
 * - Wrists and posture: every half hour, drop the shoulders and shake it out.
 *
 * They are offset from each other so they never arrive together, and neither
 * ever interrupts a run — a nudge that lands mid-passage would cost the very
 * attempt it was trying to protect.
 */

import {
  BREAK_EYE_MINUTES,
  BREAK_EYE_REST_SEC,
  BREAK_POSTURE_MINUTES,
} from '../constants';

export type BreakKind = 'eye' | 'posture';

export interface BreakInput {
  /** Minutes of continuous practice, however the caller measures it. */
  sessionMinutes: number;
  /** Minutes at which each kind last fired, so nothing repeats. */
  lastEyeMinute: number | null;
  lastPostureMinute: number | null;
  /** A run is in progress — nothing may be shown until it ends. */
  running: boolean;
  /** Every notification is being held. */
  dnd: boolean;
}

export interface BreakDecision {
  /** The nudge to show now, or null. */
  due: BreakKind | null;
  /** Minutes to record against the kind that fired. */
  atMinute: number;
  /** Minutes until the next nudge of either kind. */
  nextInMinutes: number;
}

/**
 * Whether a break is due. Pure and stateless: the caller keeps the two "last
 * fired" marks, which is what lets the same rule run from a React hook now and
 * from the desktop scheduler later without either owning the truth.
 */
export function decideBreak(input: BreakInput): BreakDecision {
  const minutes = Math.floor(input.sessionMinutes);
  const eyeDue = elapsedSince(minutes, input.lastEyeMinute) >= BREAK_EYE_MINUTES;
  const postureDue = elapsedSince(minutes, input.lastPostureMinute) >= BREAK_POSTURE_MINUTES;

  // Posture wins a tie: it is the rarer prompt, so deferring it would mean it
  // effectively never fires.
  const due = input.running || input.dnd ? null : postureDue ? 'posture' : eyeDue ? 'eye' : null;

  const nextEye = BREAK_EYE_MINUTES - elapsedSince(minutes, input.lastEyeMinute);
  const nextPosture = BREAK_POSTURE_MINUTES - elapsedSince(minutes, input.lastPostureMinute);

  return {
    due,
    atMinute: minutes,
    nextInMinutes: Math.max(0, Math.min(nextEye, nextPosture)),
  };
}

/** Minutes since a kind last fired; the whole session when it never has. */
function elapsedSince(minutes: number, last: number | null): number {
  return last === null ? minutes : minutes - last;
}

/**
 * Copy for each nudge, kept beside the rule the way `REMINDER_MESSAGE` is, so
 * the desktop scheduler and the in-app banner say exactly the same thing.
 */
export const BREAK_MESSAGE: Record<BreakKind, { title: string; body: string }> = {
  eye: {
    title: 'Look away for 20 seconds',
    body: `You have been typing for ${BREAK_EYE_MINUTES} minutes. Focus on something about 20 feet away for ${BREAK_EYE_REST_SEC} seconds — it resets your focusing muscles.`,
  },
  posture: {
    title: 'Wrists and shoulders',
    body: 'Drop your shoulders, straighten your wrists and shake your hands out for a moment. Months of daily drilling is where typing injuries come from.',
  },
};

/** How long the eye rest itself should last, for a countdown on the prompt. */
export const EYE_REST_SECONDS = BREAK_EYE_REST_SEC;
