/**
 * A keyboard health check.
 *
 * Typly's users often practise on shared lab and cyber-café machines, and
 * finding a half-dead `e` two minutes into a mock is a wasted session. Press
 * every key once and the app can say which ones are dead, which stick, and
 * which ghost — using the keyboard renderer that already exists.
 *
 * Nothing here talks to hardware. All three faults are visible in the *timing
 * and shape* of ordinary key events, which is the only thing a browser gets.
 */

import { KEY_ROWS, type Key } from './layout';

export type KeyHealth = 'untested' | 'ok' | 'sticky' | 'ghosting';

export interface KeyReport {
  id: string;
  label: string
  health: KeyHealth;
  /** Times this key fired during the check. */
  presses: number;
  /** Shortest gap between two of its own presses, in ms. */
  minGapMs: number | null;
}

export interface HealthReport {
  keys: KeyReport[];
  tested: number;
  total: number;
  /** Keys never pressed — dead, or simply not reached yet. */
  dead: KeyReport[];
  sticky: KeyReport[];
  ghosting: KeyReport[];
  /** True once every key on the layout has been pressed at least once. */
  complete: boolean;
}

/**
 * Repeats closer together than this were not two deliberate presses. A held
 * key auto-repeats around 30ms on most systems and a human double-tap is rarely
 * under 60ms, so this separates a fault from fast typing.
 */
const STICKY_GAP_MS = 45;
/** A key that fires this many times from one press is chattering. */
const STICKY_PRESSES = 4;

export interface PressEvent {
  /** Key id, as `keyIdForChar` produces. */
  id: string;
  /** Milliseconds since the check started. */
  t: number;
  /** True when the browser flagged the event as an auto-repeat. */
  repeat: boolean;
  /** Key ids reported down at the same moment but never pressed by the user. */
  phantom?: string[];
}

/** Every key the check expects, in layout order. */
export function healthKeys(): Key[] {
  return KEY_ROWS.flat();
}

/**
 * Turn a log of presses into a verdict per key.
 *
 * - *Dead*: never fired, though the user was asked to press it.
 * - *Sticky*: fired repeatedly from one press, or twice impossibly fast.
 * - *Ghosting*: reported down while a different key was being pressed, which is
 *   the classic membrane-matrix fault and the one that silently corrupts a run.
 */
export function healthReport(presses: PressEvent[]): HealthReport {
  const keys = healthKeys();
  const byId = new Map<string, { times: number[]; repeats: number; ghosted: boolean }>(
    keys.map((k) => [k.id, { times: [], repeats: 0, ghosted: false }]),
  );

  for (const press of presses) {
    const entry = byId.get(press.id);
    if (entry) {
      entry.times.push(press.t);
      if (press.repeat) entry.repeats++;
    }
    for (const ghost of press.phantom ?? []) {
      const other = byId.get(ghost);
      if (other) other.ghosted = true;
    }
  }

  const reports: KeyReport[] = keys.map((key) => {
    const entry = byId.get(key.id)!;
    const gaps = entry.times.slice(1).map((t, i) => t - entry.times[i]!);
    const minGapMs = gaps.length ? Math.min(...gaps) : null;
    return {
      id: key.id,
      label: key.label,
      presses: entry.times.length,
      minGapMs,
      health: verdict(entry.times.length, entry.repeats, minGapMs, entry.ghosted),
    };
  });

  const tested = reports.filter((r) => r.presses > 0).length;
  return {
    keys: reports,
    tested,
    total: reports.length,
    dead: reports.filter((r) => r.presses === 0),
    sticky: reports.filter((r) => r.health === 'sticky'),
    ghosting: reports.filter((r) => r.health === 'ghosting'),
    complete: tested === reports.length,
  };
}

function verdict(
  presses: number,
  repeats: number,
  minGapMs: number | null,
  ghosted: boolean,
): KeyHealth {
  if (ghosted) return 'ghosting';
  if (presses === 0) return 'untested';
  if (repeats >= STICKY_PRESSES || presses >= STICKY_PRESSES) return 'sticky';
  if (minGapMs !== null && minGapMs < STICKY_GAP_MS) return 'sticky';
  return 'ok';
}

/** Heat value per key for the existing `KeyHeatmap`, so it renders the report. */
export function healthHeat(report: HealthReport): Map<string, number> {
  const values = new Map<string, number>();
  for (const key of report.keys) {
    // Faults are hot; a healthy key is cold and an untested one is absent, so
    // the map reads as "what is wrong" rather than "what has been pressed".
    if (key.health === 'ghosting') values.set(key.id, 3);
    else if (key.health === 'sticky') values.set(key.id, 2);
  }
  return values;
}

/** True when nothing is wrong with any key that was actually tested. */
export function healthy(report: HealthReport): boolean {
  return report.sticky.length === 0 && report.ghosting.length === 0;
}
