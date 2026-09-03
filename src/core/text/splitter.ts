/**
 * Breaks a long text into exam-sized passages.
 *
 * A book chapter, a 30-page PDF or a pasted study note is far more text than
 * one sitting: splitting it lets the same source drive a run of tests that pick
 * up where the last one stopped. The split is *deterministic* for a given
 * (text, chunkChars) pair, so only the chunk size has to be stored — the parts
 * themselves are recomputed on demand and can never drift out of sync with the
 * saved progress.
 */

// Sentence terminators: Latin punctuation plus the Devanagari danda and double
// danda, so Hindi/Marathi passages break at real sentence ends too.
const TERMINATOR = /[.!?।॥]/;
// Trailing marks that belong to the sentence just closed, not the next one.
const TRAILING = /[.!?।॥"'”’)\]»]/;

/** Below this a text is one passage — splitting it would make stubs. */
export const MIN_SPLIT_CHARS = 300;

/** Above this length the UI offers to split rather than run it as one test. */
export const LONG_PASSAGE_CHARS = 1_800;

/** Chunk sizes offered in the UI, in characters. */
export const SPLIT_PRESETS = [
  { chars: 600, label: 'Short' },
  { chars: 1_200, label: 'Medium' },
  { chars: 1_800, label: 'Long' },
  { chars: 2_500, label: 'Exam' },
] as const;

export const DEFAULT_CHUNK_CHARS = 1_200;

export interface PassagePart {
  /** 0-based position in the split. */
  index: number;
  text: string;
  /** Offsets into the source text — where this part came from. */
  start: number;
  end: number;
}

interface Segment {
  start: number;
  end: number;
}

/**
 * A sensible chunk size for a text of `length` characters: big enough that a
 * split never produces dozens of tiny parts, small enough to stay a sitting.
 */
export function suggestChunkChars(length: number): number {
  for (const preset of SPLIT_PRESETS) {
    if (length <= preset.chars * 12) return preset.chars;
  }
  return SPLIT_PRESETS[SPLIT_PRESETS.length - 1]!.chars;
}

/** Whether a text is long enough to be worth offering a split for. */
export function isLongPassage(text: string): boolean {
  return text.trim().length > LONG_PASSAGE_CHARS;
}

/** Sentence-ish segments, each ending just after its terminator or newline. */
function sentences(text: string): Segment[] {
  const out: Segment[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (ch !== '\n' && !TERMINATOR.test(ch)) continue;
    // Absorb the run of closing punctuation that belongs to this sentence, so
    // a part never starts with a stray quote or bracket.
    let end = i + 1;
    while (end < text.length && TRAILING.test(text[end]!)) end++;
    out.push({ start, end });
    start = end;
    i = end - 1;
  }
  if (start < text.length) out.push({ start, end: text.length });
  return out;
}

/** Last space at or before `limit`, but never before `floor`. */
function wordBreak(text: string, limit: number, floor: number): number {
  for (let i = Math.min(limit, text.length) - 1; i > floor; i--) {
    if (/\s/.test(text[i]!)) return i + 1;
  }
  return Math.min(limit, text.length);
}

/**
 * Sentences, with any single sentence longer than `target` cut at word
 * boundaries — OCR output often has no punctuation at all, and one 40 000-char
 * "sentence" must still split.
 */
function boundedSentences(text: string, target: number): Segment[] {
  const out: Segment[] = [];
  for (const s of sentences(text)) {
    if (s.end - s.start <= target) {
      out.push(s);
      continue;
    }
    let start = s.start;
    while (s.end - start > target) {
      const cut = wordBreak(text, start + target, start + Math.ceil(target / 2));
      out.push({ start, end: cut });
      start = cut;
    }
    if (start < s.end) out.push({ start, end: s.end });
  }
  return out;
}

/**
 * Splits `text` into parts of roughly `chunkChars` characters, cutting only at
 * sentence boundaries. Returns a single part when the text is too short to be
 * worth splitting.
 */
export function splitPassage(text: string, chunkChars: number): PassagePart[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) return [];
  const target = Math.max(MIN_SPLIT_CHARS, Math.floor(chunkChars));
  if (trimmed.length <= target) {
    return [{ index: 0, text: trimmed, start: 0, end: text.length }];
  }

  const ranges: Segment[] = [];
  let open: Segment | null = null;
  for (const seg of boundedSentences(text, target)) {
    if (!open) {
      open = { start: seg.start, end: seg.end };
      continue;
    }
    const grown = seg.end - open.start;
    // Close the part when the next sentence would push it past the target —
    // unless it is still less than half full, in which case a slightly long
    // part beats a stubby one.
    if (grown > target && open.end - open.start >= target / 2) {
      ranges.push(open);
      open = { start: seg.start, end: seg.end };
    } else {
      open.end = seg.end;
    }
  }
  if (open) ranges.push(open);

  // A final scrap reads as a bug, so fold anything under a quarter-target back
  // into the part before it.
  const last = ranges[ranges.length - 1];
  const prev = ranges[ranges.length - 2];
  if (last && prev && last.end - last.start < target / 4) {
    prev.end = last.end;
    ranges.pop();
  }

  return ranges
    .map((r, index) => ({ index, text: text.slice(r.start, r.end).trim(), start: r.start, end: r.end }))
    .filter((p) => p.text.length > 0)
    .map((p, index) => ({ ...p, index }));
}

/** Just the part texts, which is all a test series needs. */
export function splitTexts(text: string, chunkChars: number): string[] {
  return splitPassage(text, chunkChars).map((p) => p.text);
}
