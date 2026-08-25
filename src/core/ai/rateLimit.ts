// Rate-limit helpers shared by the backend provider and the client transport so
// a 429 always surfaces the same friendly "slow down, try again in X" message.
export const RATE_LIMIT_STATUS = 429;

// Parse an HTTP `Retry-After` header (delta-seconds or HTTP date) to seconds.
export function retryAfterSeconds(header: string | null | undefined): number | null {
  if (!header) return null;
  const secs = Number(header);
  if (Number.isFinite(secs) && secs >= 0) return Math.max(1, Math.round(secs));
  const at = Date.parse(header);
  if (!Number.isNaN(at)) return Math.max(1, Math.round((at - Date.now()) / 1000));
  return null;
}

function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

export function rateLimitMessage(seconds: number | null): string {
  const when = seconds ? `about ${formatWait(seconds)}` : 'a little while';
  return `Too many requests — please slow down and try again in ${when}.`;
}
