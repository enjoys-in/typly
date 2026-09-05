import { WARNING_SECONDS } from '@/core/constants';

function fmt(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface Props {
  remainingSec?: number;
  elapsedMs?: number;
}

/** Spoken form, so a screen reader says "9 minutes 48 seconds", not "9:48". */
function spoken(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const minutes = m > 0 ? `${m} minute${m === 1 ? '' : 's'} ` : '';
  return `${minutes}${s} second${s === 1 ? '' : 's'}`;
}

/**
 * One clock face for both readings.
 *
 * `slashed-zero` and `tabular-nums` are not decoration here: at a glance under
 * pressure an unslashed 0 reads as an O, and proportional digits make the whole
 * row jog sideways on every tick. It stays a bare span with no chrome of its
 * own, because the exam-client skin boxes it in its own deliberately plain
 * frame and the modern header boxes it in another.
 */
const CLOCK =
  'font-mono text-[1.375rem] leading-none font-bold tracking-tight slashed-zero tabular-nums';

// Shows countdown (remainingSec) or stopwatch (elapsedMs).
export function Timer({ remainingSec, elapsedMs }: Props) {
  if (remainingSec !== undefined) {
    const warn = remainingSec <= WARNING_SECONDS;
    // A caution step before the alarm. Everything urgent used to go straight to
    // the error red, which left nothing louder for the last thirty seconds.
    const caution = !warn && remainingSec <= WARNING_SECONDS * 2;
    return (
      <span
        // Announced on the minute rather than every tick: `aria-live` would
        // interrupt typing constantly, so only the label carries the value and
        // the warning is what gets spoken.
        role="timer"
        aria-live={warn ? 'polite' : 'off'}
        aria-label={`${spoken(remainingSec)} remaining`}
        className={`${CLOCK} ${warn ? 'text-danger-text' : caution ? 'text-warn-text' : ''}`}
      >
        {fmt(remainingSec)}
      </span>
    );
  }
  const elapsedSec = Math.floor((elapsedMs ?? 0) / 1000);
  return (
    <span role="timer" aria-label={`${spoken(elapsedSec)} elapsed`} className={CLOCK}>
      {fmt(elapsedSec)}
    </span>
  );
}
