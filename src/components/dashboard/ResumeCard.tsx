import { Play, RotateCcw, Trash2 } from 'lucide-react';
import type { ExamSnapshot } from '@/core/types';
import { profileFor } from '@/core/scoring/examProfiles';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ProgressBar } from '@/ui/ProgressBar';
import { useT } from '@/i18n';
import { useDateFormat } from '@/hooks/useDateFormat';

interface Props {
  snapshot: ExamSnapshot;
  onResume: () => void;
  onDiscard: () => void;
}

/** An attempt that was interrupted, offered back instead of silently lost. */
export function ResumeCard({ snapshot, onResume, onDiscard }: Props) {
  const t = useT();
  const d = useDateFormat();
  const { config, typed, savedAt } = snapshot;
  const progress = config.passage.length ? (typed.length / config.passage.length) * 100 : 0;

  return (
    <Card className="space-y-4 border-accent-border bg-accent-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <RotateCcw size={15} className="shrink-0" /> {t('resume.title')}
          </p>
          <p className="truncate text-sm text-fg-muted">
            {t('resume.left', {
              title: config.title || profileFor(config.board).name,
              ago: d.ago(savedAt),
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onResume}>
            <Play size={14} /> {t('resume.resume')}
          </Button>
          <Button size="sm" variant="ghost" onClick={onDiscard}>
            <Trash2 size={14} /> {t('resume.discard')}
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <ProgressBar value={progress} />
        <p className="text-xs tabular-nums text-fg-muted">
          {t('resume.typedOf', { typed: typed.length, total: config.passage.length })}
        </p>
      </div>
    </Card>
  );
}
