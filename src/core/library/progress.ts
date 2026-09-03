/**
 * Where you left off in a split document.
 *
 * One settings row holds the progress of every split paragraph, keyed by
 * document id: a single read gives the whole picture (the Dashboard needs it
 * across all documents), and neither store needs a schema migration. Only the
 * chunk size and the finished part indexes are kept — the part *texts* are
 * recomputed by the splitter, which is deterministic for a given chunk size.
 */

import { SETTING_KEY } from '../constants';

export type SettingGetter = (key: string) => Promise<string | null>;
export type SettingSetter = (key: string, value: string) => Promise<void>;

export interface PartProgress {
  /** Chunk size the parts were computed with — needed to reproduce the split. */
  chunkChars: number;
  /** How many parts that split produced. */
  parts: number;
  /** Indexes already typed, ascending and de-duplicated. */
  done: number[];
  updatedAt: string;
}

export type ProgressMap = Record<string, PartProgress>;

/** The next part to type, or null when every part is done. */
export function nextPart(progress: PartProgress): number | null {
  for (let i = 0; i < progress.parts; i++) {
    if (!progress.done.includes(i)) return i;
  }
  return null;
}

export function isComplete(progress: PartProgress): boolean {
  return nextPart(progress) === null;
}

/** Completion as a 0-100 percentage, for a progress bar. */
export function percentDone(progress: PartProgress): number {
  if (progress.parts <= 0) return 0;
  return Math.round((progress.done.length / progress.parts) * 100);
}

export async function readProgressMap(get: SettingGetter): Promise<ProgressMap> {
  const raw = await get(SETTING_KEY.LibraryProgress);
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== 'object' || parsed === null) return {};
  const out: ProgressMap = {};
  for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
    const entry = sanitize(value);
    if (entry) out[id] = entry;
  }
  return out;
}

export async function readProgress(
  get: SettingGetter,
  documentId: number,
): Promise<PartProgress | null> {
  return (await readProgressMap(get))[String(documentId)] ?? null;
}

/** Replaces one document's entry, leaving the rest of the map untouched. */
async function write(
  get: SettingGetter,
  set: SettingSetter,
  documentId: number,
  entry: PartProgress | null,
): Promise<void> {
  const map = await readProgressMap(get);
  if (entry) map[String(documentId)] = entry;
  else delete map[String(documentId)];
  await set(SETTING_KEY.LibraryProgress, JSON.stringify(map));
}

/**
 * Records the split a document was cut into. Called when the user chooses a
 * chunk size; a *different* chunk size renumbers the parts, so the finished
 * ones are dropped rather than pointing at passages that no longer exist.
 */
export async function startProgress(
  get: SettingGetter,
  set: SettingSetter,
  documentId: number,
  chunkChars: number,
  parts: number,
): Promise<PartProgress> {
  const existing = (await readProgressMap(get))[String(documentId)];
  const keep = existing?.chunkChars === chunkChars && existing.parts === parts;
  const entry: PartProgress = {
    chunkChars,
    parts,
    done: keep ? existing!.done : [],
    updatedAt: new Date().toISOString(),
  };
  await write(get, set, documentId, entry);
  return entry;
}

/** Marks one part typed. A part not covered by a stored split is ignored. */
export async function markPartDone(
  get: SettingGetter,
  set: SettingSetter,
  documentId: number,
  index: number,
): Promise<void> {
  const entry = (await readProgressMap(get))[String(documentId)];
  if (!entry || index < 0 || index >= entry.parts || entry.done.includes(index)) return;
  await write(get, set, documentId, {
    ...entry,
    done: [...entry.done, index].sort((a, b) => a - b),
    updatedAt: new Date().toISOString(),
  });
}

export async function clearProgress(
  get: SettingGetter,
  set: SettingSetter,
  documentId: number,
): Promise<void> {
  await write(get, set, documentId, null);
}

/** Document ids with a split under way, most recently typed first. */
export function inProgressIds(map: ProgressMap): number[] {
  return Object.entries(map)
    .filter(([, p]) => p.done.length > 0 && !isComplete(p))
    .sort((a, b) => b[1].updatedAt.localeCompare(a[1].updatedAt))
    .map(([id]) => Number(id))
    .filter((id) => Number.isInteger(id));
}

/** Rejects anything malformed, so a hand-edited row can't break the library. */
function sanitize(value: unknown): PartProgress | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Partial<PartProgress>;
  if (typeof v.chunkChars !== 'number' || !Number.isFinite(v.chunkChars)) return null;
  if (typeof v.parts !== 'number' || !Number.isInteger(v.parts) || v.parts < 1) return null;
  const done = Array.isArray(v.done)
    ? [...new Set(v.done.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < v.parts!))]
    : [];
  return {
    chunkChars: v.chunkChars,
    parts: v.parts,
    done: done.sort((a, b) => a - b),
    updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : new Date(0).toISOString(),
  };
}
