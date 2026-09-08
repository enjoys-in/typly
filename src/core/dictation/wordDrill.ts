/**
 * Dictation practice over the words you actually get wrong.
 *
 * The Trainer can already tell you *that* you keep missing a word, and the
 * review queue can schedule it — but every drill it builds puts the word on
 * screen for you to copy. Copying is not the skill that fails in an exam. What
 * fails is hearing or reading a word away from the keyboard and producing its
 * spelling from memory, which is why a candidate who types `government` clean
 * off a screen still writes `goverment` when the passage is on the desk beside
 * them or being read aloud.
 *
 * So this is the same weakness list, delivered the other way round: one word at
 * a time, on its own, against a clock short enough that there is no time to
 * reconstruct the spelling from the passage it came out of. Nothing here is a
 * separate deck to curate — the queue *is* the mistake history, so every fresh
 * slip enrols itself, and every answer feeds back into the same Leitner ladder
 * the review queue runs on. Get it right and it climbs; miss it and it drops
 * and returns tomorrow.
 *
 * Pure: no storage and no clock. The hook owns both.
 */

import type { ReviewItem } from '../review/review';

export interface DrillWord {
  word: string;
  /**
   * The review card this word came from, so an answer can be graded back into
   * the ladder. Null for a word taken straight from the mistake history that
   * has no card yet — it is still worth drilling, it just has no schedule.
   */
  cardId: string | null;
  /** Times it has been missed in this session. */
  misses: number;
}

export interface DrillAnswer {
  word: string;
  typed: string;
  correct: boolean;
  cardId: string | null;
}

export interface DrillSession {
  /** Words still to come, current one first. */
  queue: DrillWord[];
  /** Every answer given, in the order it was given. */
  answers: DrillAnswer[];
}

export interface DrillStats {
  /** Distinct words in the session. Fixed once the batch is built. */
  words: number;
  /** Distinct words that have had their first answer. */
  answered: number;
  /** Words answered right first time. */
  correct: number;
  /** Answers given, including second attempts. */
  attempts: number;
  /** Share of first attempts that were right, 0–100. */
  accuracy: number;
  /** Words still to answer, second chances included. */
  remaining: number;
}

/**
 * A word may come back once after a miss, and only once.
 *
 * The gap is the part that does the work — re-drilling a word ten seconds later
 * tests short-term memory and nothing else — so the real repetition is the next
 * day's, scheduled by the ladder. One immediate retry is worth having anyway:
 * it separates "cannot spell this" from "ran out of clock", and typing the word
 * correctly once while the correction is still on screen is how it lands.
 */
const MAX_RETRIES = 1;

/** Punctuation carried over from the passage, never part of the answer. */
const EDGE_PUNCTUATION = /^[\s"'“”‘’(),.;:!?।—–-]+|[\s"'“”‘’(),.;:!?।—–-]+$/g;

/**
 * What two spellings have to share to count as the same answer.
 *
 * Case is dropped because the word list does not agree with itself about it — a
 * card reading `india` must not fail an answer of `India`. Edge punctuation
 * goes for the same reason: the mistake history stores words as they appeared
 * in a passage, commas and all, and the comma is not the thing being drilled.
 */
export function normalizeAnswer(value: string): string {
  return value.replace(EDGE_PUNCTUATION, '').replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function answerMatches(word: string, typed: string): boolean {
  const expected = normalizeAnswer(word);
  return expected.length > 0 && expected === normalizeAnswer(typed);
}

/** A word worth dictating: one token, long enough that spelling it is a test. */
export function drillable(word: string): boolean {
  const clean = normalizeAnswer(word);
  // Single tokens only. A mistake spanning two words is a real mistake, but
  // dictating "of the" tests nothing and cannot be marked fairly.
  return clean.length >= 3 && !clean.includes(' ');
}

/**
 * A copy of `items` in random order (Fisher-Yates).
 *
 * Only ever applied to a batch that has already been *chosen*, never to the
 * choosing: shuffling the candidates would let a random draw push out the cards
 * the ladder says are due today, which is the one ordering that is not
 * arbitrary.
 */
function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/**
 * Build a session.
 *
 * Due cards come first — the ladder has already decided those are today's work.
 * Whatever is left of the batch is filled from the rest of the deck and then
 * from raw mistake history, so a user whose cards are all resting still gets a
 * drill rather than an empty screen.
 *
 * `shuffle` then scrambles the chosen batch. It is on by default because the
 * unshuffled order is the same every sitting — hardest first, longest-overdue
 * first — and a batch you have seen in that order three times is a batch you
 * are partly typing from position rather than from spelling.
 */
export function buildSession(
  due: ReviewItem[],
  cards: ReviewItem[],
  mistakeWords: string[],
  limit: number,
  shuffle = false,
): DrillSession {
  const queue: DrillWord[] = [];
  const seen = new Set<string>();

  const add = (word: string, cardId: string | null) => {
    if (queue.length >= limit || !drillable(word)) return;
    const key = normalizeAnswer(word);
    if (seen.has(key)) return;
    seen.add(key);
    queue.push({ word, cardId, misses: 0 });
  };

  const words = (items: ReviewItem[]) => items.filter((i) => i.kind === 'word');
  for (const item of words(due)) add(item.value, item.id);
  for (const item of words(cards)) add(item.value, item.id);
  for (const word of mistakeWords) add(word, null);

  return { queue: shuffle ? shuffled(queue) : queue, answers: [] };
}

/** The word being dictated, or null once the session is over. */
export function currentWord(session: DrillSession): DrillWord | null {
  return session.queue[0] ?? null;
}

export interface GradedAnswer {
  session: DrillSession;
  correct: boolean;
  /** The word that was being asked, so the caller can show it after a miss. */
  word: string;
  /** True when the miss put the word back in the queue for one more go. */
  retrying: boolean;
}

/**
 * Mark an answer and move on.
 *
 * A retry is appended to the *end* of the queue rather than kept in place, so
 * the other words of the batch come between the two attempts.
 */
export function gradeAnswer(session: DrillSession, typed: string): GradedAnswer {
  const current = currentWord(session);
  // Nothing left to grade: hand back the session untouched rather than
  // inventing an answer, so a double submit cannot score twice.
  if (!current) return { session, correct: false, word: '', retrying: false };

  const correct = answerMatches(current.word, typed);
  const rest = session.queue.slice(1);
  const retrying = !correct && current.misses < MAX_RETRIES;

  return {
    session: {
      queue: retrying ? [...rest, { ...current, misses: current.misses + 1 }] : rest,
      answers: [
        ...session.answers,
        { word: current.word, typed, correct, cardId: current.cardId },
      ],
    },
    correct,
    word: current.word,
    retrying,
  };
}

/** Give up on the current word: counted as a miss, with no retry. */
export function skipWord(session: DrillSession): GradedAnswer {
  const current = currentWord(session);
  if (!current) return { session, correct: false, word: '', retrying: false };
  return {
    session: {
      queue: session.queue.slice(1),
      answers: [
        ...session.answers,
        { word: current.word, typed: '', correct: false, cardId: current.cardId },
      ],
    },
    correct: false,
    word: current.word,
    retrying: false,
  };
}

export function finished(session: DrillSession): boolean {
  return session.queue.length === 0 && session.answers.length > 0;
}

/**
 * The session's numbers, counted over *first* attempts.
 *
 * A word got right on the retry is not a word you can spell — grading the
 * second attempt would turn the drill into a participation score, which is the
 * same trap the review queue avoids by only promoting cards that were due.
 */
export function sessionStats(session: DrillSession): DrillStats {
  const first = new Map<string, DrillAnswer>();
  for (const answer of session.answers) {
    const key = normalizeAnswer(answer.word);
    if (!first.has(key)) first.set(key, answer);
  }
  const words = first.size + session.queue.filter((w) => w.misses === 0).length;
  const correct = [...first.values()].filter((a) => a.correct).length;
  return {
    words,
    answered: first.size,
    correct,
    attempts: session.answers.length,
    accuracy: first.size > 0 ? Math.round((correct / first.size) * 100) : 0,
    remaining: session.queue.length,
  };
}

/**
 * Which cards the session passed and which it failed, by card id.
 *
 * A word is passed only if its *first* attempt was right, for the reason above.
 * A word with no card is dropped here rather than invented into one: enrolment
 * belongs to the mistake history, which will pick it up on its own.
 */
export function drillVerdicts(session: DrillSession): { passed: string[]; failed: string[] } {
  const seen = new Set<string>();
  const passed: string[] = [];
  const failed: string[] = [];
  for (const answer of session.answers) {
    if (!answer.cardId || seen.has(answer.cardId)) continue;
    seen.add(answer.cardId);
    (answer.correct ? passed : failed).push(answer.cardId);
  }
  return { passed, failed };
}

/** Where one word of the batch stands, for the line view. */
export type DrillWordState = 'right' | 'wrong' | 'current' | 'pending';

export interface DrillLineItem {
  word: string;
  state: DrillWordState;
  /** Stable across renders, and unique even when a retry repeats a word. */
  key: string;
}

/**
 * The whole batch on one line: what has been answered, what is being typed, and
 * what is still coming.
 *
 * Answered words are listed in the order they were answered rather than in
 * their original slots, so the line reads strictly left to right and the caret
 * never jumps backwards. A word that was missed therefore appears twice — once
 * behind you in red, once ahead of you as the retry — which is the truth of
 * what the queue is going to do.
 */
export function lineup(session: DrillSession): DrillLineItem[] {
  const done: DrillLineItem[] = session.answers.map((answer, i) => ({
    word: answer.word,
    state: answer.correct ? 'right' : 'wrong',
    key: `a${i}-${answer.word}`,
  }));
  const todo: DrillLineItem[] = session.queue.map((item, i) => ({
    word: item.word,
    state: i === 0 ? 'current' : 'pending',
    key: `q${i}-${item.word}-${item.misses}`,
  }));
  return [...done, ...todo];
}

/** The words this session got wrong, for the summary. */
export function missedWords(session: DrillSession): DrillAnswer[] {
  const out: DrillAnswer[] = [];
  const seen = new Set<string>();
  for (const answer of session.answers) {
    const key = normalizeAnswer(answer.word);
    if (answer.correct || seen.has(key)) continue;
    seen.add(key);
    out.push(answer);
  }
  return out;
}
