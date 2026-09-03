import { X } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useAsync } from '@/hooks/useAsync';
import { useSettingsStore } from '@/store/settingsStore';
import { HindiFont } from '@/core/constants';
import { isDevanagari } from '@/core/text/scripts';
import { FONT_FAMILY } from '@/ui/fonts';
import { Modal } from '@/ui/Modal';
import { SkeletonText } from '@/ui/Skeleton';
import { typedAfter } from '@/core/typing/replay';
import { ReplayPlayer } from './ReplayPlayer';
import { useT } from '@/i18n';

interface Props {
  testId: number;
  onClose: () => void;
}

const TITLE_ID = 'replay-modal-title';

/** Replays a past attempt from history, loading its passage and keystroke log. */
export function ReplayModal({ testId, onClose }: Props) {
  const t = useT();
  const platform = usePlatform();
  const hindiFont = useSettingsStore((s) => s.hindiFont);

  const run = useAsync(async () => {
    const full = await platform.repo.getResult(testId);
    if (!full) return null;
    const doc =
      full.row.documentId != null ? await platform.repo.getDocument(full.row.documentId) : null;
    // A paper run has no document — the text it produced is reconstructed from
    // the keystrokes themselves, which is all the player needs.
    const passage = doc?.content ?? typedAfter(full.keystrokes, full.keystrokes.length);
    return { full, passage };
  }, [platform, testId]);

  const lang = run.data?.full.row.lang;
  const fontFamily =
    lang && isDevanagari(lang) && hindiFont !== HindiFont.System ? FONT_FAMILY[hindiFont] : undefined;

  return (
    <Modal onClose={onClose} labelledBy={TITLE_ID} size="lg">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 id={TITLE_ID} className="text-lg font-semibold">
            {t('result.replay')}
          </h2>
          {run.data && (
            <p className="text-sm text-fg-muted">
              {t('replay.summary', {
                wpm: run.data.full.row.netWpm,
                accuracy: run.data.full.row.accuracy,
              })}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('replay.close')}
          className="cursor-pointer rounded-control p-1 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <X size={18} />
        </button>
      </div>

      {run.loading ? (
        <SkeletonText lines={4} />
      ) : !run.data || run.data.passage === '' ? (
        <p className="text-sm text-fg-muted">
          {t('replay.noPassage')}
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
