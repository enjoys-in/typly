// Fetches a batch of motivational quotes from ZenQuotes on the app's behalf.
//
// This runs in a trusted process (Electron main, or the dev/preview server)
// rather than in the renderer, and not by preference: zenquotes.io serves no
// `Access-Control-Allow-Origin` header at all, so a fetch from the page is
// blocked by CORS on the web. Doing it here also keeps the app's traffic to one
// request per batch, which matters — the free tier rate-limits by IP, and a
// request per slow run would trip it during a practice session.

import type { Quote } from '../../src/core/motivation/quotes';

/** 50 quotes in one response, which is the whole point of using this route. */
const BATCH_URL = 'https://zenquotes.io/api/quotes';

/** The API is a nicety; nothing waits on it for long. */
const TIMEOUT_MS = 6_000;

/** One entry as ZenQuotes serves it: quote, author, and pre-rendered HTML. */
interface ZenQuote {
  q?: unknown;
  a?: unknown;
}

/**
 * The rate-limit placeholder.
 *
 * Over quota, the free tier answers 429 with a body that is still a well-formed
 * one-entry quote array — "Too many requests. Obtain an auth key…", credited to
 * zenquotes.io. The status is what actually catches it; this marker is the
 * backstop, because a reader that went by shape alone would cheerfully show
 * that notice to the user as today's inspiration.
 */
const RATE_LIMIT_MARKER = 'too many requests';

export interface QuotesResult {
  quotes: Quote[];
}

export async function fetchQuotes(signal?: AbortSignal): Promise<QuotesResult> {
  // The caller's signal and our own deadline both have to be able to abort the
  // request, and `AbortSignal.any` is the only way to wait on either.
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const res = await fetch(BATCH_URL, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Quote service returned ${res.status}.`);

  const raw: unknown = await res.json();
  if (!Array.isArray(raw)) throw new Error('Quote service returned an unexpected shape.');

  const quotes = raw
    .map((entry) => normalise(entry as ZenQuote))
    .filter((quote): quote is Quote => quote !== null);

  // An over-quota response is one placeholder quote. Treating that as an error
  // rather than as content is what sends the app back to its bundled set.
  if (quotes.length === 0 || quotes.some(isRateLimitNotice)) {
    throw new Error('Quote service is rate limited.');
  }
  return { quotes };
}

function normalise(entry: ZenQuote): Quote | null {
  const text = typeof entry.q === 'string' ? entry.q.trim() : '';
  if (!text) return null;
  return { text, author: typeof entry.a === 'string' ? entry.a.trim() : '' };
}

function isRateLimitNotice(quote: Quote): boolean {
  return quote.text.toLowerCase().includes(RATE_LIMIT_MARKER);
}
