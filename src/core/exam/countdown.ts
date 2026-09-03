import { profileFor, shortNameFor } from '../scoring/examProfiles';
import type { ReminderCountdown } from '../reminder/schedule';
import { readinessFor, type AttemptSample } from './readiness';
import { parseTarget } from './target';

/**
 * The exam countdown a reminder should carry, from stored settings and history.
 *
 * Both reminder timers need exactly this — the web one in the renderer and the
 * desktop one in the main process — so the assembly lives here rather than
 * twice, and neither has to know how a target is stored.
 */
export function countdownFrom(
  rawTarget: string | null,
  rows: AttemptSample[],
  now = new Date(),
): ReminderCountdown | null {
  const target = parseTarget(rawTarget);
  if (!target) return null;
  const profile = profileFor(target.board);
  const readiness = readinessFor(target, profile, rows, now);
  return {
    daysLeft: readiness.daysLeft,
    examName: shortNameFor(target.board),
    wpmGap: readiness.wpmGap,
  };
}
