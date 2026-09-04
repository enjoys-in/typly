/**
 * The small square image that actually gets shared.
 *
 * `CertificateCard` is a formal A4-ish document: right for printing, wrong for
 * a WhatsApp status. What spreads in this market is a square with four numbers
 * on it, legible as a thumbnail, and it is a canvas render away — so the
 * drawing lives here as a pure function of the numbers, with no React and no
 * DOM beyond the canvas it is handed.
 */

/** Square, and large enough that WhatsApp's re-compression still reads. */
export const CARD_SIZE = 1080;

export interface ResultCardData {
  wpm: number;
  accuracy: number;
  /** Exam name, already shortened — a full profile name will not fit. */
  examName: string;
  /** Consecutive practice days, omitted from the card when zero. */
  streak: number;
  /** Passed / failed, which decides the badge. */
  passed: boolean;
  /** Typist's name, or empty to leave the line out. */
  name: string;
  dateLabel: string;
  appName: string;
  /** Brand gradient ends, from the active theme. */
  from: string;
  to: string;
}

interface Tile {
  label: string;
  value: string;
}

/**
 * Draws the card at `CARD_SIZE`. Synchronous and self-contained: the caller
 * owns the canvas and decides what to do with the result, which is what lets
 * the same routine serve a preview, a download and a share sheet.
 */
export function drawResultCard(ctx: CanvasRenderingContext2D, data: ResultCardData): void {
  const S = CARD_SIZE;
  ctx.clearRect(0, 0, S, S);

  // Brand gradient ground, with a soft vignette so white text stays readable
  // wherever the gradient happens to be lightest.
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, data.from);
  grad.addColorStop(1, data.to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);
  const veil = ctx.createRadialGradient(S / 2, S * 0.45, S * 0.2, S / 2, S / 2, S * 0.8);
  veil.addColorStop(0, 'rgba(0,0,0,0)');
  veil.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, S, S);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Header: the app, then the exam this score was measured against.
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `600 ${S * 0.032}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText(data.appName.toUpperCase(), S / 2, S * 0.13);

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${S * 0.052}px ui-sans-serif, system-ui, sans-serif`;
  fitText(ctx, data.examName, S / 2, S * 0.205, S * 0.82);

  // The headline number, as big as it can be — this is what a thumbnail shows.
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${S * 0.26}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText(String(data.wpm), S / 2, S * 0.48);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = `700 ${S * 0.045}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText('NET WPM', S / 2, S * 0.535);

  const tiles: Tile[] = [
    { label: 'Accuracy', value: `${data.accuracy}%` },
    { label: 'Result', value: data.passed ? 'Passed' : 'Practice' },
  ];
  if (data.streak > 0) tiles.push({ label: 'Streak', value: `${data.streak}d` });
  drawTiles(ctx, tiles, S);

  // Footer: who and when, so a shared card still means something in a month.
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `700 ${S * 0.038}px ui-sans-serif, system-ui, sans-serif`;
  if (data.name.trim()) fitText(ctx, data.name.trim(), S / 2, S * 0.9, S * 0.8);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `500 ${S * 0.028}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText(data.dateLabel, S / 2, S * 0.945);
}

function drawTiles(ctx: CanvasRenderingContext2D, tiles: Tile[], S: number): void {
  const gap = S * 0.03;
  const width = (S * 0.82 - gap * (tiles.length - 1)) / tiles.length;
  const height = S * 0.155;
  const top = S * 0.6;
  let x = S * 0.09;

  for (const tile of tiles) {
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    roundRect(ctx, x, top, width, height, S * 0.028);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${S * 0.062}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(tile.value, x + width / 2, top + height * 0.52);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `600 ${S * 0.026}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(tile.label.toUpperCase(), x + width / 2, top + height * 0.82);
    x += width + gap;
  }
}

/** Shrinks the current font until `text` fits `maxWidth`, then draws it. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
): void {
  const original = ctx.font;
  const size = Number.parseFloat(original.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? '16');
  let current = size;
  while (ctx.measureText(text).width > maxWidth && current > size * 0.5) {
    current -= size * 0.05;
    ctx.font = original.replace(/(\d+(?:\.\d+)?)px/, `${current}px`);
  }
  ctx.fillText(text, x, y);
  ctx.font = original;
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

/** A filename that says what it is without leaking anything. */
export function cardFilename(examName: string, wpm: number): string {
  const slug = examName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `typly-${slug || 'result'}-${Math.round(wpm)}wpm.png`;
}
