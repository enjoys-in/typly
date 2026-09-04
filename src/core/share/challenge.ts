/**
 * Challenge files — peer competition with no backend at all.
 *
 * A `.typly` file is a passage plus the sender's score plus the rules they ran
 * under. A friend opens it (the extension and the `typly://` scheme are already
 * registered), types the same passage under the same settings, and gets a
 * head-to-head report. That is the entire feature: no accounts, no server, no
 * network — the file *is* the protocol.
 *
 * Which means the format has to be defensive. Anything opened here came from
 * outside the app, so every field is validated and clamped before it can reach
 * an ExamConfig, and nothing in it is allowed to decide anything but the run.
 */

import {
  CHALLENGE_VERSION,
  ExamBoard,
  isExamBoard,
  isLang,
  Lang,
  MAX_DURATION_MIN,
} from '../constants';

/** The sender's half of the head-to-head. */
export interface ChallengeScore {
  netWpm: number;
  accuracy: number;
  /** Display name, or empty when the sender did not give one. */
  name: string;
  /** ISO date the score was set. */
  setAt: string;
}

export interface Challenge {
  app: 'typly';
  kind: 'challenge';
  version: number;
  title: string;
  passage: string;
  lang: Lang;
  board: ExamBoard;
  durationSec: number;
  score: ChallengeScore;
}

/** A passage that would not fit an exam is not a challenge. */
const MAX_PASSAGE_CHARS = 60_000;
const MAX_TITLE_CHARS = 120;
const MAX_NAME_CHARS = 40;

export function buildChallenge(input: {
  title: string;
  passage: string;
  lang: Lang;
  board: ExamBoard;
  durationSec: number;
  netWpm: number;
  accuracy: number;
  name: string;
}): Challenge {
  return {
    app: 'typly',
    kind: 'challenge',
    version: CHALLENGE_VERSION,
    title: clip(input.title, MAX_TITLE_CHARS),
    passage: input.passage.slice(0, MAX_PASSAGE_CHARS),
    lang: input.lang,
    board: input.board,
    durationSec: input.durationSec,
    score: {
      netWpm: round1(input.netWpm),
      accuracy: round1(input.accuracy),
      name: clip(input.name, MAX_NAME_CHARS),
      setAt: new Date().toISOString(),
    },
  };
}

export function encodeChallenge(challenge: Challenge): string {
  return JSON.stringify(challenge, null, 2);
}

/**
 * Reads a `.typly` file. Returns null for anything that is not a challenge this
 * version understands — a malformed file is a file to ignore, not a reason to
 * throw at whoever double-clicked it.
 */
export function parseChallenge(raw: string): Challenge | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) return null;
  const c = value as Record<string, unknown>;
  if (c.app !== 'typly' || c.kind !== 'challenge') return null;
  if (typeof c.passage !== 'string' || c.passage.trim().length === 0) return null;

  const score = (typeof c.score === 'object' && c.score !== null ? c.score : {}) as Record<
    string,
    unknown
  >;

  return {
    app: 'typly',
    kind: 'challenge',
    version: typeof c.version === 'number' ? c.version : CHALLENGE_VERSION,
    title: clip(str(c.title) || 'Challenge', MAX_TITLE_CHARS),
    passage: c.passage.slice(0, MAX_PASSAGE_CHARS),
    lang: isLang(c.lang) ? c.lang : Lang.En,
    board: isExamBoard(c.board) ? c.board : ExamBoard.Custom,
    // Clamped to the app's own cap, so a hand-edited file cannot start a
    // three-day test.
    durationSec: clampSeconds(c.durationSec),
    score: {
      netWpm: round1(num(score.netWpm)),
      accuracy: clamp(round1(num(score.accuracy)), 0, 100),
      name: clip(str(score.name), MAX_NAME_CHARS),
      setAt: str(score.setAt) || new Date().toISOString(),
    },
  };
}

export interface HeadToHead {
  /** Positive when the challenger won on speed. */
  wpmLead: number;
  accuracyLead: number;
  /** Won on speed *and* not behind on accuracy — the honest reading of a win. */
  won: boolean;
}

export function headToHead(
  mine: { netWpm: number; accuracy: number },
  theirs: ChallengeScore,
): HeadToHead {
  const wpmLead = round1(mine.netWpm - theirs.netWpm);
  const accuracyLead = round1(mine.accuracy - theirs.accuracy);
  return { wpmLead, accuracyLead, won: wpmLead > 0 && accuracyLead >= 0 };
}

/** A filename that reads as an invitation in a chat app's file list. */
export function challengeFilename(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `typly-challenge-${slug || 'passage'}.typly`;
}

function clampSeconds(value: unknown): number {
  const seconds = Math.round(num(value));
  return clamp(seconds, 0, MAX_DURATION_MIN * 60);
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function clip(text: string, max: number): string {
  return text.trim().slice(0, max);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
