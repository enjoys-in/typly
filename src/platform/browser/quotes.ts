import type { Cache, Quotes } from '../ports';
import { callBackend } from './backendTransport';
import { IpcChannel } from '@/core/ipc/channels';
import { QUOTES_TTL_SEC } from '@/core/constants';
import { FALLBACK_QUOTES, usableQuote, type Quote } from '@/core/motivation/quotes';

const CACHE_KEY = 'quotes:batch';

/**
 * Motivational quotes, from the network when it is there and from the bundle
 * when it is not.
 *
 * The ordering matters and is deliberate: cache, then network, then bundle.
 *
 * - The cache first because a batch is 50 quotes and the app needs one at a
 *   time. Fetching per nudge would be fifty times the traffic for no extra
 *   variety, and the free tier rate-limits by IP — a practice session of a
 *   dozen slow runs would trip it and then show nothing.
 * - The bundle last because this must never fail. It is a quote on a results
 *   screen; an error message in its place would be worse than silence, and a
 *   spinner would be worse still.
 *
 * `batch()` therefore has no error path at all. Every caller can treat it as a
 * synchronous-ish read that always works.
 */
export class BrowserQuotes implements Quotes {
  private network = false;
  /**
   * The in-flight fetch, shared. A results page can ask while a previous ask is
   * still resolving, and two callers must not become two requests.
   */
  private pending: Promise<Quote[]> | null = null;

  constructor(private readonly cache: Cache) {}

  fromNetwork(): boolean {
    return this.network;
  }

  batch(): Promise<Quote[]> {
    this.pending ??= this.load().finally(() => {
      this.pending = null;
    });
    return this.pending;
  }

  private async load(): Promise<Quote[]> {
    const cached = await this.cache.get<Quote[]>(CACHE_KEY).catch(() => null);
    if (cached?.length) {
      this.network = true;
      return cached;
    }

    try {
      const body = (await callBackend(IpcChannel.Quotes, null)) as { quotes?: unknown };
      const fetched = Array.isArray(body?.quotes) ? (body.quotes as Quote[]) : [];
      // Only the fetched set needs this. The bundled one is a constant checked
      // at the source; a batch from someone else's database is where the
      // paragraph-length entry and the raw HTML entity actually come from.
      const usable = fetched.filter(usableQuote);
      if (usable.length > 0) {
        // A failed write is not a failed fetch: the quotes are already in hand,
        // and the only cost is fetching again next time.
        await this.cache.put(CACHE_KEY, usable, QUOTES_TTL_SEC).catch(() => {});
        this.network = true;
        return usable;
      }
    } catch {
      // Offline, rate limited, or no backend at all. The bundle covers it.
    }

    this.network = false;
    return [...FALLBACK_QUOTES];
  }
}
