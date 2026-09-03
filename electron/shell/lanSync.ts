import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { networkInterfaces } from 'node:os';
import type { BackupBundle } from '../../src/core/types';
import {
  BACKUP_PATH,
  isBackupBundle,
  MAX_BUNDLE_BYTES,
  PAIRING_TTL_MS,
  pairingUrl,
  SYNC_OFF,
  TOKEN_BYTES,
  TOKEN_PARAM,
  type SyncState,
} from '../../src/core/sync/lan';
import { pairPageHtml } from './pairPage';

/**
 * Direct device-to-device sync, with no server in the middle.
 *
 * For a few minutes, and only when the user asks, this opens a small HTTP
 * server on the machine's own network interface holding one snapshot of their
 * data. The phone or laptop that scans the QR code can download that snapshot,
 * or hand one back. Then it closes. No account, no cloud, nothing leaves the
 * Wi-Fi.
 *
 * Because it *is* a listening socket on a shared network, everything about it is
 * deliberately narrow:
 *
 *  - off unless started, and it stops itself after PAIRING_TTL_MS;
 *  - every request must carry a 128-bit token, compared in constant time;
 *  - exactly three things are served: the pairing page, the snapshot, and a
 *    place to post one back — anything else is a 404;
 *  - the incoming body is capped, parsed defensively, and validated as a Typly
 *    bundle before the renderer is allowed anywhere near it.
 */

export interface LanSyncHandlers {
  /** A bundle arrived from the other device and should be restored. */
  onIncoming: (bundle: BackupBundle) => void;
  /** Pairing started, stopped or expired. */
  onState: (state: SyncState) => void;
}

interface Session {
  server: Server;
  token: string;
  /** The snapshot taken when pairing started, as JSON. */
  bundle: string;
  lang: string;
  expiry: ReturnType<typeof setTimeout>;
}

export interface LanSync {
  /** Serve `bundle` on the local network. Resolves with the state to show. */
  start(bundle: string, lang: string): Promise<SyncState>;
  stop(): void;
}

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

export function createLanSync(handlers: LanSyncHandlers): LanSync {
  let session: Session | null = null;

  function stop(): void {
    if (!session) return;
    clearTimeout(session.expiry);
    session.server.close();
    session = null;
    handlers.onState(SYNC_OFF);
  }

  function authorized(url: URL): boolean {
    const supplied = url.searchParams.get(TOKEN_PARAM) ?? '';
    const expected = session?.token ?? '';
    // Length has to match before a constant-time compare is even possible.
    if (supplied.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  }

  function handle(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (!session || !authorized(url)) {
      res.writeHead(404, JSON_HEADERS).end('{"error":"not found"}');
      return;
    }

    // Two paths exist, and nothing else does — said in that order, so an
    // unknown path is a 404 and only a real path can answer with a 405.
    if (url.pathname === '/') {
      if (req.method !== 'GET') {
        res.writeHead(405, JSON_HEADERS).end('{"error":"method not allowed"}');
        return;
      }
      res
        .writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
        })
        .end(pairPageHtml(session.token, session.lang));
      return;
    }

    if (url.pathname === BACKUP_PATH) {
      if (req.method === 'GET') {
        const day = new Date().toISOString().slice(0, 10);
        res
          .writeHead(200, {
            ...JSON_HEADERS,
            'content-disposition': `attachment; filename="typly-backup-${day}.json"`,
          })
          .end(session.bundle);
        return;
      }
      if (req.method === 'POST') {
        receive(req, res);
        return;
      }
      res.writeHead(405, JSON_HEADERS).end('{"error":"method not allowed"}');
      return;
    }

    res.writeHead(404, JSON_HEADERS).end('{"error":"not found"}');
  }

  /** Reads a posted bundle, refusing anything oversized or unrecognisable. */
  function receive(req: IncomingMessage, res: ServerResponse): void {
    const chunks: Buffer[] = [];
    let size = 0;

    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BUNDLE_BYTES) {
        res.writeHead(413, JSON_HEADERS).end('{"error":"too large"}');
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (res.writableEnded) return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        res.writeHead(400, JSON_HEADERS).end('{"error":"not JSON"}');
        return;
      }
      if (!isBackupBundle(parsed)) {
        res.writeHead(422, JSON_HEADERS).end('{"error":"not a Typly backup"}');
        return;
      }
      handlers.onIncoming(parsed);
      res.writeHead(200, JSON_HEADERS).end('{"ok":true}');
    });
  }

  return {
    stop,
    start(bundle, lang) {
      // Starting again replaces the session, so the old token stops working.
      stop();

      const host = lanAddress();
      if (!host) {
        const state: SyncState = { kind: 'error', message: 'offline' };
        handlers.onState(state);
        return Promise.resolve(state);
      }

      const token = randomBytes(TOKEN_BYTES).toString('hex');
      const server = createServer(handle);

      return new Promise<SyncState>((resolve) => {
        const fail = (message: string) => {
          server.close();
          const state: SyncState = { kind: 'error', message };
          handlers.onState(state);
          resolve(state);
        };

        server.once('error', () => fail('unavailable'));
        // Port 0 asks the OS for a free one, so nothing else on the machine can
        // be in the way; the QR code carries whichever it hands out.
        server.listen(0, '0.0.0.0', () => {
          const address = server.address();
          if (typeof address === 'string' || address === null) {
            fail('unavailable');
            return;
          }

          const expiresAt = Date.now() + PAIRING_TTL_MS;
          session = {
            server,
            token,
            bundle,
            lang,
            // Pairing that is left open is pairing someone forgot about, so the
            // session — and the socket — has a fixed lifetime.
            expiry: setTimeout(stop, PAIRING_TTL_MS),
          };

          const state: SyncState = {
            kind: 'pairing',
            session: {
              url: pairingUrl(host, address.port, token),
              address: `${host}:${address.port}`,
              expiresAt,
            },
          };
          handlers.onState(state);
          resolve(state);
        });
      });
    },
  };
}

/**
 * This machine's address on the local network.
 *
 * Loopback is no use (the other device cannot reach it) and neither is a
 * self-assigned 169.254 address, which means the network never came up. A
 * private-range address is preferred, since that is what home and office Wi-Fi
 * hands out, but any routable IPv4 is better than refusing to pair.
 */
function lanAddress(): string | null {
  const candidates: string[] = [];
  for (const entries of Object.values(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.family !== 'IPv4' || entry.internal) continue;
      if (entry.address.startsWith('169.254.')) continue;
      candidates.push(entry.address);
    }
  }
  return candidates.find(isPrivateRange) ?? candidates[0] ?? null;
}

function isPrivateRange(address: string): boolean {
  if (address.startsWith('192.168.') || address.startsWith('10.')) return true;
  const second = Number(address.split('.')[1]);
  return address.startsWith('172.') && second >= 16 && second <= 31;
}
