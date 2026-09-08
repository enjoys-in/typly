import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import { weakWords } from '@/core/analysis/analysis';
import {
  buildSession,
  currentWord,
  drillVerdicts,
  finished as isFinished,
  gradeAnswer,
  lineup,
  missedWords,
  sessionStats,
  skipWord,
  type DrillAnswer,
  type DrillLineItem,
  type DrillSession,
  type DrillStats,
} from '@/core/dictation/wordDrill';
import { dueItems, gradeCards, type ReviewDeck } from '@/core/review/review';
import { readDeck, writeDeck } from '@/core/review/store';
import { useAsync } from './useAsync';

/** How the drill is run. Everything here is a user setting. */
export interface DrillOptions {
  /** Hold each word to a clock. */
  timed: boolean;
  /** Seconds one word gets, when the clock is on. */
  limitSec: number;
  /** Scramble the batch instead of taking it hardest-first. */
  shuffle: boolean;
  /** Words in one batch. */
  words: number;
}

/** What the last answer did, so the screen can say so before moving on. */
export interface DrillFeedback {
  correct: boolean;
  /** The right spelling — shown after a miss, which is the teaching moment. */
  word: string;
  /** What was actually typed. Empty when the word was skipped or timed out. */
  typed: string;
  /** True when the word will come back once more later in the session. */
  retrying: boolean;
  /** True when the clock, not the user, ended the word. */
  timedOut: boolean;
}

export interface DictationDrillState {
  loading: boolean;
  /** The word being asked, or null when the session is over or empty. */
  word: string | null;
  /** The whole batch in reading order, for the line view. */
  line: DrillLineItem[];
  /** Position in the batch, for the counter. */
  index: number;
  stats: DrillStats;
  feedback: DrillFeedback | null;
  /** True while a miss is on screen: the clock waits until it is acknowledged. */
  holding: boolean;
  finished: boolean;
  /** Words this session got wrong, for the summary. */
  missed: DrillAnswer[];
  /** What is in the field. Owned here so the clock can mark it when time runs out. */
  typed: string;
  setTyped: (value: string) => void;
  /** Milliseconds left on the current word; the full limit when untimed. */
  remainingMs: number;
  /** The limit the countdown is drawn against. */
  limitMs: number;
  /** Mark whatever is in the field. */
  submit: () => void;
  /** Give up on this word: counted as a miss, and the spelling is shown. */
  skip: () => void;
  /** Acknowledge a miss and move to the next word. */
  next: () => void;
  /** A fresh batch, re-read from whatever the mistake history now holds. */
  restart: () => void;
}

const EMPTY: DrillSession = { queue: [], answers: [] };

/** How often the countdown is redrawn. Fine enough to animate, cheap enough to ignore. */
const TICK_MS = 100;

/**
 * Drives a word drill: builds the batch from your mistakes, shows one word at a
 * time against a clock, marks what you type, and writes the results back to the
 * review ladder.
 *
 * The clock is the point. Copying a word off a screen with unlimited time is
 * what every other screen in the app already does, and it is passed by people
 * who then misspell the same word in an exam — because in an exam the word gets
 * about three seconds and no second look. So the word is shown, the clock runs,
 * and running out is a miss like any other.
 *
 * The deck is written once, when the session ends, rather than after every
 * word. A drill is one sitting and a card should move once for it — and a
 * per-answer write would mean a session abandoned halfway had already demoted
 * words the user was about to get right on their second attempt.
 */
export function useDictationDrill(options: DrillOptions): DictationDrillState {
  const platform = usePlatform();
  const [session, setSession] = useState<DrillSession>(EMPTY);
  const [feedback, setFeedback] = useState<DrillFeedback | null>(null);
  const [typed, setTyped] = useState('');
  // When the current word runs out, or null when nothing is being timed.
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  // The deck as it was read, so the grade lands on the stored schedule rather
  // than on a deck rebuilt from a second read.
  const deckRef = useRef<ReviewDeck>({});
  // Guards the one write per session: the finishing effect re-runs on every
  // render that follows it.
  const saved = useRef(false);
  // Batch shape is read when a batch is *built*, never mid-session: changing
  // the size or the shuffle should not throw away the words you are part-way
  // through. It lands on the next batch instead.
  const shape = useRef(options);
  shape.current = options;

  const limitMs = Math.max(0, options.limitSec) * 1000;

  const source = useAsync(async () => {
    const deck = await readDeck((key) => platform.repo.getSetting(key));
    const mistakes = await platform.repo.aggregateMistakes();
    return {
      deck,
      due: dueItems(deck, new Date()),
      cards: Object.values(deck),
      // Beyond the deck, so a user whose cards are all resting still gets a
      // drill instead of an empty screen.
      words: weakWords(mistakes, shape.current.words * 3).map((w) => w.expected),
    };
  }, [platform]);

  // A new batch whenever the source data arrives — first load, or a restart.
  useEffect(() => {
    if (!source.data) return;
    deckRef.current = source.data.deck;
    saved.current = false;
    setSession(
      buildSession(
        source.data.due,
        source.data.cards,
        source.data.words,
        shape.current.words,
        shape.current.shuffle,
      ),
    );
    setFeedback(null);
    setTyped('');
  }, [source.data]);

  const stats = useMemo(() => sessionStats(session), [session]);
  const line = useMemo(() => lineup(session), [session]);
  const word = currentWord(session)?.word ?? null;
  const finished = isFinished(session);
  // A miss holds the drill: the correct spelling is on screen to be read, and
  // the clock must not be running while it is.
  const holding = feedback !== null && !feedback.correct && !finished;

  const grade = useCallback(
    (answer: string, timedOut: boolean) => {
      if (!currentWord(session)) return;
      const graded = gradeAnswer(session, answer);
      setSession(graded.session);
      setFeedback({
        correct: graded.correct,
        word: graded.word,
        typed: answer,
        retrying: graded.retrying,
        timedOut,
      });
      setTyped('');
    },
    [session],
  );

  const submit = useCallback(() => {
    if (holding) return;
    grade(typed, false);
  }, [holding, grade, typed]);

  const skip = useCallback(() => {
    if (holding || !currentWord(session)) return;
    const graded = skipWord(session);
    setSession(graded.session);
    setFeedback({
      correct: false,
      word: graded.word,
      typed: '',
      retrying: false,
      timedOut: false,
    });
    setTyped('');
  }, [holding, session]);

  // The latest expiry action, so the interval below can stay keyed on the
  // deadline alone instead of being torn down on every keystroke.
  const expire = useRef<() => void>(() => {});
  useEffect(() => {
    expire.current = () => {
      if (holding) return;
      grade(typed, true);
    };
  });

  // Start the clock on each word, and stop it whenever there is nothing to
  // time: no word left, a correction still on screen, or the limit switched off.
  useEffect(() => {
    if (!options.timed || !word || holding) {
      setDeadline(null);
      return;
    }
    setDeadline(Date.now() + limitMs);
  }, [options.timed, word, holding, limitMs]);

  useEffect(() => {
    if (deadline === null) {
      setRemainingMs(limitMs);
      return;
    }
    // Local to this interval, so a tick that lands between the timeout and the
    // re-render it causes cannot mark the same word twice.
    let fired = false;
    const tick = () => {
      const left = deadline - Date.now();
      setRemainingMs(Math.max(0, left));
      if (left > 0 || fired) return;
      fired = true;
      setDeadline(null);
      expire.current();
    };
    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [deadline, limitMs]);

  // The one write: promote what was spelled right, demote what was not.
  useEffect(() => {
    if (!finished || saved.current) return;
    saved.current = true;
    const verdicts = drillVerdicts(session);
    if (verdicts.passed.length === 0 && verdicts.failed.length === 0) return;
    const graded = gradeCards(deckRef.current, verdicts, new Date());
    void writeDeck((key, value) => platform.repo.setSetting(key, value), graded).catch(() => {});
  }, [finished, session, platform]);

  return {
    loading: source.loading,
    word,
    line,
    // Counts words, not attempts, so a retry does not push the counter past the
    // size of the batch.
    index: Math.min(stats.words, stats.answered + 1),
    stats,
    feedback,
    holding,
    finished,
    missed: missedWords(session),
    typed,
    setTyped,
    remainingMs,
    limitMs,
    submit,
    skip,
    next: () => setFeedback(null),
    restart: source.reload,
  };
}
