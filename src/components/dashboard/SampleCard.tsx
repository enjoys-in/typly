import { FileText, Play } from 'lucide-react';
import type { DocumentRow } from '@/core/types';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';

interface Props {
  document: DocumentRow;
  onStart: () => void;
}

/** One-click demo: the seeded sample paragraph, ready to run as a real test. */
export function SampleCard({ document, onStart }: Props) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-base font-semibold">
            <FileText size={16} className="shrink-0 text-fg-subtle" />
            Try it with the sample paragraph
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            {document.title} · {document.charCount.toLocaleString()} characters. Nothing to import —
            pick an exam profile and start typing.
          </p>
        </div>
        <Button onClick={onStart}>
          <Play size={16} /> Start demo test
        </Button>
      </div>
      <p className="line-clamp-2 border-t border-line pt-3 font-mono text-xs leading-relaxed text-fg-muted">
        {document.content}
      </p>
    </Card>
  );
}
