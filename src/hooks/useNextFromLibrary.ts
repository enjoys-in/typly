import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { nextInSequence } from '@/core/library/sequence';
import type { DocumentRow, ExamConfig } from '@/core/types';
import { useAsync } from '@/hooks/useAsync';

/**
 * "Now the next one" — the paragraph after this run's, started on the same
 * rules.
 *
 * A finished paper leaves an aspirant with the momentum to do another and a
 * screen that offers them the new-test page: pick a passage, pick a board, pick
 * a clock, start. That is three decisions they have already made. This takes
 * the settings the run they just finished was graded under, swaps in the next
 * paragraph from their library, and goes straight to the exam screen.
 *
 * It is deliberately not the endless run. That one picks by difficulty band and
 * ends itself when the cut-off has been missed for long enough; this is the
 * library in its own order, one paragraph at a time, and it stops when the
 * typist stops.
 */
export function useNextFromLibrary(config: ExamConfig | null): {
  /** The paragraph that would be started, or null when there is none to offer. */
  next: DocumentRow | null;
  /** True while the library is still being read. */
  loading: boolean;
  starting: boolean;
  start: () => void;
} {
  const platform = usePlatform();
  const navigate = useNavigate();
  const setDraft = useExamStore((s) => s.setDraft);
  const setConfig = useExamStore((s) => s.setConfig);
  const clearSeries = useExamStore((s) => s.clearSeries);
  const [starting, setStarting] = useState(false);

  const library = useAsync(() => platform.repo.listDocuments(), [platform]);
  const documentId = config?.documentId ?? null;
  const next =
    library.data && config
      ? nextInSequence(library.data, documentId, { lang: config.lang })
      : null;

  const start = useCallback(() => {
    if (!config || !next) return;
    setStarting(true);
    clearSeries();
    // The run that just finished, with its passage replaced. Everything that
    // belonged to *that* attempt rather than to the setup is dropped: the ghost
    // it raced, the part it was of, the lesson or drill it completed, and paper
    // mode — the next paragraph is on screen, not on a desk.
    setConfig({
      ...config,
      passage: next.content,
      title: next.title,
      documentId: next.id,
      lang: next.lang,
      paper: false,
      ghostTestId: null,
      lessonId: null,
      drill: null,
      partIndex: null,
      partCount: null,
    });
    // The draft is set too, so "Change settings" from the exam screen lands on
    // a setup page describing the paragraph that is actually running.
    setDraft({
      passage: next.content,
      title: next.title,
      documentId: next.id,
      sourceType: next.sourceType,
      lang: next.lang,
    });
    navigate('/app/exam');
  }, [config, next, setConfig, setDraft, clearSeries, navigate]);

  return { next, loading: library.loading, starting, start };
}
