import { useMemo } from 'react';
import { FileText, FileType2, Image as ImageIcon, RefreshCw, Type } from 'lucide-react';
import { SourceType } from '@/core/constants';
import { profileFor } from '@/core/scoring/examProfiles';
import { estimatedMinutes, SOURCE_LABEL, textStats } from '@/core/text/textStats';
import { useSettingsStore } from '@/store/settingsStore';

const SOURCE_ICON: Record<SourceType, typeof Type> = {
  [SourceType.Text]: Type,
  [SourceType.Image]: ImageIcon,
  [SourceType.Pdf]: FileText,
  [SourceType.Docx]: FileType2,
};

interface Props {
  text: string;
  source: SourceType;
  /** Clears the passage and returns to the paste / upload step. */
  onReplace: () => void;
}

/**
 * Replaces the uploader once a passage exists: the drag-and-drop zone is gone,
 * so the detected text's numbers and the continue action stay on one screen.
 */
export function TextInfoPanel({ text, source, onReplace }: Props) {
  const board = useSettingsStore((s) => s.board);
  const stats = useMemo(() => textStats(text), [text]);
  const targetWpm = profileFor(board).rules.minWpm;
  const eta = estimatedMinutes(stats, targetWpm > 0 ? targetWpm : 35);
  const Icon = SOURCE_ICON[source];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-white">
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Text detected</p>
          <p className="text-xs text-fg-muted">
            From {SOURCE_LABEL[source]} · about {eta} min at {targetWpm > 0 ? targetWpm : 35} WPM
          </p>
        </div>
        <button
          type="button"
          onClick={onReplace}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-control border border-edge px-3 py-1.5 text-xs font-semibold text-fg-muted outline-none transition-colors hover:bg-surface-hover hover:text-fg focus-visible:ring-4 focus-visible:ring-edge"
        >
          <RefreshCw size={13} />
          Replace
        </button>
      </div>

      <dl className="grid grid-cols-3 gap-x-4 gap-y-3 rounded-panel bg-surface-2 p-4 sm:grid-cols-4">
        <Metric label="Words" value={stats.words} />
        <Metric label="Characters" value={stats.chars} />
        <Metric label="No spaces" value={stats.charsNoSpaces} />
        <Metric label="Spaces" value={stats.spaces} />
        <Metric label="Full stops" value={stats.fullStops} />
        <Metric label="Sentences" value={stats.sentences} />
        <Metric label="Lines" value={stats.lines} />
        <Metric label="Paragraphs" value={stats.paragraphs} />
        <Metric label="Digits" value={stats.digits} />
        <Metric label="Punctuation" value={stats.punctuation} />
        <Metric label="Capitals" value={stats.uppercase} />
        <Metric label="Avg word" value={stats.avgWordLen} />
      </dl>

      <p className="text-xs text-fg-muted">
        Scored as{' '}
        <span className="font-semibold text-fg">
          {stats.standardWords} standard words
        </span>{' '}
        ({/* exam convention */}5 characters each) · longest word {stats.longestWord} characters.
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] tracking-wide text-fg-muted uppercase">{label}</dt>
      <dd className="text-lg font-bold tabular-nums">{value}</dd>
    </div>
  );
}
