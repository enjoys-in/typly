import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Lock } from 'lucide-react';
import type { FinishedExam } from '@/store/examStore';
import { useAuthStore } from '@/store/authStore';
import { profileFor } from '@/core/scoring/examProfiles';
import { featuresFor } from '@/core/profile/profile';
import { appConfig, activeTheme } from '@/config/appConfig';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';

const W = 1200;
const H = 820;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function CertificateCard({ finished }: { finished: FinishedExam }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const account = useAuthStore((s) => s.account);
  // Pre-filled from the profile, still editable per certificate.
  const [name, setName] = useState(account?.name ?? '');
  const unlocked = featuresFor(account);
  const result = finished.result;
  const examName = profileFor(finished.payload.examBoard).name;
  const dateStr = format(new Date(finished.payload.createdAt), 'dd MMMM yyyy');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = W;
    canvas.height = H;
    const theme = activeTheme();
    const displayName = name.trim() || 'Typist';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.primaryFrom);
    grad.addColorStop(1, theme.primaryTo);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 16;
    roundRect(ctx, 24, 24, W - 48, H - 48, 26);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(15,23,42,0.08)';
    ctx.lineWidth = 2;
    roundRect(ctx, 50, 50, W - 100, H - 100, 16);
    ctx.stroke();

    ctx.textAlign = 'center';

    ctx.fillStyle = theme.primaryTo;
    ctx.font = '700 40px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(appConfig.name, W / 2, 148);
    ctx.fillStyle = '#64748b';
    ctx.font = '400 20px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('Typing Exam Practice', W / 2, 182);

    ctx.fillStyle = '#0f172a';
    ctx.font = '800 54px Georgia, ui-serif, serif';
    ctx.fillText('Certificate of Achievement', W / 2, 288);

    ctx.fillStyle = '#475569';
    ctx.font = '400 22px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('This certifies that', W / 2, 352);

    ctx.fillStyle = theme.primaryTo;
    ctx.font = '700 48px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(displayName, W / 2, 422);
    const underline = Math.min(680, ctx.measureText(displayName).width + 120);
    ctx.strokeStyle = 'rgba(15,23,42,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - underline / 2, 444);
    ctx.lineTo(W / 2 + underline / 2, 444);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = '400 24px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(`achieved ${result.netWpm} Net WPM at ${result.accuracy}% accuracy`, W / 2, 508);
    ctx.fillText(`in the ${examName} typing test`, W / 2, 544);

    const chips: [string, string][] = [
      ['Net WPM', String(result.netWpm)],
      ['Accuracy', `${result.accuracy}%`],
      ['Errors', String(result.errors)],
    ];
    const chipW = 220;
    const gap = 30;
    const totalW = chips.length * chipW + (chips.length - 1) * gap;
    let cx = (W - totalW) / 2;
    for (const [label, value] of chips) {
      ctx.fillStyle = '#f1f5f9';
      roundRect(ctx, cx, 590, chipW, 88, 14);
      ctx.fill();
      ctx.fillStyle = theme.primaryTo;
      ctx.font = '800 34px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(value, cx + chipW / 2, 634);
      ctx.fillStyle = '#64748b';
      ctx.font = '600 15px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(label.toUpperCase(), cx + chipW / 2, 660);
      cx += chipW + gap;
    }

    ctx.fillStyle = '#334155';
    ctx.font = '400 20px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(dateStr, W / 2, 726);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 15px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(`Verified locally by ${appConfig.name} — nothing left this device`, W / 2, 758);
  }, [name, result, examName, dateStr]);

  useEffect(() => {
    draw();
  }, [draw]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas || !unlocked.certificateDownload) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safe = (name.trim() || 'typist').toLowerCase().replace(/\s+/g, '-');
      a.href = url;
      a.download = `typly-certificate-${safe}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  return (
    <Card className="space-y-3">
      <div>
        <h2 className="font-semibold">Certificate</h2>
        <p className="mt-0.5 text-xs text-fg-muted">
          {unlocked.certificateDownload
            ? 'You passed — here is a shareable certificate.'
            : 'You passed. Add your email in Settings to download it as an image.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={40}
          aria-label="Name on the certificate"
          className="select min-w-40 flex-1"
        />
        <Button onClick={download} disabled={!unlocked.certificateDownload}>
          {!unlocked.certificateDownload && <Lock size={14} />}
          Download certificate
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-panel border border-line"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
    </Card>
  );
}
