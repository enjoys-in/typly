import { useCallback, useMemo, useRef, useState } from 'react';
import { Award, Download, Printer } from 'lucide-react';
import type { TestRow } from '@/core/types';
import { buildBatch, brandActive } from '@/core/institute/brand';
import {
  CERT_H,
  CERT_W,
  certificateFilename,
  drawCertificate,
} from '@/core/institute/certificate';
import { useInstituteBrand } from '@/hooks/useInstituteBrand';
import { activeTheme, appConfig } from '@/config/appConfig';
import { profileFor } from '@/core/scoring/examProfiles';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';
import { useDateFormat } from '@/hooks/useDateFormat';

interface Props {
  rows: TestRow[];
}

/**
 * Certificates for a whole batch, in one pass.
 *
 * This is the piece that turns a free app into something a coaching centre will
 * pay for: their name and logo on the document, and twenty certificates
 * generated from twenty results rather than twenty visits to a result page.
 *
 * Names are not stored per attempt — Typly has one account per machine — so the
 * centre types them in against each passing run. An unnamed row still produces
 * a certificate with a ruled line, which somebody can write on.
 */
export function BatchCertificates({ rows }: Props) {
  const t = useT();
  const d = useDateFormat();
  const { brand, logo } = useInstituteBrand();
  const [names, setNames] = useState<Record<number, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const batch = useMemo(() => buildBatch(rows, names), [rows, names]);
  const branded = brandActive(brand);

  /** Renders one certificate onto the offscreen canvas and returns it. */
  const render = useCallback(
    (name: string, row: TestRow): HTMLCanvasElement | null => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return null;
      canvas.width = CERT_W;
      canvas.height = CERT_H;
      const theme = activeTheme();
      drawCertificate(ctx, {
        name,
        examName: profileFor(row.examBoard).name,
        netWpm: row.netWpm,
        accuracy: row.accuracy,
        errors: row.errors,
        dateLabel: d.date(row.createdAt),
        appName: appConfig.name,
        from: theme.primaryFrom,
        to: theme.primaryTo,
        brand,
        logo,
      });
      return canvas;
    },
    [brand, logo, d],
  );

  /**
   * One PNG per candidate. Sequential rather than parallel: a single canvas is
   * reused, and each `toBlob` has to finish before the next render overwrites
   * the pixels it is reading.
   */
  async function downloadAll() {
    for (const entry of batch) {
      const canvas = render(entry.name, entry.row);
      if (!canvas) continue;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png'),
      );
      if (!blob) continue;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = certificateFilename(entry.name || `result-${entry.row.id}`);
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  if (batch.length === 0) {
    return (
      <Card className="space-y-1">
        <h2 className="font-semibold">{t('batch.title')}</h2>
        <p className="text-sm text-fg-muted">{t('batch.empty')}</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <Award size={16} className="shrink-0 text-fg-subtle" />
            {t('batch.title')}
          </h2>
          <p className="mt-0.5 text-sm text-fg-muted">
            {t(branded ? 'batch.hintBranded' : 'batch.hintUnbranded', {
              count: batch.length,
              institute: brand.name,
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => void downloadAll()}>
            <Download size={15} /> {t('batch.downloadAll', { count: batch.length })}
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={15} /> {t('batch.print')}
          </Button>
        </div>
      </div>

      <div className="scroll-area max-h-80">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-surface text-[11px] tracking-wide text-fg-muted uppercase">
            <tr>
              <th className="py-2 font-medium">{t('batch.candidate')}</th>
              <th className="py-2 font-medium">{t('batch.exam')}</th>
              <th className="py-2 text-right font-medium">{t('batch.wpm')}</th>
              <th className="py-2 text-right font-medium">{t('batch.accuracy')}</th>
              <th className="py-2 text-right font-medium">{t('batch.date')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {batch.map((entry) => (
              <tr key={entry.row.id}>
                <td className="py-1.5 pr-3">
                  <input
                    value={entry.name}
                    onChange={(e) =>
                      setNames((map) => ({ ...map, [entry.row.id]: e.target.value }))
                    }
                    maxLength={40}
                    placeholder={t('batch.namePlaceholder')}
                    aria-label={t('batch.nameAria', { id: entry.row.id })}
                    className="select w-full min-w-32 py-1"
                  />
                </td>
                <td className="max-w-40 truncate py-1.5 pr-3 text-fg-muted">
                  {profileFor(entry.row.examBoard).name}
                </td>
                <td className="py-1.5 text-right font-semibold tabular-nums text-accent-text">
                  {entry.row.netWpm}
                </td>
                <td className="py-1.5 text-right tabular-nums text-fg-muted">
                  {entry.row.accuracy}%
                </td>
                <td className="py-1.5 text-right text-xs text-fg-subtle">
                  {d.dateShort(entry.row.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Offscreen: one canvas reused for every certificate in the batch, so a
          class of forty does not allocate forty full-size bitmaps. */}
      <canvas ref={canvasRef} className="hidden" aria-hidden />
    </Card>
  );
}
