/**
 * Dictation at a controlled speed — the half of the Stenographer skill test
 * nobody serves.
 *
 * The real test is not a typing test: a passage is *read aloud* at 80 or 100
 * words per minute, and only then is it transcribed against the clock. The app
 * already has a speech port and exam profiles that model rules, so the missing
 * piece is pacing: speech engines have their own idea of how fast to talk, and
 * `rate` is a vague multiplier rather than a words-per-minute setting.
 *
 * So the passage is cut into short chunks and each one is *scheduled*. The rate
 * gets the voice roughly right; the gap between chunks corrects whatever drift
 * is left, measured against the wall clock. Over a ten-minute dictation that
 * keeps the delivered speed on target even though no engine reports its own.
 */

import {
  DICTATION_CHUNK_WORDS,
  TTS_BASE_WPM,
  TTS_RATE_MAX,
  TTS_RATE_MIN,
} from '../constants';

export interface DictationChunk {
  /** Chunk index, 0-based. */
  index: number;
  text: string;
  /** Words in this chunk, as the pace arithmetic counts them. */
  words: number;
  /** Milliseconds from the start of the dictation this chunk should begin at. */
  startMs: number;
}

export interface DictationPlan {
  chunks: DictationChunk[];
  /** Words the whole passage counts as. */
  words: number;
  /** Speech rate to hand the voice, already clamped to what stays intelligible. */
  rate: number;
  /** How long the dictation will take, at the requested speed. */
  totalMs: number;
  /** The speed asked for, for the label. */
  wpm: number;
}

/**
 * Cut a passage into chunks of roughly `chunkWords`, breaking at sentence ends
 * where one is close by. A voice that pauses mid-clause is hard to follow, and
 * following it is the whole skill being tested.
 */
function chunkPassage(passage: string, chunkWords = DICTATION_CHUNK_WORDS): string[] {
  const words = passage.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  let current: string[] = [];
  for (const word of words) {
    current.push(word);
    const atLimit = current.length >= chunkWords;
    // Two thirds of the way in, a sentence end is a better break than the limit.
    const atSentence = current.length >= Math.ceil(chunkWords * 0.66) && /[.!?।]$/.test(word);
    if (atLimit || atSentence) {
      chunks.push(current.join(' '));
      current = [];
    }
  }
  if (current.length > 0) chunks.push(current.join(' '));
  return chunks;
}

/**
 * The schedule for one dictation. Chunk start times are cumulative at the
 * requested words per minute, so a chunk the voice rushed is followed by a
 * longer gap and the passage as a whole still lands on time.
 */
export function planDictation(
  passage: string,
  wpm: number,
  chunkWords = DICTATION_CHUNK_WORDS,
): DictationPlan {
  const texts = chunkPassage(passage, chunkWords);
  const msPerWord = wpm > 0 ? 60_000 / wpm : 0;

  let startMs = 0;
  const chunks: DictationChunk[] = texts.map((text, index) => {
    const words = text.split(/\s+/).filter(Boolean).length;
    const chunk: DictationChunk = { index, text, words, startMs };
    startMs += words * msPerWord;
    return chunk;
  });

  return {
    chunks,
    words: chunks.reduce((sum, c) => sum + c.words, 0),
    rate: rateFor(wpm),
    totalMs: Math.round(startMs),
    wpm,
  };
}

/**
 * The `rate` a target speed needs. Clamped: below 0.4 voices smear their
 * consonants and above 2.5 they are unintelligible, so a target outside that
 * is delivered by the chunk gaps instead of by an unusable voice.
 */
export function rateFor(wpm: number): number {
  const raw = wpm / TTS_BASE_WPM;
  return Math.min(TTS_RATE_MAX, Math.max(TTS_RATE_MIN, round2(raw)));
}

/** Which chunk should be sounding at `elapsedMs`, or null before the first. */
export function chunkAt(plan: DictationPlan, elapsedMs: number): DictationChunk | null {
  let found: DictationChunk | null = null;
  for (const chunk of plan.chunks) {
    if (chunk.startMs <= elapsedMs) found = chunk;
    else break;
  }
  return found;
}

/** Progress through the dictation, 0–100. */
export function dictationProgress(plan: DictationPlan, elapsedMs: number): number {
  if (plan.totalMs <= 0) return 100;
  return Math.min(100, Math.round((elapsedMs / plan.totalMs) * 100));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
