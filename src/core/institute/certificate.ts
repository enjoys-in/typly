/**
 * The certificate drawing itself, as a pure function of the numbers.
 *
 * Pulled out of the result page's card so that one certificate and a whole
 * batch of them are the *same* certificate — a coaching centre printing twenty
 * must not get a subtly different document from the one the candidate saw.
 * Nothing here touches React or the DOM beyond the canvas it is handed.
 */

import type { InstituteBrand } from './brand';

export const CERT_W = 1200;
export const CERT_H = 820;

export interface CertificateData {
  /** Candidate name, or empty for a blank line to be written on. */
  name: string;
  examName: string;
  netWpm: number;
  accuracy: number;
  errors: number;
  dateLabel: string;
  /** The app's own name, used when no institute brand is set. */
  appName: string;
  /** Brand gradient ends, from the active theme. */
  from: string;
  to: string;
  /** An institute's name, logo and signatory, when one has been configured. */
  brand?: InstituteBrand | null;
  /** A pre-loaded logo image; drawing is synchronous, so loading is the caller's job. */
  logo?: CanvasImageSource | null;
}

const INK = '#0f172a';
const MUTED = '#64748b';
const BODY = '#334155';

export function drawCertificate(ctx: CanvasRenderingContext2D, data: CertificateData): void {
  const W = CERT_W;
  const H = CERT_H;
  const brand = data.brand && data.brand.name.trim() ? data.brand : null;
  const heading = brand?.name ?? data.appName;
  const subheading = brand?.subtitle || (brand ? '' : 'Typing Exam Practice');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Double border: a thick brand-gradient frame with a hairline inside it.
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, data.from);
  grad.addColorStop(1, data.to);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 16;
  roundRect(ctx, 24, 24, W - 48, H - 48, 26);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(15,23,42,0.08)';
  ctx.lineWidth = 2;
  roundRect(ctx, 50, 50, W - 100, H - 100, 16);
  ctx.stroke();

  ctx.textAlign = 'center';

  // An institute logo sits above its name, which pushes the heading down.
  let y = 148;
  if (data.logo) {
    const size = 84;
    ctx.drawImage(data.logo, (W - size) / 2, 92, size, size);
    y = 214;
  }

  ctx.fillStyle = data.to;
  ctx.font = '700 40px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(heading, W / 2, y);
  if (subheading) {
    ctx.fillStyle = MUTED;
    ctx.font = '400 20px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(subheading, W / 2, y + 34);
  }

  ctx.fillStyle = INK;
  ctx.font = '800 54px Georgia, ui-serif, serif';
  ctx.fillText('Certificate of Achievement', W / 2, 288);

  ctx.fillStyle = BODY;
  ctx.font = '400 22px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText('This certifies that', W / 2, 352);

  const displayName = data.name.trim() || 'Typist';
  ctx.fillStyle = data.to;
  ctx.font = '700 48px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(displayName, W / 2, 422);
  const underline = Math.min(680, ctx.measureText(displayName).width + 120);
  ctx.strokeStyle = 'rgba(15,23,42,0.12)';
  ctx.lineWidth = 2;
  line(ctx, W / 2 - underline / 2, 444, W / 2 + underline / 2, 444);

  ctx.fillStyle = BODY;
  ctx.font = '400 24px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(
    `achieved ${data.netWpm} Net WPM at ${data.accuracy}% accuracy`,
    W / 2,
    508,
  );
  ctx.fillText(`in the ${data.examName} typing test`, W / 2, 544);

  drawChips(ctx, W, [
    ['Net WPM', String(data.netWpm)],
    ['Accuracy', `${data.accuracy}%`],
    ['Errors', String(data.errors)],
  ], data.to);

  ctx.fillStyle = BODY;
  ctx.font = '400 20px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(data.dateLabel, W / 2, 726);

  if (brand?.signatory) {
    // A signature block belongs on the right, above a ruled line, the way a
    // printed certificate has it.
    const x = W - 260;
    ctx.strokeStyle = 'rgba(15,23,42,0.25)';
    ctx.lineWidth = 1.5;
    line(ctx, x - 110, 720, x + 110, 720);
    ctx.fillStyle = INK;
    ctx.font = '600 18px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(brand.signatory, x, 744);
    if (brand.signatoryTitle) {
      ctx.fillStyle = MUTED;
      ctx.font = '400 14px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(brand.signatoryTitle, x, 764);
    }
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 15px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(
    `Verified locally by ${data.appName} — nothing left this device`,
    W / 2,
    brand?.signatory ? 786 : 758,
  );
}

function drawChips(
  ctx: CanvasRenderingContext2D,
  W: number,
  chips: [string, string][],
  accent: string,
): void {
  const chipW = 220;
  const gap = 30;
  const totalW = chips.length * chipW + (chips.length - 1) * gap;
  let x = (W - totalW) / 2;
  for (const [label, value] of chips) {
    ctx.fillStyle = '#f1f5f9';
    roundRect(ctx, x, 590, chipW, 88, 14);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.font = '800 34px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(value, x + chipW / 2, 634);
    ctx.fillStyle = MUTED;
    ctx.font = '600 15px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(label.toUpperCase(), x + chipW / 2, 660);
    x += chipW + gap;
  }
}

function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A filename per candidate, so a printed batch is sortable. */
export function certificateFilename(name: string): string {
  const slug = (name.trim() || 'typist').toLowerCase().replace(/\s+/g, '-');
  return `typly-certificate-${slug}.png`;
}
