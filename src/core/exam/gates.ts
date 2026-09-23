/**
 * Where a run starts, and what stands between it and a running clock.
 *
 * A test can open on a rules briefing, a dictation, a reading window, a
 * count-in, or straight into typing, and which one it is depends on the exam
 * profile, on whether an interrupted attempt is being resumed, and on a
 * preference. That is four inputs deciding one of five answers, on the code
 * path where a mistake starts the timer before the candidate is ready — so it
 * lives here, as a pure function, rather than inline in the component that
 * renders each phase.
 */

/** Briefing → dictation → reading → count-in → typing. */
export type Phase = 'briefing' | 'dictation' | 'reading' | 'ready' | 'typing';

/** Only the parts of an ExamConfig that decide where a run opens. */
export interface GateConfig {
  /** The rules-and-cut-off screen before the passage. */
  briefing: boolean;
  /** The dictation stage, on the profiles that have one. */
  dictation: object | null;
  /** Seconds of reading time before the clock starts. */
  readingSec: number;
}

/**
 * The phase a run opens in.
 *
 * A resumed attempt skips the gates it has already been through — it has read
 * the briefing and had its reading time — but it does *not* skip the count-in:
 * that screen comes back with the timer already moving, which is precisely the
 * case the count-in exists for.
 */
export function initialPhase(config: GateConfig, resumed: boolean, countIn: boolean): Phase {
  if (resumed) return countIn ? 'ready' : 'typing';
  if (config.briefing) return 'briefing';
  if (config.dictation) return 'dictation';
  if (config.readingSec > 0) return 'reading';
  return countIn ? 'ready' : 'typing';
}
