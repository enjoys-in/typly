import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { AlertTriangle, FileText, FileType, FileType2, Image as ImageIcon, Sparkles, Upload, X } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { cleanText } from '@/core/text/ocrCleanup';
import { textStats } from '@/core/text/textStats';
import { recognizeVision, bytesToDataUrl } from '@/platform/browser/visionOcr';
import { preprocessImageForOcr } from '@/platform/browser/imagePreprocess';
import { AiRequestError } from '@/platform/browser/aiTransport';
import { RATE_LIMIT_STATUS } from '@/core/ai/rateLimit';
import { currentAiSettings, isAiEnabled, useAiSettingsStore } from '@/store/aiSettingsStore';
import { sourceForFile } from '@/core/text/fileKind';
import { Lang, SourceType } from '@/core/constants';
import { Button } from '@/ui/Button';
import { ProgressBar } from '@/ui/ProgressBar';
import { OcrReview } from './OcrReview';

interface Props {
  lang: Lang;
  onText: (text: string, source: SourceType) => void;
  /**
   * A file handed over by the OS ("Open with Typly", or a double-clicked .txt).
   * It goes through exactly the same extraction as a dropped file — progress,
   * OCR verification and all.
   */
  incoming?: { name: string; bytes: Uint8Array } | null;
  /** Called once `incoming` has been picked up, so it is never re-imported. */
  onIncomingTaken?: () => void;
}

type Phase = 'idle' | SourceType.Image | SourceType.Pdf | SourceType.Docx;

const PHASE_LABEL: Record<Exclude<Phase, 'idle'>, string> = {
  [SourceType.Image]: 'Reading image (OCR)',
  [SourceType.Pdf]: 'Reading PDF',
  [SourceType.Docx]: 'Reading document',
};

function fmt(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
}

export function TextUploader({ lang, onText, incoming = null, onIncomingTaken }: Props) {
  const platform = usePlatform();
  const ai = useAiSettingsStore();
  const [pasted, setPasted] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0); // 0..1 (real, from Tesseract)
  const [elapsedMs, setElapsedMs] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // AI second-engine verification + the resulting review.
  const [verifyLabel, setVerifyLabel] = useState<string | null>(null);
  const [verifyMs, setVerifyMs] = useState(0);
  // Accumulated AI reads (v1, v2, …) — kept across scans, cleared on continue.
  const [visionVersions, setVisionVersions] = useState<string[]>([]);
  const [review, setReview] = useState<
    { a: string; versions: string[]; labelA: string; labelB: string } | null
  >(null);
  // Rate-limited AI verify: keep the on-device text and let the user retry.
  const [aiSkip, setAiSkip] = useState<{ text: string; message: string } | null>(null);
  const lastBytes = useRef<Uint8Array | null>(null);
  const startRef = useRef(0);

  const busy = phase !== 'idle';
  const working = busy || verifyLabel !== null;
  const determinate = phase === SourceType.Image;
  // Once text is being pasted the user has picked that path — collapse the
  // drop zone so the confirm button stays in view without scrolling.
  const pasting = pasted.trim().length > 0;
  const pastedStats = useMemo(() => textStats(pasted), [pasted]);
  const pct = Math.round(progress * 100);
  const etaMs = determinate && progress > 0.03 ? (elapsedMs * (1 - progress)) / progress : null;

  // Tick elapsed time while processing.
  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setElapsedMs(Date.now() - startRef.current), 250);
    return () => clearInterval(id);
  }, [busy]);

  // Elapsed seconds for the AI verify step (which can take a minute or two).
  useEffect(() => {
    if (!verifyLabel) return;
    const start = Date.now();
    setVerifyMs(0);
    const id = setInterval(() => setVerifyMs(Date.now() - start), 1000);
    return () => clearInterval(id);
  }, [verifyLabel]);

  // A file the OS asked Typly to open. Keyed on the byte buffer's identity so
  // re-renders — and StrictMode's double mount — can't import it twice.
  const importedRef = useRef<Uint8Array | null>(null);
  useEffect(() => {
    if (!incoming || importedRef.current === incoming.bytes) return;
    importedRef.current = incoming.bytes;
    onIncomingTaken?.();
    const source = sourceForFile(incoming.name);
    if (!source) {
      setError(`Typly can't read "${incoming.name}". Paste the text instead.`);
      return;
    }
    void process(source, incoming.bytes);
    // Deliberately keyed on the file alone: the extraction should use the
    // language and AI settings in force when the file landed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming]);

  async function extract(source: Exclude<Phase, 'idle'>, bytes: Uint8Array): Promise<void> {
    setError(null);
    setProgress(0);
    setElapsedMs(0);
    startRef.current = Date.now();
    setPhase(source);
    try {
      if (source === SourceType.Image) {
        await extractImage(bytes);
        return;
      }
      let text = '';
      if (source === SourceType.Pdf) {
        const { pages } = await platform.pdf.extractText(bytes);
        if (pages.length > 0 && pages.every((p) => p.scanned)) throw new Error('scanned');
        text = pages.map((p) => p.text).join('\n\n');
      } else {
        const { default: mammoth } = await import('mammoth');
        const { value } = await mammoth.extractRawText({ arrayBuffer: bytes.buffer as ArrayBuffer });
        text = value;
      }
      const cleaned = cleanText(text, lang);
      if (cleaned.trim().length < 3) throw new Error('empty');
      setPhase('idle');
      onText(cleaned, source);
    } catch (e) {
      setPhase('idle');
      setVerifyLabel(null);
      const scanned = e instanceof Error && e.message === 'scanned';
      setError(
        source === SourceType.Image || scanned
          ? "Couldn't read text from that file. Try a clearer, high-contrast image, switch the OCR language — or just paste the text / upload a PDF instead."
          : "Couldn't read that file. Please paste the text, or try a different file.",
      );
    }
  }

  // Image: on-device Tesseract first. With AI configured, verify against the AI
  // vision engine; otherwise run a second on-device pass. Either way, diverging
  // reads go to the review UI.
  async function extractImage(bytes: Uint8Array): Promise<void> {
    lastBytes.current = bytes;
    const tClean = cleanText(await platform.ocr.recognize(bytes, lang, setProgress), lang);
    if (tClean.trim().length < 3) throw new Error('empty');
    setPhase('idle');
    if (ai.configured && isAiEnabled()) await runVision(bytes, tClean);
    else await runSecondOcr(bytes, tClean);
  }

  // Run the AI second engine over `bytes`, given the on-device `tClean` baseline.
  async function runVision(bytes: Uint8Array, tClean: string): Promise<void> {
    setVerifyLabel('Verifying with AI…');
    let vClean: string | null = null;
    let rateLimited: string | null = null;
    try {
      const v = cleanText(await recognizeVision(bytesToDataUrl(bytes), currentAiSettings(ai), lang), lang);
      if (v.trim().length >= 3) vClean = v;
    } catch (err) {
      // Rate limited: surface it. Any other failure (no key / offline) stays silent.
      if (err instanceof AiRequestError && err.status === RATE_LIMIT_STATUS) rateLimited = err.message;
    }
    setVerifyLabel(null);
    if (rateLimited) {
      setAiSkip({ text: tClean, message: rateLimited });
      return;
    }
    const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
    if (vClean) {
      // Save this read as the next version; keep earlier ones to compare.
      const versions = [...visionVersions, vClean];
      setVisionVersions(versions);
      if (versions.length > 1 || norm(vClean) !== norm(tClean)) {
        setReview({ a: tClean, versions, labelA: 'Tesseract', labelB: 'AI' });
        return;
      }
      setVisionVersions([]);
      onText(vClean, SourceType.Image);
      return;
    }
    onText(tClean, SourceType.Image);
  }

  // AI off: a second on-device pass on a cleaned-up (binarized) image, diffed
  // against the raw pass so the user still gets a two-way review.
  async function runSecondOcr(bytes: Uint8Array, tClean: string): Promise<void> {
    setVerifyLabel('Re-reading the image…');
    let t2Clean: string | null = null;
    try {
      const pre = await preprocessImageForOcr(bytes);
      const t2 = cleanText(await platform.ocr.recognize(pre, lang), lang);
      if (t2.trim().length >= 3) t2Clean = t2;
    } catch {
      t2Clean = null;
    }
    setVerifyLabel(null);
    const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
    if (t2Clean && norm(t2Clean) !== norm(tClean)) {
      setReview({ a: tClean, versions: [t2Clean], labelA: 'Original', labelB: 'Enhanced' });
      return;
    }
    onText(tClean, SourceType.Image);
  }

  function retryVision(): void {
    const bytes = lastBytes.current;
    const text = aiSkip?.text;
    if (bytes && text) {
      setAiSkip(null);
      void runVision(bytes, text);
    }
  }

  // Plain .txt needs no extraction — decode the bytes as UTF-8 directly.
  async function readTextFile(bytes: Uint8Array): Promise<void> {
    setError(null);
    try {
      const cleaned = cleanText(new TextDecoder().decode(bytes), lang);
      if (cleaned.trim().length < 1) throw new Error('empty');
      onText(cleaned, SourceType.Text);
    } catch {
      setError("Couldn't read that text file. Try pasting the text instead.");
    }
  }

  async function process(source: SourceType, bytes: Uint8Array): Promise<void> {
    if (source === SourceType.Text) return readTextFile(bytes);
    await extract(source, bytes);
  }

  async function pick(source: SourceType) {
    const file = await platform.files.pick(source);
    if (file) await process(source, file.bytes);
  }

  async function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (working) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const source = sourceForFile(file.name, file.type);
    if (!source) {
      setError('Unsupported file. Drop an image, PDF, .docx or .txt — or paste text.');
      return;
    }
    await process(source, new Uint8Array(await file.arrayBuffer()));
  }

  if (review) {
    return (
      <OcrReview
        tesseractText={review.a}
        versions={review.versions}
        labelA={review.labelA}
        labelB={review.labelB}
        onConfirm={(t) => {
          setReview(null);
          setVisionVersions([]);
          onText(t, SourceType.Image);
        }}
        onCancel={() => setReview(null)}
      />
    );
  }

  if (aiSkip) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-panel border border-line bg-surface p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-fg-subtle" />
          <div className="space-y-1">
            <p className="text-sm font-medium">AI verification skipped</p>
            <p className="text-sm text-fg-muted">{aiSkip.message}</p>
            <p className="text-xs text-fg-subtle">The on-device (Tesseract) text is ready to use.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              const t = aiSkip.text;
              setAiSkip(null);
              onText(t, SourceType.Image);
            }}
          >
            Continue with on-device text
          </Button>
          <Button variant="secondary" onClick={retryVision}>
            Retry AI
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-fg-muted">
          Paste a paragraph
        </label>
        {/* Once the user commits to pasting, the drop zone below collapses and
            the field takes the freed screen height — long paragraphs scroll
            inside it so the page never gains a scrollbar. */}
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder="Paste text here…"
          className={`scroll-area w-full resize-none rounded-control border border-edge bg-field p-3 font-mono text-sm outline-none ${
            pasting
              ? 'h-[calc(100dvh-19rem)] min-h-36'
              : 'h-36'
          }`}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs tabular-nums text-fg-muted">
            {pasting && `${pastedStats.words} words · ${pastedStats.chars} characters`}
          </span>
          <Button
            disabled={!pasting}
            onClick={() => onText(cleanText(pasted, lang), SourceType.Text)}
          >
            Use pasted text
          </Button>
        </div>
      </div>

      {!pasting && (
        <>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-fg-subtle">
          <span className="h-px flex-1 bg-line" />
          or upload a file
          <span className="h-px flex-1 bg-line" />
        </div>

        <div
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`rounded-panel border-2 border-dashed p-6 text-center transition-colors ${
            dragOver
              ? 'border-accent bg-accent-soft'
              : 'border-edge'
          }`}
        >
          <Upload className="mx-auto mb-2 text-fg-subtle" />
          <p className="mb-4 text-sm text-fg-muted">Drag &amp; drop a file here, or choose one:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="secondary" size="sm" disabled={working} onClick={() => pick(SourceType.Image)}>
              <ImageIcon size={16} /> Image
            </Button>
            <Button variant="secondary" size="sm" disabled={working} onClick={() => pick(SourceType.Pdf)}>
              <FileText size={16} /> PDF
            </Button>
            <Button variant="secondary" size="sm" disabled={working} onClick={() => pick(SourceType.Docx)}>
              <FileType2 size={16} /> .docx
            </Button>
            <Button variant="secondary" size="sm" disabled={working} onClick={() => pick(SourceType.Text)}>
              <FileType size={16} /> .txt
            </Button>
          </div>
          <p className="mt-3 text-xs text-fg-subtle">PNG · JPG · WebP · PDF · DOCX · TXT</p>
        </div>
        </>
      )}

      {verifyLabel && (
        <div className="space-y-2 rounded-panel border border-line p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles size={16} className="text-accent" /> {verifyLabel}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
          </div>
          <p className="text-xs text-fg-muted">
            {verifyLabel.includes('AI')
              ? `AI reading can take a minute or two — please keep this open. ${Math.floor(verifyMs / 1000)}s elapsed.`
              : `${Math.floor(verifyMs / 1000)}s elapsed.`}
          </p>
        </div>
      )}

      {busy && (
        <div className="space-y-2 rounded-panel border border-line p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{PHASE_LABEL[phase]}…</span>
            {determinate && (
              <span className="tabular-nums text-fg-muted">
                {progress > 0 ? `${pct}%` : 'Preparing…'}
              </span>
            )}
          </div>
          {determinate ? (
            <ProgressBar value={pct} />
          ) : (
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
            </div>
          )}
          <div className="flex justify-between text-xs text-fg-muted">
            <span>Elapsed {fmt(elapsedMs)}</span>
            {etaMs != null && <span>ETA ~{fmt(etaMs)}</span>}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-panel border border-danger-border bg-danger-soft p-4 text-sm text-danger-soft-fg">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss"
            className="cursor-pointer text-danger-text hover:text-danger-soft-fg"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
