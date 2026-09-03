import { formatDistanceToNow } from 'date-fns';
import { Play, RotateCcw, Trash2 } from 'lucide-react';
import type { ExamSnapshot } from '@/core/types';
import { profileFor } from '@/core/scoring/examProfiles';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ProgressBar } from '@/ui/ProgressBar';

interface Props {
  snapshot: ExamSnapshot;
  onResume: () => void;
  onDiscard: () => void;
}

/** An attempt that was interrupted, offered back instead of silently lost. */
export function ResumeCard({ snapshot, onResume, onDiscard }: Props) {
  const { config, typed, savedAt } = snapshot;
  const progress = config.passage.length ? (typed.length / config.passage.length) * 100 : 0;

  return (
    <Card className="space-y-4 border-accent-border bg-accent-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <RotateCcw size={15} className="shrink-0" /> Unfinished test
          </p>
          <p className="truncate text-sm text-fg-muted">
            {config.title || profileFor(config.board).name} · left{' '}
            {formatDistanceToNow(new Date(savedAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onResume}>
            <Play size={14} /> Resume
          </Button>
          <Button size="sm" variant="ghost" onClick={onDiscard}>
            <Trash2 size={14} /> Discard
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <ProgressBar value={progress} />
        <p className="text-xs tabular-nums text-fg-muted">
          {typed.length} of {config.passage.length} characters typed
        </p>
      </div>
    </Card>
  );
}
