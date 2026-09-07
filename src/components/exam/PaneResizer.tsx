import { useCallback, type KeyboardEvent, type PointerEvent } from 'react';
import {
  EXAM_INPUT_SHARE_DEFAULT,
  EXAM_INPUT_SHARE_MAX,
  EXAM_INPUT_SHARE_MIN,
  EXAM_INPUT_SHARE_STEP,
} from '@/core/constants';
import { useT } from '@/i18n';

interface Props {
  /** Height the pane *below* the handle takes, as a fraction of the split. */
  share: number;
  onChange: (share: number) => void;
}

function clamp(share: number): number {
  return Math.min(EXAM_INPUT_SHARE_MAX, Math.max(EXAM_INPUT_SHARE_MIN, share));
}

/**
 * The divider between the passage and the typing field.
 *
 * Drag it and both panes change together — one grows by exactly what the other
 * gives up, which is the only behaviour that makes sense when they are the two
 * halves of one screen. Someone copy-typing a long paragraph wants the field
 * deep enough to check the last few lines they typed; someone reading a dense
 * passage wants the opposite, and neither preference is the app's to pick.
 *
 * It reports a **fraction**, not a pixel height. The column it lives in also
 * holds the on-screen keyboard, the pacer and the progress strip, all of which
 * appear and disappear during a run, and a stored pixel height would overflow
 * the column or leave a hole every time one of them did. The total is measured
 * from the parent at the moment the drag starts, so the ratio is always applied
 * to the space that actually exists.
 *
 * Keyboard-operable, because a control that only answers to a drag is a control
 * half the users of an exam app cannot reach: it is a real `separator` with
 * arrow keys and a Home reset, and it reports its position out loud.
 */
export function PaneResizer({ share, onChange }: Props) {
  const t = useT();

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      // Only the primary button drags; a right-click must not start one.
      if (e.button !== 0) return;
      // Dragging must not take the focus off the typing field. Pressing a
      // focusable element normally moves focus to it, which would leave the
      // run with the clock ticking and the keystrokes going into a splitter —
      // the same trap pausing used to set. Suppressing the default also stops
      // the drag selecting the passage text behind it, and costs nothing for
      // keyboard users, who reach the handle by Tab and never by pointer.
      e.preventDefault();
      const handle = e.currentTarget;
      const track = handle.parentElement;
      if (!track) return;
      // The height the two panes actually share, this instant — everything the
      // split holds except the handle itself.
      const total = track.getBoundingClientRect().height - handle.offsetHeight;
      if (total <= 0) return;

      const startY = e.clientY;
      const startShare = share;
      handle.setPointerCapture(e.pointerId);
      handle.dataset.dragging = '1';

      // Dragging *up* makes the field bigger, so the delta is subtracted.
      const move = (ev: globalThis.PointerEvent) =>
        onChange(clamp(startShare - (ev.clientY - startY) / total));
      const up = () => {
        delete handle.dataset.dragging;
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        handle.removeEventListener('pointercancel', up);
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
    },
    [share, onChange],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Up grows the field, matching the drag direction rather than the axis.
    if (e.key === 'ArrowUp') onChange(clamp(share + EXAM_INPUT_SHARE_STEP));
    else if (e.key === 'ArrowDown') onChange(clamp(share - EXAM_INPUT_SHARE_STEP));
    else if (e.key === 'Home' || e.key === 'Enter') onChange(EXAM_INPUT_SHARE_DEFAULT);
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={t('exam.resizeLabel')}
      aria-valuenow={Math.round(share * 100)}
      aria-valuemin={Math.round(EXAM_INPUT_SHARE_MIN * 100)}
      aria-valuemax={Math.round(EXAM_INPUT_SHARE_MAX * 100)}
      tabIndex={0}
      title={t('exam.resizeHint')}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      // Double-click is the convention every splitter has, and the only way
      // back from a drag that went too far that is not a second drag.
      onDoubleClick={() => onChange(EXAM_INPUT_SHARE_DEFAULT)}
      // A tall hit area around a short line: the padding is what makes it
      // catchable without aiming, and it doubles as the gap between the two
      // panes so the split container needs no gap of its own.
      className="pane-resizer"
    >
      <span aria-hidden className="pane-resizer-rule" />
      {/* The grip, so the rule reads as something to take hold of rather than
          a border that happens to be there. */}
      <span aria-hidden className="pane-resizer-grip">
        <span />
      </span>
    </div>
  );
}
