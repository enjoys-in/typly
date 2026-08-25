import type { PdfPage, PdfReader } from '../ports';

// pdfjs plus its worker asset is the single largest dependency in the bundle and
// is only needed when a PDF is opened, so it loads on first use.
let libPromise: Promise<typeof import('pdfjs-dist')> | null = null;

function loadPdfjs() {
  libPromise ??= (async () => {
    const [pdfjs, worker] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]);
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjs;
  })();
  return libPromise;
}

export class BrowserPdfReader implements PdfReader {
  async extractText(bytes: Uint8Array): Promise<{ pages: PdfPage[] }> {
    const pdfjs = await loadPdfjs();
    const pdf = await pdfjs.getDocument({ data: bytes }).promise;
    const pages: PdfPage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((it) => ('str' in it ? it.str : ''))
        .join(' ')
        .trim();
      pages.push({ text, scanned: text.length < 8 });
    }
    return { pages };
  }
}
