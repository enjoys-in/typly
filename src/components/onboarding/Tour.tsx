import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Button } from '@/ui/Button';
import { useT } from '@/i18n';

export interface TourStep {
  /** CSS selector for the element to spotlight. Missing → the card is centred. */
  target: string;
  title: string;
  body: string;
}

interface Props {
  steps: TourStep[];
  onDone: () => void;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const CARD_WIDTH = 320;
const GAP = 14;

/** The spotlight hole for an element: its box, with a little breathing room. */
function boxOf(el: Element): Box {
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PADDING,
    left: r.left - PADDING,
    width: r.width + PADDING * 2,
    height: r.height + PADDING * 2,
  };
}

/**
 * A guided walkthrough: dim the page, cut a hole around the step's target, and
 * explain it. Generic on purpose — it takes selectors and copy, and knows
 * nothing about which features it is pointing at.
 */
export function Tour({ steps, onDone }: Props) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    if (!el) {
      // The target may mount a frame after the tour does; try again next frame
      // before falling back to a centred card.
      setBox(null);
      requestAnimationFrame(() => {
        const late = document.querySelector(step.target);
        if (late) setBox(boxOf(late));
      });
      return;
    }
    el.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    setBox(boxOf(el));
  }, [step]);

  useLayoutEffect(measure, [measure]);

  // The rail can collapse and the window can resize mid-tour.
  useEffect(() => {
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  // Focus the card so the tour is operable from the keyboard immediately.
  useEffect(() => {
    cardRef.current?.focus();
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, steps.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onDone, steps.length]);

  if (!step) return null;

  // Beside the target where there is room, otherwise centred.
  const card: React.CSSProperties = box
    ? {
        top: Math.min(Math.max(GAP, box.top), Math.max(GAP, window.innerHeight - 220)),
        left:
          box.left + box.width + GAP + CARD_WIDTH < window.innerWidth
            ? box.left + box.width + GAP
            : Math.max(GAP, box.left - CARD_WIDTH - GAP),
        width: CARD_WIDTH,
      }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: CARD_WIDTH };

  return createPortal(
    <div className="fixed inset-0 z-[60]" role="presentation">
      {/* The dim comes from an enormous shadow around the hole, so the target
          stays fully readable without cloning it. */}
      {box ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-control ring-2 ring-white/70"
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
            boxShadow: '0 0 0 9999px rgba(2,6,23,0.72)',
          }}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-[rgba(2,6,23,0.72)]" />
      )}

      <div
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className="absolute rounded-panel border border-edge bg-surface p-5 shadow-xl outline-none"
        style={card}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">
            {t('tour.step', { current: index + 1, total: steps.length })}
          </p>
          <button
            type="button"
            onClick={onDone}
            aria-label={t('tour.skipAria')}
            className="cursor-pointer rounded-control p-1 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-ring"
          >
            <X size={16} />
          </button>
        </div>

        <h2 id="tour-title" className="mt-2 text-base font-semibold">
          {step.title}
        </h2>
        <p id="tour-body" className="mt-1.5 text-sm leading-relaxed text-fg-muted">
          {step.body}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onDone}
            className="cursor-pointer rounded-control text-xs font-medium text-fg-subtle transition-colors hover:text-fg-muted focus-visible:ring-2 focus-visible:ring-accent-ring"
          >
            {t('tour.skip')}
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <Button size="sm" variant="secondary" onClick={() => setIndex(index - 1)}>
                <ArrowLeft size={14} /> {t('tour.back')}
              </Button>
            )}
            <Button size="sm" onClick={() => (isLast ? onDone() : setIndex(index + 1))}>
              {t(isLast ? 'tour.gotIt' : 'tour.next')}
              {!isLast && <ArrowRight size={14} />}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
