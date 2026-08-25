import type { OcrEngine } from '../ports';
import { Lang } from '@/core/constants';

// tesseract.js is ~megabytes and only needed when the user actually OCRs an
// image, so it is imported on first use instead of at boot.
type TesseractModule = Awaited<ReturnType<typeof importTesseract>>;
type LoggerMessage = import('tesseract.js').LoggerMessage;
type AssetPaths = Partial<{ workerPath: string; corePath: string; langPath: string }>;

function importTesseract() {
  return import('tesseract.js');
}

let enginePromise: Promise<TesseractModule> | null = null;

function loadEngine(): Promise<TesseractModule> {
  enginePromise ??= importTesseract();
  return enginePromise;
}

// Locally-bundled assets (populated by `bun run ocr:assets`). Absent/broken →
// the recognize call fails once and we permanently fall back to the CDN. Paths
// are document-relative so they resolve under the web root and Electron file://.
function localPaths(): AssetPaths {
  if (typeof document === 'undefined') return {};
  const base = new URL('tesseract/', document.baseURI);
  return {
    workerPath: new URL('worker.min.js', base).href,
    corePath: base.href.replace(/\/$/, ''),
    langPath: new URL('tessdata', base).href,
  };
}

let cdnOnly = false;

// Tesseract in a Web Worker; traineddata is bundled locally when available and
// cached by tesseract.js otherwise.
export class BrowserOcrEngine implements OcrEngine {
  async recognize(
    image: Blob | Uint8Array,
    lang: Lang,
    onProgress?: (p: number) => void,
  ): Promise<string> {
    const Tesseract = await loadEngine();
    const input = image instanceof Blob ? image : new Blob([image as unknown as BlobPart]);
    const logger = (m: LoggerMessage) => {
      if (m.status === 'recognizing text' && onProgress) onProgress(m.progress);
    };
    const paths = cdnOnly ? {} : localPaths();

    try {
      const { data } = await Tesseract.recognize(input, lang, { ...paths, logger });
      return data.text;
    } catch (err) {
      // Bundled assets missing/broken → switch to the CDN and retry once.
      if (Object.keys(paths).length === 0) throw err;
      cdnOnly = true;
      const { data } = await Tesseract.recognize(input, lang, { logger });
      return data.text;
    }
  }
}

