import type { Keystroke } from '../types';

const BACKSPACE = 'Backspace';
const DELETE = 'Delete';

/** The text after one more keystroke is applied to `typed`. */
function applyKeystroke(typed: string, k: Keystroke): string {
  const at = Math.min(Math.max(k.index, 0), typed.length);
  if (k.key === BACKSPACE) return typed.slice(0, Math.max(0, at - 1)) + typed.slice(at);
  if (k.key === DELETE) return typed.slice(0, at) + typed.slice(at + 1);
  // A remapped layout can fold a key into the text before it, so the keystroke
  // replaces that much rather than only inserting.
  const from = Math.max(0, at - (k.replaced ?? 0));
  return typed.slice(0, from) + k.key + typed.slice(at);
}

/**
 * Carry an already-built prefix forward by applying keystrokes `from`…`to`.
 * Playback advances a handful of keystrokes per frame, so a player that keeps
 * its last result never has to rebuild the whole run.
 */
export function typedBetween(
  keystrokes: Keystroke[],
  typed: string,
  from: number,
  to: number,
): string {
  let out = typed;
  const end = Math.min(to, keystrokes.length);
  for (let i = Math.max(from, 0); i < end; i++) out = applyKeystroke(out, keystrokes[i]!);
  return out;
}

/** The text the user had typed after the first `count` keystrokes. */
export function typedAfter(keystrokes: Keystroke[], count: number): string {
  return typedBetween(keystrokes, '', 0, count);
}

/** How many keystrokes had happened by `ms` — the replay cursor for a timestamp. */
export function countAt(keystrokes: Keystroke[], ms: number): number {
  let low = 0;
  let high = keystrokes.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (keystrokes[mid]!.t <= ms) low = mid + 1;
    else high = mid;
  }
  return low;
}

export interface GhostPoint {
  t: number;
  /** Characters standing on screen at that moment. */
  chars: number;
}

/**
 * A past run compressed to progress-over-time, which is all a live race needs.
 * Points are only emitted when the character count changes.
 */
export function buildGhostTrack(keystrokes: Keystroke[]): GhostPoint[] {
  const track: GhostPoint[] = [];
  let chars = 0;
  for (const k of keystrokes) {
    // Only insertions and deletions are logged, but a remapped layout inserts
    // whole clusters and can swallow what came before it.
    if (k.key === BACKSPACE || k.key === DELETE) chars = Math.max(0, chars - 1);
    else chars = Math.max(0, chars - (k.replaced ?? 0) + k.key.length);
    const last = track[track.length - 1];
    if (last && last.chars === chars) last.t = k.t;
    else track.push({ t: k.t, chars });
  }
  return track;
}

/** Where the ghost stood at `ms`. */
export function ghostCharsAt(track: GhostPoint[], ms: number): number {
  let low = 0;
  let high = track.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (track[mid]!.t <= ms) low = mid + 1;
    else high = mid;
  }
  return low === 0 ? 0 : track[low - 1]!.chars;
}
