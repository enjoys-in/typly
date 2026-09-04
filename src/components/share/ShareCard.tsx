import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { activeTheme, appConfig } from '@/config/appConfig';
import { CARD_SIZE, cardFilename, drawResultCard } from '@/core/share/resultCard';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

interface Props {
  wpm: number;
  accuracy: number;
  examName: string;
  streak: number;
  passed: boolean;
  /** Pre-filled from the profile, still editable before sharing. */
  defaultName: string;
  dateLabel: string;
}

/**
 * The square image people actually share.
 *
 * The certificate is a document — right for printing, wrong for a WhatsApp
 * status. This is the other thing: four numbers, legible as a thumbnail, sized
 * for a chat app. In this market that is the growth channel, and it is one
 * canvas render away from data the result page already has.
 */
export function ShareCard({
  wpm,
  accuracy,
  examName,
  streak,
  passed,
  defaultName,
  dateLabel,
}: Props) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState(defaultName);
  const [note, setNote] = useState<string | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = CARD_SIZE;
    canvas.height = CARD_SIZE;
    const theme = activeTheme();
    drawResultCard(ctx, {
      wpm,
      accuracy,
      examName,
      streak,
      passed,
      name,
      dateLabel,
      appName: appConfig.name,
      from: theme.primaryFrom,
      to: theme.primaryTo,
    });
  }, [wpm, accuracy, examName, streak, passed, name, dateLabel]);

  useEffect(draw, [draw]);

  /** The rendered card as a PNG blob, or null if the canvas is not ready. */
  const toBlob = useCallback(
    () =>
      new Promise<Blob | null>((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          resolve(null);
          return;
        }
        canvas.toBlob(resolve, 'image/png');
      }),
    [],
  );

  async function download() {
    const blob = await toBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cardFilename(examName, wpm);
    a.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    const blob = await toBlob();
    if (!blob) return;
    const file = new File([blob], cardFilename(examName, wpm), { type: 'image/png' });
    // `canShare` has to be asked about the file specifically: a browser can
    // support sharing text and still refuse an image.
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: examName }).catch(() => {});
      return;
    }
    // No image share sheet — a download is the next best thing, and saying so
    // beats a button that appears to do nothing.
    await download();
    setNote(t('share.downloadedInstead'));
  }

  return (
    <Card className="space-y-3">
      <div>
        <h2 className="font-semibold">{t('share.title')}</h2>
        <p className="mt-0.5 text-xs text-fg-muted">{t('share.hint')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('profile.namePlaceholder')}
          maxLength={40}
          aria-label={t('share.nameAria')}
          className="select min-w-40 flex-1"
        />
        <Button onClick={() => void share()}>
          <Share2 size={15} /> {t('share.share')}
        </Button>
        <Button variant="secondary" onClick={() => void download()}>
          <Download size={15} /> {t('share.download')}
        </Button>
      </div>
      {note && <p className="text-xs text-fg-muted">{note}</p>}

      {/* Capped rather than full width: the card is square and 1080px, and at
          full page width it would dwarf every other panel on the page. */}
      <canvas
        ref={canvasRef}
        className="mx-auto w-full max-w-80 rounded-panel border border-line"
        style={{ aspectRatio: '1 / 1' }}
      />
    </Card>
  );
}
