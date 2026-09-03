import { useMemo, useState } from 'react';
import { Check, RotateCcw, ScanText, Sparkles } from 'lucide-react';
import { diffTexts, mergeSegments, countDifferences, type Choice } from '@/core/text/ocrDiff';
import { Button } from '@/ui/Button';
import { useT } from '@/i18n';

interface Props {
  /** Engine A — on-device Tesseract (or the original scan). */
  tesseractText: string;
  /** Engine B reads to choose from — AI versions (v1, v2, …) or a single pass. */
  versions: string[];
  labelA?: string;
  labelB?: string;
  fontFamily?: string;
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

// Reconcile two OCR reads: pick the correct variant per difference and edit the
// final text. When multiple AI versions exist the user picks one (the rest are
// discarded on continue); new versions come from scanning again, not a retry.
export function OcrReview({
  tesseractText,
  versions,
  labelA = 'Tesseract',
  labelB = 'AI',
  fontFamily,
  onConfirm,
  onCancel,
}: Props) {
  const t = useT();
  const [active, setActive] = useState(versions.length - 1);
  const [choices, setChoices] = useState<Record<number, Choice>>({});

  const activeText = versions[active] ?? '';
  const segments = useMemo(() => diffTexts(tesseractText, activeText), [tesseractText, activeText]);
  const diffCount = useMemo(() => countDifferences(segments), [segments]);
  const [text, setText] = useState(() =>
    mergeSegments(diffTexts(tesseractText, versions[versions.length - 1] ?? ''), {}),
  );

  function selectVersion(i: number) {
    setActive(i);
    setChoices({});
    setText(mergeSegments(diffTexts(tesseractText, versions[i] ?? ''), {}));
  }

  function choose(i: number, c: Choice) {
    const next = { ...choices, [i]: c };
    setChoices(next);
    setText(mergeSegments(segments, next));
  }

  function preferAll(c: Choice) {
    const next: Record<number, Choice> = {};
    segments.forEach((s, i) => {
      if (!s.same) next[i] = c;
    });
    setChoices(next);
    setText(mergeSegments(segments, next));
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold">{t('ocr.verify')}</h3>
        <p className="mt-1 text-sm text-fg-muted">
          {versions.length > 1
            ? `You have ${versions.length} ${labelB} versions — pick one, then review and continue.`
            : diffCount === 0
              ? 'Both reads agree. Review and continue.'
              : `${diffCount} spot${diffCount === 1 ? '' : 's'} differ between ${labelA} and ${labelB}. Pick the correct one, or edit below.`}
        </p>
      </div>

      {versions.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-fg-muted">{labelB} versions:</span>
          {versions.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectVersion(i)}
              className={`rounded-control px-2.5 py-1 font-semibold transition-colors ${
                active === i
                  ? 'bg-accent text-accent-fg'
                  : 'bg-surface-2 text-fg-muted hover:bg-surface-3'
              }`}
            >
              v{i + 1}
            </button>
          ))}
          <span className="text-fg-subtle">{t('ocr.keepSelected')}</span>
        </div>
      )}

      {diffCount > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-fg-muted">{t('ocr.quickPick')}</span>
            <Button size="sm" variant="secondary" onClick={() => preferAll('b')}>
              <Sparkles size={14} /> All {labelB}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => preferAll('a')}>
              <ScanText size={14} /> All {labelA}
            </Button>
            <span className="ml-1 flex items-center gap-3 text-fg-subtle">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" /> {labelB}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-surface-3" /> {labelA}
              </span>
            </span>
          </div>

          <div
            className="scroll-area max-h-56 overflow-auto rounded-panel border border-line bg-surface p-3 text-sm leading-relaxed"
            style={{ fontFamily }}
          >
            {segments.map((s, i) =>
              s.same ? (
                <span key={i}>{s.b || s.a}</span>
              ) : (
                <span key={i} className="mx-0.5 inline-flex items-center gap-0.5 align-baseline">
                  <button
                    type="button"
                    onClick={() => choose(i, 'a')}
                    title={labelA}
                    className={`rounded-inner px-1 transition-colors ${
                      (choices[i] ?? 'b') === 'a'
                        ? 'bg-surface-3 text-fg ring-1 ring-edge'
                        : 'text-fg-subtle line-through opacity-70 hover:opacity-100'
                    }`}
                  >
                    {s.a.trim() ? s.a : '␀'}
                  </button>
                  <button
                    type="button"
                    onClick={() => choose(i, 'b')}
                    title={labelB}
                    className={`rounded-inner px-1 transition-colors ${
                      (choices[i] ?? 'b') === 'b'
                        ? 'bg-accent-soft text-accent-soft-fg ring-1 ring-accent-border'
                        : 'text-fg-subtle opacity-70 hover:opacity-100'
                    }`}
                  >
                    {s.b.trim() ? s.b : '␀'}
                  </button>
                </span>
              ),
            )}
          </div>
        </>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-fg-muted">{t('ocr.finalText')}</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ fontFamily }}
          className="scroll-area h-40 w-full resize-none rounded-control border border-edge bg-field p-3 font-mono text-sm outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent-ring"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onCancel}>
          <RotateCcw size={16} /> {t('ocr.scanAgain')}
        </Button>
        <Button onClick={() => onConfirm(text)} disabled={text.trim().length < 1}>
          <Check size={16} /> {t('ocr.useThis')}
        </Button>
      </div>
    </div>
  );
}

