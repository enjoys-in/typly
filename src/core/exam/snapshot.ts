import type { ExamConfig, ExamSnapshot, Keystroke } from '../types';

/** A snapshot older than this is stale — resuming it would resume a dead run. */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export function createSnapshot(
  config: ExamConfig,
  typed: string,
  elapsedMs: number,
  keystrokes: Keystroke[],
): ExamSnapshot {
  return { config, typed, elapsedMs, keystrokes, savedAt: new Date().toISOString() };
}

export function serializeSnapshot(snapshot: ExamSnapshot): string {
  return JSON.stringify(snapshot);
}

/**
 * Parse a stored snapshot, rejecting anything malformed, empty or stale so a
 * corrupt value can never resurrect as a broken exam.
 */
export function parseSnapshot(raw: string | null): ExamSnapshot | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isSnapshot(value)) return null;
  if (value.typed.length === 0) return null;
  const age = Date.now() - new Date(value.savedAt).getTime();
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE_MS ? value : null;
}

function isSnapshot(value: unknown): value is ExamSnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Partial<ExamSnapshot>;
  return (
    typeof s.typed === 'string' &&
    typeof s.elapsedMs === 'number' &&
    typeof s.savedAt === 'string' &&
    Array.isArray(s.keystrokes) &&
    typeof s.config === 'object' &&
    s.config !== null &&
    typeof (s.config as ExamConfig).passage === 'string' &&
    // A paper run has no passage on screen, so an empty one is valid there and
    // nowhere else.
    ((s.config as ExamConfig).passage.length > 0 || (s.config as ExamConfig).paper === true)
  );
}
