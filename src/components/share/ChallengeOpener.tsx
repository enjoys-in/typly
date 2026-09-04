import { useState } from 'react';
import { Swords } from 'lucide-react';
import { CHALLENGE_EXT } from '@/core/constants';
import { useAcceptChallenge } from '@/hooks/useAcceptChallenge';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

/**
 * The explicit way in for a challenge file.
 *
 * On the desktop a `.typly` opens by double-click, but on the web there is no
 * file association at all — so without a visible button the whole
 * challenge-a-friend loop only works for half the users. A plain file input
 * rather than the platform picker, because that port is keyed on the passage
 * source types and a challenge is not one of them.
 */
export function ChallengeOpener() {
  const t = useT();
  const accept = useAcceptChallenge();
  const [error, setError] = useState<string | null>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!accept({ name: file.name, bytes })) setError(t('challenge.unreadable'));
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Swords size={15} className="shrink-0 text-fg-subtle" />
          {t('challenge.openTitle')}
        </p>
        <p className="mt-0.5 text-xs text-fg-muted">{t('challenge.openHint')}</p>
        {error && <p className="mt-1 text-xs text-danger-text">{error}</p>}
      </div>
      <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-control border border-edge bg-surface px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface-hover">
        {t('challenge.openButton')}
        <input
          type="file"
          accept={CHALLENGE_EXT}
          className="sr-only"
          onChange={(e) => void onPick(e.target.files?.[0])}
        />
      </label>
    </Card>
  );
}
