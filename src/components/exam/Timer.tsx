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

// Shows countdown (remainingSec) or stopwatch (elapsedMs).
export function Timer({ remainingSec, elapsedMs }: Props) {
  if (remainingSec !== undefined) {
    const warn = remainingSec <= WARNING_SECONDS;
    return (
      <span
        // Announced on the minute rather than every tick: `aria-live` would
        // interrupt typing constantly, so only the label carries the value and
        // the warning is what gets spoken.
        role="timer"
        aria-live={warn ? 'polite' : 'off'}
        aria-label={`${spoken(remainingSec)} remaining`}
        className={`font-mono text-xl font-bold tabular-nums ${warn ? 'text-danger-text' : ''}`}
      >
        {fmt(remainingSec)}
      </span>
    );
  }
  const elapsedSec = Math.floor((elapsedMs ?? 0) / 1000);
  return (
    <span
      role="timer"
      aria-label={`${spoken(elapsedSec)} elapsed`}
      className="font-mono text-xl font-bold tabular-nums"
    >
      {fmt(elapsedSec)}
    </span>
  );
}
