import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import { weakWords } from '@/core/analysis/analysis';
import { rateFor } from '@/core/dictation/dictation';
import {
  buildSession,
  currentWord,
  drillVerdicts,
  finished as isFinished,
  gradeAnswer,
  missedWords,
  sessionStats,
  skipWord,
  type DrillAnswer,
  type DrillSession,
  type DrillStats,
} from '@/core/dictation/wordDrill';
import { dueItems, gradeCards, type ReviewDeck } from '@/core/review/review';
import { readDeck, writeDeck } from '@/core/review/store';
import {
  DICTATION_DRILL_REPLAYS,
  DICTATION_DRILL_WORDS,
  DICTATION_DRILL_WPM,
} from '@/core/constants';
import type { Lang } from '@/core/constants';
import { useAsync } from './useAsync';

/** What the last answer did, so the screen can say so before moving on. */
export interface DrillFeedback {
  correct: boolean;
  /** The right spelling — shown after a miss, which is the teaching moment. */
  word: string;
  /** What was actually typed. Empty when the word was skipped. */
  typed: string;
  /** True when the word will come back once more later in the session. */
  retrying: boolean;
}

export interface DictationDrillState {
  loading: boolean;
  /** True where the platform has no voice, so nothing can be dictated. */
  unsupported: boolean;
  /** The word being asked, or null when the session is over or empty. */
  word: string | null;
  /** Position in the batch, for the counter. */
  index: number;
  stats: DrillStats;
  feedback: DrillFeedback | null;
  /** True while a miss is on screen: the drill waits before speaking again. */
  holding: boolean;
  finished: boolean;
  /** Words this session got wrong, for the summary. */
  missed: DrillAnswer[];
  /** Replays left on the current word. */
  replaysLeft: number;
  /** Say the current word again. */
  replay: () => void;
  /** Mark an answer. */
  submit: (typed: string) => void;
  /** Give up on this word: counted as a miss, and the spelling is shown. */
  skip: () => void;
  /** Acknowledge a miss and move to the next word. */
  next: () => void;
  /** A fresh batch, re-read from whatever the mistake history now holds. */
  restart: () => void;
}

const EMPTY: DrillSession = { queue: [], answers: [] };

/**
 * Drives a dictation drill: builds the batch from your mistakes, speaks each
 * word, marks what you type, and writes the results back to the review ladder.
 *
 * The deck is written once, when the session ends, rather than after every
 * word. A drill is one sitting and a card should move once for it — and a
 * per-answer write would mean a session abandoned halfway had already demoted
 * words the user was about to get right on their second attempt.
 */
export function useDictationDrill(lang: Lang): DictationDrillState {
  const platform = usePlatform();
  const [session, setSession] = useState<DrillSession>(EMPTY);
  const [feedback, setFeedback] = useState<DrillFeedback | null>(null);
  const [replays, setReplays] = useState(0);
  // The deck as it was read, so the grade lands on the stored schedule rather
  // than on a deck rebuilt from a second read.
  const deckRef = useRef<ReviewDeck>({});
  // Guards the one write per session: the finishing effect re-runs on every
  // render that follows it.
  const saved = useRef(false);

  const source = useAsync(async () => {
    const deck = await readDeck((key) => platform.repo.getSetting(key));
    const mistakes = await platform.repo.aggregateMistakes();
    return {
      deck,
      due: dueItems(deck, new Date()),
      cards: Object.values(deck),
      // Beyond the deck, so a user whose cards are all resting still gets a
      // drill instead of an empty screen.
      words: weakWords(mistakes, DICTATION_DRILL_WORDS * 3).map((w) => w.expected),
    };
  }, [platform]);

  // A new batch whenever the source data arrives — first load, or a restart.
  useEffect(() => {
    if (!source.data) return;
    deckRef.current = source.data.deck;
    saved.current = false;
    setSession(
      buildSession(source.data.due, source.data.cards, source.data.words, DICTATION_DRILL_WORDS),
    );
    setFeedback(null);
    setReplays(0);
  }, [source.data]);

  const stats = useMemo(() => sessionStats(session), [session]);
  const word = currentWord(session)?.word ?? null;
  const finished = isFinished(session);
  // A miss holds the drill: the correct spelling is being spoken and read, and
  // the next word must not talk over it. `speak()` cancels whatever is in the
  // voice, so without this gate the correction would be audible for about a
  // tenth of a second — the one thing in the exercise that has to be heard.
  const holding = feedback !== null && !feedback.correct && !finished;

  const say = useCallback(
    (text: string) => {
      platform.tts.speak(text, { lang, rate: rateFor(DICTATION_DRILL_WPM) });
    },
    [platform, lang],
  );

  // Speak each word as it comes up. Keyed on the word rather than on the queue,
  // so an unrelated re-render cannot make the voice repeat itself.
  useEffect(() => {
    if (!word || holding) return;
    say(word);
    setReplays(0);
  }, [word, holding, say]);

  // Leaving the page must not leave a voice talking to an empty room.
  useEffect(() => {
    const tts = platform.tts;
    return () => tts.stop();
  }, [platform]);

  // The one write: promote what was spelled right, demote what was not.
  useEffect(() => {
    if (!finished || saved.current) return;
    saved.current = true;
    const verdicts = drillVerdicts(session);
    if (verdicts.passed.length === 0 && verdicts.failed.length === 0) return;
    const graded = gradeCards(deckRef.current, verdicts, new Date());
    void writeDeck((key, value) => platform.repo.setSetting(key, value), graded).catch(() => {});
  }, [finished, session, platform]);

  const submit = useCallback(
    (typed: string) => {
      if (holding || !currentWord(session)) return;
      const graded = gradeAnswer(session, typed);
      setSession(graded.session);
      setFeedback({
        correct: graded.correct,
        word: graded.word,
        typed,
        retrying: graded.retrying,
      });
      // A wrong spelling is heard as well as read: pairing the sound with the
      // right letters is the thing that has to stick.
      if (!graded.correct) say(graded.word);
    },
    [holding, session, say],
  );

  const skip = useCallback(() => {
    if (holding || !currentWord(session)) return;
    const graded = skipWord(session);
    setSession(graded.session);
    setFeedback({ correct: false, word: graded.word, typed: '', retrying: false });
    say(graded.word);
  }, [holding, session, say]);

  const replay = useCallback(() => {
    if (!word || holding || replays >= DICTATION_DRILL_REPLAYS) return;
    setReplays((n) => n + 1);
    say(word);
  }, [word, holding, replays, say]);

  return {
    loading: source.loading,
    unsupported: !platform.tts.available(),
    word,
    // Counts words, not attempts, so a retry does not push the counter past the
    // size of the batch.
    index: Math.min(stats.words, stats.answered + 1),
    stats,
    feedback,
    holding,
    finished,
    missed: missedWords(session),
    replaysLeft: Math.max(0, DICTATION_DRILL_REPLAYS - replays),
    replay,
    submit,
    skip,
    next: () => setFeedback(null),
    restart: source.reload,
  };
}
