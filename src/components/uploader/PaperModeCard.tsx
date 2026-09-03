import { ArrowRight, ScanLine } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';

interface Props {
  onStart: () => void;
}

/**
 * The other way to take a test: the passage is on paper — a book, a printed
 * sheet, an exam question paper — and nothing needs importing. Typly measures
 * what was typed rather than comparing it to a passage on screen.
 */
export function PaperModeCard({ onStart }: Props) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="brand-accent-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-white">
          <ScanLine size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Typing from paper?</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-fg-muted">
            Read from a printed sheet or a book and type here. Nothing to upload — you get speed,
            word count, corrections, and spelling and grammar checked at the end.
          </p>
        </div>
      </div>
      <Button variant="secondary" onClick={onStart}>
        Start a paper test
        <ArrowRight size={16} />
      </Button>
    </Card>
  );
}
