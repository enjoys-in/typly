import { useEffect, useId, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { useT } from '@/i18n';

type Side = 'top' | 'bottom';
type Align = 'start' | 'center' | 'end';

const SIDE: Record<Side, string> = {
  top: 'bottom-full mb-2',
  bottom: 'top-full mt-2',
};

// `end` is the safe default next to a control on the right edge of a panel:
// the bubble grows inwards, where there is room, instead of off-screen.
const ALIGN: Record<Align, string> = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
};

interface Props {
  /** The explanation itself — a sentence or two, no markup. */
  text: string;
  /** What the explanation is about, for the button's accessible name. */
  subject?: string;
  side?: Side;
  align?: Align;
  className?: string;
}

/**
 * The small "i" next to a control, for the paragraph that explains it.
 *
 * Every feature needs a sentence saying what it does, and putting that sentence
 * on the panel makes the panel a wall of prose — the controls stop being the
 * point. This keeps the explanation one hover (or one tap) away instead.
 *
 * It answers to hover *and* to click, because hover does not exist on a phone:
 * a tap pins the bubble open until the next tap, Escape, or a click elsewhere.
 * The bubble is a real `role="tooltip"` wired up with `aria-describedby`, so a
 * screen reader reads the explanation as part of the button it belongs to.
 */
export function InfoHint({ text, subject, side = 'top', align = 'end', className = '' }: Props) {
  const t = useT();
  const id = useId();
  const wrapper = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || keyboard || pinned;

  // Only a pinned bubble needs dismissing: a hovered one closes itself.
  useEffect(() => {
    if (!pinned) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPinned(false);
    }
    function onDown(e: PointerEvent) {
      if (!wrapper.current?.contains(e.target as Node)) setPinned(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [pinned]);

  return (
    <span
      ref={wrapper}
      className={`relative inline-flex shrink-0 align-middle ${className}`}
      onPointerEnter={(e) => {
        // A touch "enter" fires on tap and would leave the bubble stuck open
        // with nothing to un-hover it.
        if (e.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-label={subject ? t('info.about', { subject }) : t('info.more')}
        aria-describedby={open ? id : undefined}
        onClick={() => setPinned((p) => !p)}
        // Keyboard focus opens it; a tap must not, or the tap that closes a
        // pinned bubble would leave it open through the focus it just gave.
        onFocus={(e) => setKeyboard(e.currentTarget.matches(':focus-visible'))}
        onBlur={() => setKeyboard(false)}
        className="flex h-5 w-5 cursor-help items-center justify-center rounded-full text-fg-subtle outline-none transition-colors hover:bg-surface-hover hover:text-fg-muted focus-visible:ring-2 focus-visible:ring-accent-ring"
      >
        <Info size={14} />
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className={`absolute z-30 w-[min(17rem,calc(100vw-2.5rem))] rounded-panel border border-line bg-surface px-3 py-2 text-left text-[12.5px] leading-relaxed font-normal text-fg-muted normal-case shadow-e2 ${SIDE[side]} ${ALIGN[align]}`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
