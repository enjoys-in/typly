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

// Shows countdown (remainingSec) or stopwatch (elapsedMs).
export function Timer({ remainingSec, elapsedMs }: Props) {
  if (remainingSec !== undefined) {
    const warn = remainingSec <= WARNING_SECONDS;
    return (
      <span className={`font-mono text-xl font-bold tabular-nums ${warn ? 'text-danger-text' : ''}`}>
        {fmt(remainingSec)}
      </span>
    );
  }
  return (
    <span className="font-mono text-xl font-bold tabular-nums">
      {fmt(Math.floor((elapsedMs ?? 0) / 1000))}
    </span>
  );
}
