import { useState } from 'react';
import { Infinity as InfinityIcon, Play } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useAsync } from '@/hooks/useAsync';
import { useEndlessRun } from '@/hooks/useEndlessRun';
import { poolDepth } from '@/core/exam/endlessPool';
import { profileFor } from '@/core/scoring/examProfiles';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

/**
 * The entry point for an endless run.
 *
 * Every other mode has a fixed length, so it measures how fast you can go for
 * ten minutes. This measures how long you can *hold* exam pace — which is what
 * a 50-minute Stenographer transcription or a long DEST actually asks for, and
 * what no fixed-length test can tell you.
 *
 * It needs the library to have material at more than one difficulty, or the
 * difficulty cannot adapt and the run would only be measuring stamina against
 * one paragraph.
 */
export function EndlessCard() {
  const t = useT();
  const platform = usePlatform();
  const endless = useEndlessRun();
  const board = useSettingsStore((s) => s.board);
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);

  const library = useAsync(() => platform.repo.listDocuments(), [platform]);
  const depth = library.data ? poolDepth(library.data) : 0;
  const ready = depth >= 2;
  const profile = profileFor(board);

  async function start() {
    setStarting(true);
    setFailed(!(await endless.start()));
    setStarting(false);
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-semibold">
            <InfinityIcon size={17} className="shrink-0 text-accent-text" />
            {t('endless.cardTitle')}
          </h2>
          <p className="mt-0.5 text-sm text-fg-muted">
            {t('endless.cardHint', {
              wpm: profile.rules.minWpm,
              exam: profile.name,
            })}
          </p>
        </div>
        <Button onClick={() => void start()} disabled={!ready || starting}>
          <Play size={15} /> {t(starting ? 'endless.starting' : 'endless.start')}
        </Button>
      </div>

      {!ready && library.data && (
        <p className="text-xs text-fg-muted">{t('endless.needLibrary')}</p>
      )}
      {failed && <p className="text-xs text-danger-text">{t('endless.couldNotStart')}</p>}
    </Card>
  );
}
