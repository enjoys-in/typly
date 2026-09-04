import { Swords, Trophy } from 'lucide-react';
import type { Challenge } from '@/core/share/challenge';
import {
  buildChallenge,
  challengeFilename,
  encodeChallenge,
  headToHead,
} from '@/core/share/challenge';
import type { ExamBoard, Lang } from '@/core/constants';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

interface Props {
  title: string;
  passage: string;
  lang: Lang;
  board: ExamBoard;
  durationSec: number;
  netWpm: number;
  accuracy: number;
  name: string;
  /** Set when this run answered someone else's challenge. */
  answering?: Challenge | null;
}

/**
 * Challenge files — peer competition with no backend.
 *
 * A `.typly` file carries a passage, the sender's score and the rules they ran
 * under. A friend opens it (the extension and the `typly://` scheme are already
 * registered with the OS), types the same passage under the same settings, and
 * gets a head-to-head. No accounts, no server: the file *is* the protocol.
 */
export function ChallengeCard({
  title,
  passage,
  lang,
  board,
  durationSec,
  netWpm,
  accuracy,
  name,
  answering = null,
}: Props) {
  const t = useT();

  function exportChallenge() {
    const challenge = buildChallenge({
      title,
      passage,
      lang,
      board,
      durationSec,
      netWpm,
      accuracy,
      name,
    });
    const blob = new Blob([encodeChallenge(challenge)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = challengeFilename(title);
    a.click();
    URL.revokeObjectURL(url);
  }

  // Answering a challenge: the head-to-head is the point, so it comes first.
  if (answering) {
    const result = headToHead({ netWpm, accuracy }, answering.score);
    return (
      <Card
        className={`space-y-3 ${result.won ? 'border-accent-border bg-accent-soft' : 'border-line'}`}
      >
        <h2 className="flex items-center gap-2 font-semibold">
          <Trophy size={16} className="shrink-0 text-accent-soft-fg" />
          {t(result.won ? 'challenge.youWon' : 'challenge.youLost')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Side
            label={t('challenge.you')}
            wpm={netWpm}
            accuracy={accuracy}
            winner={result.won}
          />
          <Side
            label={answering.score.name || t('challenge.challenger')}
            wpm={answering.score.netWpm}
            accuracy={answering.score.accuracy}
            winner={!result.won}
          />
        </div>
        <p className="text-xs text-fg-muted">
          {t('challenge.margin', {
            wpm: Math.abs(result.wpmLead),
            accuracy: Math.abs(result.accuracyLead),
          })}
        </p>
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={exportChallenge}>
            <Swords size={14} /> {t('challenge.sendBack')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <Swords size={16} className="shrink-0 text-fg-subtle" />
          {t('challenge.title')}
        </h2>
        <p className="mt-0.5 text-xs text-fg-muted">{t('challenge.hint')}</p>
      </div>
      <div className="flex justify-end">
        <Button onClick={exportChallenge} disabled={passage.trim().length === 0}>
          {t('challenge.export')}
        </Button>
      </div>
    </Card>
  );
}

function Side({
  label,
  wpm,
  accuracy,
  winner,
}: {
  label: string;
  wpm: number;
  accuracy: number;
  winner: boolean;
}) {
  return (
    <div
      className={`rounded-panel border px-4 py-3 ${
        winner ? 'border-accent-border bg-surface' : 'border-line'
      }`}
    >
      <p className="truncate text-xs font-semibold tracking-wide text-fg-muted uppercase">
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums">{wpm}</p>
      <p className="text-xs text-fg-subtle tabular-nums">{accuracy}%</p>
    </div>
  );
}
