// A second, AI-free OCR "engine": re-read the same image after light cleanup
// (grayscale + threshold binarization + upscaling) so it can be diffed against
// the raw pass. Runs on a canvas in the renderer (web + Electron).
export async function preprocessImageForOcr(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') return bytes;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(new Blob([bytes as BlobPart]));
  } catch {
    return bytes;
  }

  const scale = bitmap.width < 1000 ? 2 : 1; // upscale small scans for sharper glyphs
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return bytes;
  ctx.drawImage(bitmap, 0, 0, w, h);

  const image = ctx.getImageData(0, 0, w, h);
  const d = image.data;
  const gray = (i: number): number => d[i]! * 0.299 + d[i + 1]! * 0.587 + d[i + 2]! * 0.114;

  // Global mean threshold — simple, robust, and enough to shift the OCR result.
  let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += gray(i);
  const threshold = sum / (w * h);

  for (let i = 0; i < d.length; i += 4) {
    const v = gray(i) >= threshold ? 255 : 0;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return bytes;
  return new Uint8Array(await blob.arrayBuffer());
}
