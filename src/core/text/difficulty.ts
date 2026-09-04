/**
 * How hard a passage is to type, and whether it suits the typist in front of it.
 *
 * `textStats` already measures everything needed; nothing was drawing a
 * conclusion from it. So imported text arrives unranked and people practise on
 * material that is wrong for them — a beginner grinding a legal notice full of
 * semicolons, or someone at 55 WPM coasting on simple prose — without ever
 * being told that is what is happening.
 *
 * The score is a weighted blend of five things that genuinely slow typing down,
 * not a readability index: readability is about comprehension, and a passage can
 * be trivial to read and horrible to type.
 */

import { PassageBand, PASSAGE_BANDS } from '../constants';
import { textStats, type TextStats } from './textStats';

export interface PassageDifficulty {
  /** 0–100, where 50 is ordinary exam prose. */
  score: number;
  band: PassageBand;
  /** What pushed the score up, heaviest first — the explanation of the number. */
  factors: DifficultyFactor[];
  /** Net WPM a typist needs before this passage stops being the obstacle. */
  suitedForWpm: number;
}

export interface DifficultyFactor {
  id: 'wordLength' | 'punctuation' | 'capitals' | 'digits' | 'rareLetters';
  /** This factor's own 0–100 reading. */
  value: number;
  /** Its share of the final score, 0–100. */
  weight: number;
}

/**
 * Weights, and the value each factor is measured against. A passage sitting at
 * every reference point scores 50 — deliberately, so "moderate" means "normal
 * exam prose" rather than "middle of an arbitrary scale".
 */
const FACTORS: { id: DifficultyFactor['id']; weight: number; reference: number }[] = [
  // Long words mean fewer spaces, and the space is a typist's rest.
  { id: 'wordLength', weight: 0.3, reference: 4.7 },
  // Every mark is a reach off the home rows, usually with Shift.
  { id: 'punctuation', weight: 0.25, reference: 4 },
  { id: 'capitals', weight: 0.15, reference: 2.5 },
  // Digits are the top row, which most exam typists barely practise.
  { id: 'digits', weight: 0.15, reference: 1 },
  // q, z, x, j: the slowest keys on the board for almost everyone.
  { id: 'rareLetters', weight: 0.15, reference: 1.5 },
];

const RARE = /[qzxjkv]/gi;

/** Per-hundred-character rate of a raw count, which is what the references are in. */
function per100(count: number, chars: number): number {
  return chars > 0 ? (count / chars) * 100 : 0;
}

export function rateDifficulty(text: string, stats: TextStats = textStats(text)): PassageDifficulty {
  const chars = Math.max(stats.chars, 1);
  const measured: Record<DifficultyFactor['id'], number> = {
    wordLength: stats.avgWordLen,
    punctuation: per100(stats.punctuation, chars),
    capitals: per100(stats.uppercase, chars),
    digits: per100(stats.digits, chars),
    rareLetters: per100(text.match(RARE)?.length ?? 0, chars),
  };

  const factors: DifficultyFactor[] = FACTORS.map(({ id, weight, reference }) => ({
    id,
    // Halfway to the reference is 25, at it is 50, twice it is capped at 100.
    value: clamp(Math.round((measured[id] / reference) * 50), 0, 100),
    weight: Math.round(weight * 100),
  }));

  const score = clamp(
    Math.round(
      FACTORS.reduce((sum, f, i) => sum + (factors[i]?.value ?? 0) * f.weight, 0),
    ),
    0,
    100,
  );

  return {
    score,
    band: bandFor(score),
    factors: [...factors].sort((a, b) => b.value * b.weight - a.value * a.weight),
    suitedForWpm: suitedWpm(score),
  };
}

/** Five equal bands over the score. */
export function bandFor(score: number): PassageBand {
  const index = clamp(Math.floor(score / 20), 0, PASSAGE_BANDS.length - 1);
  return PASSAGE_BANDS[index]!;
}

/**
 * The speed at which a passage of this difficulty stops holding you back.
 * Very easy text suits a beginner at 20 WPM; the hardest is only worth
 * practising once the mechanics are already there, around 60.
 */
function suitedWpm(score: number): number {
  return Math.round(20 + (score / 100) * 40);
}

export type Fit = 'tooEasy' | 'matched' | 'tooHard';

export interface PassageFit {
  fit: Fit;
  difficulty: PassageDifficulty;
  /** The typist's current net WPM this was judged against. */
  currentWpm: number;
  /** How far off the match is, in WPM. Zero when matched. */
  gap: number;
}

/** WPM either side of `suitedForWpm` that still counts as the right level. */
const FIT_TOLERANCE = 8;

/**
 * Whether this passage suits a typist at `currentWpm`. With no history there is
 * nothing to compare against, so everything reads as matched rather than
 * inventing a judgement.
 */
export function fitFor(text: string, currentWpm: number): PassageFit {
  const difficulty = rateDifficulty(text);
  if (currentWpm <= 0) {
    return { fit: 'matched', difficulty, currentWpm, gap: 0 };
  }
  const gap = currentWpm - difficulty.suitedForWpm;
  const fit: Fit = gap > FIT_TOLERANCE ? 'tooEasy' : gap < -FIT_TOLERANCE ? 'tooHard' : 'matched';
  return { fit, difficulty, currentWpm, gap: fit === 'matched' ? 0 : Math.round(gap) };
}

export interface RatedPassage<T> {
  item: T;
  difficulty: PassageDifficulty;
  /** Absolute distance from the ideal level for this typist. */
  distance: number;
}

/**
 * Rate a set of passages and order them by how well each suits `currentWpm` —
 * the recommendation half of the feature. Ties break toward the easier passage,
 * because practising slightly below your level beats practising above it.
 */
export function rankForTypist<T>(
  items: T[],
  contentOf: (item: T) => string,
  currentWpm: number,
): RatedPassage<T>[] {
  return items
    .map((item) => {
      const difficulty = rateDifficulty(contentOf(item));
      return {
        item,
        difficulty,
        distance: Math.abs(difficulty.suitedForWpm - Math.max(currentWpm, 20)),
      };
    })
    .sort((a, b) => a.distance - b.distance || a.difficulty.score - b.difficulty.score);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
