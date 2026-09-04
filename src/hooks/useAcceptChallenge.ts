import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore } from '@/store/examStore';
import { useIncomingStore } from '@/store/incomingStore';
import { parseChallenge } from '@/core/share/challenge';
import { isChallengeFile } from '@/core/text/fileKind';
import { SourceType } from '@/core/constants';

/**
 * Accepting a `.typly` challenge file, wherever it arrived from.
 *
 * A challenge is not an import: it already *is* a passage plus the rules and
 * the score it was set under, so it skips extraction entirely and goes straight
 * to the setup page with the challenger's score held for the result report.
 *
 * This lives in a hook because there are three ways in — the desktop "Open
 * with" handler, a drop on the New Test page, and the explicit file button —
 * and all three must land in exactly the same place. It is also what makes the
 * feature work on the web at all, where there is no OS file association.
 */
export function useAcceptChallenge(): (file: { name: string; bytes: Uint8Array }) => boolean {
  const navigate = useNavigate();
  const setChallenge = useIncomingStore((s) => s.setChallenge);
  const setDraft = useExamStore((s) => s.setDraft);

  return useCallback(
    (file) => {
      if (!isChallengeFile(file.name)) return false;
      const challenge = parseChallenge(new TextDecoder().decode(file.bytes));
      // A malformed file is not accepted, so the caller can fall back to its
      // ordinary import path (or say something useful) rather than silently
      // dropping what the user just handed over.
      if (!challenge) return false;

      setChallenge(challenge);
      setDraft({
        passage: challenge.passage,
        title: challenge.title,
        documentId: null,
        sourceType: SourceType.Text,
        lang: challenge.lang,
      });
      navigate('/app/setup');
      return true;
    },
    [navigate, setChallenge, setDraft],
  );
}
