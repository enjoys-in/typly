/**
 * The next saved paragraph, in the library's own order.
 *
 * Two features need the same answer to the same question. The result screen
 * offers the next paragraph so a finished run leads straight into another one,
 * and continuous mode reaches for it mid-run, the moment the current passage
 * runs out. Both want "the one after this in my library", not "a good one" —
 * that is what the endless pool is for, which picks by *difficulty band* and
 * would reorder someone's material under them.
 *
 * Sequence means the order the library page shows, which is the order
 * `listDocuments` returns (newest first). It wraps: a library is a loop to work
 * through, so the paragraph after the last one is the first one again.
 */

import type { DocumentRow } from '../types';
import type { Lang } from '../constants';

export interface SequenceOptions {
  /**
   * Prefer a paragraph in this language. A Hindi passage appearing mid-run in
   * an English test would change the keyboard under the typist's hands, which
   * is the one thing continuous typing cannot survive. Falls back to any
   * language rather than stopping, so a single-language library still works.
   */
  lang?: Lang;
  /** Paragraphs already used in this run or session; skipped while others remain. */
  skipIds?: number[];
}

/**
 * The paragraph after `afterId`, or null when the library cannot supply one.
 *
 * `afterId` of null (a pasted passage that was never saved, a paper run) starts
 * at the top of the library instead of nowhere.
 */
export function nextInSequence(
  documents: DocumentRow[],
  afterId: number | null,
  options: SequenceOptions = {},
): DocumentRow | null {
  if (documents.length === 0) return null;
  const skip = new Set(options.skipIds ?? []);
  const at = afterId == null ? -1 : documents.findIndex((doc) => doc.id === afterId);
  // The ring starting just after the current paragraph. A paragraph that is no
  // longer in the library (deleted mid-run) leaves `at` at -1, which starts the
  // ring at the top — the same place a run with no document starts.
  const ring = documents.map((_, i) => documents[(at + 1 + i) % documents.length]!);

  const candidates = ring.filter((doc) => doc.id !== afterId && doc.content.trim().length > 0);
  if (candidates.length === 0) return null;

  // Four passes, each a relaxation of the last: the right language and unused,
  // the right language at all, unused in any language, then anything left. The
  // first three are preferences; the fourth is what keeps a one-paragraph
  // library from ending a run that was asked to continue.
  const sameLang = (doc: DocumentRow) => options.lang === undefined || doc.lang === options.lang;
  const unused = (doc: DocumentRow) => !skip.has(doc.id);
  return (
    candidates.find((doc) => sameLang(doc) && unused(doc)) ??
    candidates.find(sameLang) ??
    candidates.find(unused) ??
    candidates[0]!
  );
}

/** How many paragraphs are available to follow `afterId` — 0 means "none to offer". */
export function sequenceDepth(documents: DocumentRow[], afterId: number | null): number {
  return documents.filter((doc) => doc.id !== afterId && doc.content.trim().length > 0).length;
}
