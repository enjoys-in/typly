/**
 * Where an endless run gets its next passage.
 *
 * The adaptive controller decides *how hard* the next passage should be; this
 * decides *which* passage that is. It draws from the user's own library, rated
 * by `difficulty`, so the material is real exam prose rather than generated
 * filler — and it avoids repeating a passage while unseen ones of the right
 * band remain, because typing the same paragraph twice measures memory rather
 * than speed.
 */

import type { DocumentRow } from '../types';
import { PASSAGE_BANDS, PassageBand } from '../constants';
import { rateDifficulty } from '../text/difficulty';

export interface PoolPick {
  document: DocumentRow;
  band: PassageBand;
  /** True when nothing of the requested band was available. */
  substituted: boolean;
}

/**
 * The next passage for `band`, preferring one not yet used.
 *
 * Falls back outward through neighbouring bands rather than giving up: a run
 * that stops because the library has no "very hard" paragraph would be ending
 * on the library's shape instead of on the typist's stamina, which is the one
 * thing it exists to measure.
 */
export function pickForBand(
  documents: DocumentRow[],
  band: PassageBand,
  usedIds: number[],
): PoolPick | null {
  if (documents.length === 0) return null;

  const rated = documents.map((document) => ({
    document,
    band: rateDifficulty(document.content).band,
  }));
  const used = new Set(usedIds);
  const target = Math.max(0, PASSAGE_BANDS.indexOf(band));

  // Bands in order of preference: the requested one, then outward from it.
  const order = [...PASSAGE_BANDS].sort(
    (a, b) =>
      Math.abs(PASSAGE_BANDS.indexOf(a) - target) - Math.abs(PASSAGE_BANDS.indexOf(b) - target),
  );

  for (const unusedOnly of [true, false]) {
    for (const candidateBand of order) {
      const match = rated.find(
        (entry) =>
          entry.band === candidateBand && (!unusedOnly || !used.has(entry.document.id)),
      );
      if (match) {
        return {
          document: match.document,
          band: match.band,
          substituted: match.band !== band,
        };
      }
    }
  }
  return null;
}

/** How many distinct bands the library can actually supply. */
export function poolDepth(documents: DocumentRow[]): number {
  return new Set(documents.map((doc) => rateDifficulty(doc.content).band)).size;
}
