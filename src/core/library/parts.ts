import type { Draft, DocumentRow, SeriesItem } from '../types';
import { splitTexts } from '../text/splitter';
import { nextPart, type PartProgress } from './progress';

/**
 * Turns a saved document plus its stored progress into something runnable —
 * the one place that decides which part comes next, so the Dashboard, the
 * Library and the exam setup all resume at the same passage.
 */

export interface DocumentPlan {
  parts: string[];
  chunkChars: number;
  /** Part the next run starts at; the last part once everything is done. */
  startIndex: number;
  done: number[];
}

export function planFor(doc: DocumentRow, progress: PartProgress | null): DocumentPlan | null {
  if (!progress) return null;
  const parts = splitTexts(doc.content, progress.chunkChars);
  // The document was edited (or re-imported) since the split was stored, so the
  // part numbers no longer line up. Re-split and start over rather than resume
  // at a passage that has moved.
  const stale = parts.length !== progress.parts;
  const done = stale ? [] : progress.done;
  const next = stale ? 0 : (nextPart(progress) ?? parts.length - 1);
  return { parts, chunkChars: progress.chunkChars, startIndex: next, done };
}

/** A draft that resumes `doc` at its next unfinished part. */
export function draftFor(doc: DocumentRow, plan: DocumentPlan): Draft {
  return {
    passage: plan.parts[plan.startIndex] ?? doc.content,
    title: doc.title,
    documentId: doc.id,
    sourceType: doc.sourceType,
    lang: doc.lang,
    split: { chunkChars: plan.chunkChars, parts: plan.parts, startIndex: plan.startIndex },
  };
}

/** Part numbering shown in the toolbar and stored with the result. */
export function partTitle(title: string, index: number, count: number): string {
  return count > 1 ? `${title} · Part ${index + 1}/${count}` : title;
}

/**
 * The remaining parts as a test series, so finishing one auto-advances to the
 * next instead of sending the user back to the library.
 */
export function seriesFrom(draft: Draft): SeriesItem[] {
  const split = draft.split;
  if (!split) {
    return [
      {
        passage: draft.passage,
        title: draft.title,
        documentId: draft.documentId,
        sourceType: draft.sourceType,
        partIndex: null,
        partCount: null,
      },
    ];
  }
  return split.parts.slice(split.startIndex).map((passage, i) => {
    const index = split.startIndex + i;
    return {
      passage,
      title: partTitle(draft.title, index, split.parts.length),
      documentId: draft.documentId,
      sourceType: draft.sourceType,
      partIndex: index,
      partCount: split.parts.length,
    };
  });
}
