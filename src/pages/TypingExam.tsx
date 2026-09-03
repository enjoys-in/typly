import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { readExamSnapshot } from '@/hooks/useExamSnapshot';
import { ExamRun } from '@/components/exam/ExamRun';
import { FullPageLoader } from '@/ui/Skeleton';

/**
 * Resolves *which* attempt to run before handing over to ExamRun: the config
 * just set up, or — after a reload killed the in-memory config — a checkpoint
 * of an attempt that was still in progress.
 */
export function TypingExam() {
  const navigate = useNavigate();
  const platform = usePlatform();
  const config = useExamStore((s) => s.config);
  const resume = useExamStore((s) => s.resume);
  const resumeFrom = useExamStore((s) => s.resumeFrom);
  const [restoring, setRestoring] = useState(config === null);

  useEffect(() => {
    if (config) return;
    let alive = true;
    void readExamSnapshot(platform.repo).then((snapshot) => {
      if (!alive) return;
      if (snapshot) resumeFrom(snapshot);
      else navigate('/app/new', { replace: true });
      setRestoring(false);
    });
    return () => {
      alive = false;
    };
  }, [config, platform, resumeFrom, navigate]);

  if (restoring) return <FullPageLoader label="Restoring your test" />;
  if (!config) return null;
  return <ExamRun config={config} resume={resume} />;
}
