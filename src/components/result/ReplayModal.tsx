import { X } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useAsync } from '@/hooks/useAsync';
import { useSettingsStore } from '@/store/settingsStore';
import { HindiFont } from '@/core/constants';
import { isDevanagari } from '@/core/text/scripts';
import { FONT_FAMILY } from '@/ui/fonts';
import { Modal } from '@/ui/Modal';
import { SkeletonText } from '@/ui/Skeleton';
import { ReplayPlayer } from './ReplayPlayer';

interface Props {
  testId: number;
  onClose: () => void;
}

const TITLE_ID = 'replay-modal-title';

/** Replays a past attempt from history, loading its passage and keystroke log. */
export function ReplayModal({ testId, onClose }: Props) {
  const platform = usePlatform();
  const hindiFont = useSettingsStore((s) => s.hindiFont);

  const run = useAsync(async () => {
    const full = await platform.repo.getResult(testId);
    if (!full) return null;
    const doc = full.row.documentId != null ? await platform.repo.getDocument(full.row.documentId) : null;
    return { full, passage: doc?.content ?? '' };
  }, [platform, testId]);

  const lang = run.data?.full.row.lang;
  const fontFamily =
    lang && isDevanagari(lang) && hindiFont !== HindiFont.System ? FONT_FAMILY[hindiFont] : undefined;

  return (
    <Modal onClose={onClose} labelledBy={TITLE_ID} size="lg">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 id={TITLE_ID} className="text-lg font-semibold">
            Replay
          </h2>
          {run.data && (
            <p className="text-sm text-fg-muted">
              {run.data.full.row.netWpm} net WPM · {run.data.full.row.accuracy}% accuracy
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close replay"
          className="cursor-pointer rounded-control p-1 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <X size={18} />
        </button>
      </div>

      {run.loading ? (
        <SkeletonText lines={4} />
      ) : !run.data || run.data.passage === '' ? (
        <p className="text-sm text-fg-muted">
          The paragraph for this attempt is no longer in your library, so it cannot be replayed.
        </p>
      ) : (
        <ReplayPlayer
          passage={run.data.passage}
          keystrokes={run.data.full.keystrokes}
          fontFamily={fontFamily}
        />
      )}
    </Modal>
  );
}
