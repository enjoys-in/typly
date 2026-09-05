/**
 * Where the review deck lives.
 *
 * One settings row holding the whole deck as JSON, keyed by card id — the same
 * shape `library/progress.ts` uses, and for the same reasons: a single read
 * gives the whole picture (the dashboard needs the due count on every load),
 * and neither the browser store nor the desktop one needs a schema migration
 * to hold it.
 *
 * Everything is re-derivable from the stored mistakes, so a row that fails to
 * parse is discarded rather than repaired. The cost of that is a lost schedule,
 * not lost data.
 */

import { SETTING_KEY } from '../constants';
import { BOX_DAYS, itemId, type ReviewDeck, type ReviewItem, type ReviewKind } from './review';

export type SettingGetter = (key: string) => Promise<string | null>;
export type SettingSetter = (key: string, value: string) => Promise<void>;

const KINDS: ReviewKind[] = ['key', 'word'];

function isIso(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

/** One card, or null if the row cannot be trusted. */
function sanitize(raw: unknown): ReviewItem | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const kind = o.kind;
  const value = o.value;
  if (typeof kind !== 'string' || !KINDS.includes(kind as ReviewKind)) return null;
  if (typeof value !== 'string' || !value) return null;
  if (!isIso(o.dueAt) || !isIso(o.addedAt)) return null;
  const box = typeof o.box === 'number' && Number.isFinite(o.box) ? Math.trunc(o.box) : 0;
  const count = (n: unknown) => (typeof n === 'number' && n >= 0 ? Math.trunc(n) : 0);
  return {
    id: itemId(kind as ReviewKind, value),
    kind: kind as ReviewKind,
    value,
    // Clamped rather than rejected: a box out of range is a card whose schedule
    // is wrong, and the schedule is the cheapest thing here to rebuild.
    box: Math.min(Math.max(box, 0), BOX_DAYS.length - 1),
    dueAt: o.dueAt,
    reviews: count(o.reviews),
    lapses: count(o.lapses),
    addedAt: o.addedAt,
    lastSeenAt: isIso(o.lastSeenAt) ? o.lastSeenAt : null,
  };
}

export async function readDeck(get: SettingGetter): Promise<ReviewDeck> {
  const raw = await get(SETTING_KEY.ReviewDeck);
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== 'object' || parsed === null) return {};
  const deck: ReviewDeck = {};
  for (const value of Object.values(parsed as Record<string, unknown>)) {
    const item = sanitize(value);
    // Keyed by the id the card computes for itself, so a hand-edited or
    // renamed key cannot leave the deck holding a card under the wrong name.
    if (item) deck[item.id] = item;
  }
  return deck;
}

export async function writeDeck(set: SettingSetter, deck: ReviewDeck): Promise<void> {
  await set(SETTING_KEY.ReviewDeck, JSON.stringify(deck));
}
