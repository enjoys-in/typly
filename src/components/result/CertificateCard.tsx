import { useCallback, useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import type { FinishedExam } from '@/store/examStore';
import { useAuthStore } from '@/store/authStore';
import { profileFor } from '@/core/scoring/examProfiles';
import { featuresFor } from '@/core/profile/profile';
import {
  CERT_H,
  CERT_W,
  certificateFilename,
  drawCertificate,
} from '@/core/institute/certificate';
import { brandActive } from '@/core/institute/brand';
import { useInstituteBrand } from '@/hooks/useInstituteBrand';
import { appConfig, activeTheme } from '@/config/appConfig';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';
import { useDateFormat } from '@/hooks/useDateFormat';

/**
 * The formal certificate for one passing run.
 *
 * The drawing itself lives in `core/institute/certificate` so that this and the
 * batch printer produce the *same* document — a centre handing out twenty must
 * not be giving a different certificate from the one the candidate just saw.
 */
export function CertificateCard({ finished }: { finished: FinishedExam }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useT();
  const d = useDateFormat();
  const account = useAuthStore((s) => s.account);
  const { brand, logo } = useInstituteBrand();
  // Pre-filled from the profile, still editable per certificate.
  const [name, setName] = useState(account?.name ?? '');
  const unlocked = featuresFor(account);
  const result = finished.result;
  const examName = profileFor(finished.payload.examBoard).name;
  const dateStr = d.date(finished.payload.createdAt);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = CERT_W;
    canvas.height = CERT_H;
    const theme = activeTheme();
    drawCertificate(ctx, {
      name,
      examName,
      netWpm: result.netWpm,
      accuracy: result.accuracy,
      errors: result.errors,
      dateLabel: dateStr,
      appName: appConfig.name,
      from: theme.primaryFrom,
      to: theme.primaryTo,
      brand,
      logo,
    });
  }, [name, result, examName, dateStr, brand, logo]);

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
      a.href = url;
      a.download = certificateFilename(name);
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  return (
    <Card className="space-y-3">
      <div>
        <h2 className="font-semibold">{t('certificate.title')}</h2>
        <p className="mt-0.5 text-xs text-fg-muted">
          {t(unlocked.certificateDownload ? 'certificate.ready' : 'certificate.locked')}
          {brandActive(brand) && ` · ${t('certificate.branded', { institute: brand.name })}`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('profile.namePlaceholder')}
          maxLength={40}
          aria-label={t('certificate.nameAria')}
          className="select min-w-40 flex-1"
        />
        <Button onClick={download} disabled={!unlocked.certificateDownload}>
          {!unlocked.certificateDownload && <Lock size={14} />}
          {t('certificate.download')}
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-panel border border-line"
        style={{ aspectRatio: `${CERT_W} / ${CERT_H}` }}
      />
    </Card>
  );
}
