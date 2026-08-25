// One transport for the AI backend channels: over IPC in the packaged desktop
// app (Electron main serves them), or the matching HTTP route on the web/dev
// server. `window.bridge` is typed globally in platform/electron/repository.ts.
import { AI_HTTP_ROUTE, type AiChannel } from '@/core/ipc/channels';
import { RATE_LIMIT_STATUS, rateLimitMessage, retryAfterSeconds } from '@/core/ai/rateLimit';

interface HandlerResult {
  status: number;
  body: unknown;
}

// Carries the backend status so callers can react (e.g. rate limits).
export class AiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AiRequestError';
  }
}

export async function callAi(
  channel: AiChannel,
  payload: unknown,
  signal?: AbortSignal,
): Promise<unknown> {
  const bridge = window.bridge?.ai;
  if (bridge) {
    const { status, body } = (await bridge.invoke(channel, payload)) as HandlerResult;
    if (status < 200 || status >= 300 || isError(body)) {
      throw new AiRequestError(message(body, status, null), status);
    }
    return body;
  }

  const res = await fetch(AI_HTTP_ROUTE[channel], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => null)) as unknown;
  if (!res.ok || isError(data)) {
    throw new AiRequestError(message(data, res.status, res.headers.get('retry-after')), res.status);
  }
  return data;
}

function isError(body: unknown): boolean {
  return !body || (typeof body === 'object' && 'error' in body);
}

function message(body: unknown, status: number, retryAfter: string | null): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const err = (body as { error: unknown }).error;
    if (typeof err === 'string' && err) return err;
  }
  if (status === RATE_LIMIT_STATUS) return rateLimitMessage(retryAfterSeconds(retryAfter));
  return `AI request failed (${status}).`;
}
