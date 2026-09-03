import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import { SourceType } from '@/core/constants';

/**
 * Starts a paper-mode test: a draft with no passage, straight to Setup.
 *
 * Lives here because more than one screen offers it — New Test and the
 * Dashboard — and both must produce exactly the same run.
 */
export function usePaperRun(): () => void {
  const navigate = useNavigate();
  const setDraft = useExamStore((s) => s.setDraft);
  const lang = useSettingsStore((s) => s.lang);

  return useCallback(() => {
    setDraft({
      passage: '',
      title: 'Paper test',
      documentId: null,
      sourceType: SourceType.Text,
      lang,
      paper: true,
    });
    navigate('/app/setup');
  }, [setDraft, navigate, lang]);
}
