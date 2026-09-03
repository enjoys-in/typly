import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

/** Quiet zone, in modules. Below four, some scanners refuse to read the code. */
const MARGIN = 4;

interface Props {
  /** The text to encode — short enough to stay scannable, e.g. a URL. */
  value: string;
  /** Rendered edge length in pixels. */
  size?: number;
  /** What the code is for, read out in place of the image. */
  label: string;
}

/**
 * A QR code, drawn as one SVG path — no canvas, no image, nothing to load.
 *
 * The colours are fixed rather than themed: a scanner needs dark modules on a
 * light background, so inverting this in dark mode would produce a picture of a
 * QR code that no phone can read.
 */
export function QrCode({ value, size = 200, label }: Props) {
  const { path, span } = useMemo(() => encode(value), [value]);

  return (
    <svg
      viewBox={`0 0 ${span} ${span}`}
      width={size}
      height={size}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className="rounded-control bg-white"
    >
      <path d={path} fill="#000" />
    </svg>
  );
}

/**
 * Every dark module as a one-unit square in a single path, which keeps the
 * markup small — a URL-sized code is around 1,000 modules.
 */
function encode(value: string): { path: string; span: number } {
  // Type 0 picks the smallest version that fits; M correction tolerates a
  // little glare or a fingerprint on the screen.
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();

  const count = qr.getModuleCount();
  const parts: string[] = [];
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (qr.isDark(row, col)) parts.push(`M${col + MARGIN} ${row + MARGIN}h1v1h-1z`);
    }
  }
  return { path: parts.join(''), span: count + MARGIN * 2 };
}
