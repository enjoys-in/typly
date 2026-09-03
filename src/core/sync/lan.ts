/**
 * Device-to-device sync over the local network.
 *
 * Typly's promise is that practice data stays on the user's own machine, so
 * moving it to a second device must not route through anyone's server. Instead
 * the desktop app serves the backup bundle on the Wi-Fi it is already on, for a
 * few minutes, at a URL that carries a one-time token — the other device scans
 * a QR code and pulls (or pushes) the file directly. Nothing is uploaded, and
 * nothing outside the network can reach it.
 *
 * This module is the contract both sides agree on: the shape of a session, the
 * limits, and the validation every payload goes through. The server itself is
 * in the Electron main process; the renderer only ever handles this data.
 */

import type { BackupBundle } from '@/core/types';

/** How long a pairing session stays open before closing itself. */
export const PAIRING_TTL_MS = 5 * 60_000;

/**
 * The largest body the pairing server will read. A backup of several thousand
 * tests — keystroke logs included — is a small fraction of this; the cap is
 * there so a stray request cannot make the app allocate without bound.
 */
export const MAX_BUNDLE_BYTES = 16 * 1024 * 1024;

/** Query parameter carrying the session token. */
export const TOKEN_PARAM = 't';

/** Where the bundle is read from and posted to. */
export const BACKUP_PATH = '/backup';

/** Bytes of entropy in a session token (hex-encoded, so twice this in characters). */
export const TOKEN_BYTES = 16;

export interface PairingSession {
  /** The full URL the QR code encodes, token included. */
  url: string;
  /** host:port, shown as text for anyone typing it in by hand. */
  address: string;
  /** Epoch milliseconds after which the session closes itself. */
  expiresAt: number;
}

/** What the desktop shell reports about pairing, and what the UI renders. */
export type SyncState =
  | { kind: 'off' }
  | { kind: 'pairing'; session: PairingSession }
  | { kind: 'error'; message: string };

export const SYNC_OFF: SyncState = { kind: 'off' };

export function pairingUrl(host: string, port: number, token: string): string {
  return `http://${host}:${port}/?${TOKEN_PARAM}=${token}`;
}

/** Whole minutes left in a session, floored at zero. */
export function minutesLeft(expiresAt: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((expiresAt - now) / 60_000));
}

/**
 * Anything arriving from the network is a stranger until proven otherwise: a
 * bundle has to look exactly like one this app wrote before it goes anywhere
 * near the database.
 */
export function isBackupBundle(value: unknown): value is BackupBundle {
  if (typeof value !== 'object' || value === null) return false;
  const bundle = value as Partial<BackupBundle>;
  return (
    bundle.app === 'typly' &&
    typeof bundle.version === 'number' &&
    typeof bundle.tables === 'object' &&
    bundle.tables !== null &&
    !Array.isArray(bundle.tables) &&
    Object.values(bundle.tables).every(Array.isArray)
  );
}

/** Counts to report, tolerating a bundle written by an older version. */
export function bundleCounts(bundle: BackupBundle): { tests: number; documents: number } {
  return {
    tests: bundle.counts?.tests ?? 0,
    documents: bundle.counts?.documents ?? 0,
  };
}

export function isPairingSession(value: unknown): value is PairingSession {
  if (typeof value !== 'object' || value === null) return false;
  const session = value as Partial<PairingSession>;
  return (
    typeof session.url === 'string' &&
    typeof session.address === 'string' &&
    Number.isFinite(session.expiresAt)
  );
}

/** Guards the main→renderer state push; a bad payload is dropped, not trusted. */
export function isSyncState(value: unknown): value is SyncState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as { kind?: unknown; session?: unknown; message?: unknown };
  if (state.kind === 'off') return true;
  if (state.kind === 'pairing') return isPairingSession(state.session);
  return state.kind === 'error' && typeof state.message === 'string';
}
