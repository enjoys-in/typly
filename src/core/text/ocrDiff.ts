import { diffWords } from 'diff';

// One aligned region of two OCR outputs. `a` = engine A (Tesseract), `b` = engine
// B (AI vision). `same` is true when they agree (ignoring whitespace differences).
export interface DiffSegment {
  same: boolean;
  a: string;
  b: string;
}

export type Choice = 'a' | 'b';

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim();

// Word-level alignment of two OCR outputs into same / differing segments.
export function diffTexts(a: string, b: string): DiffSegment[] {
  const changes = diffWords(a, b);
  const segments: DiffSegment[] = [];
  let i = 0;
  while (i < changes.length) {
    const c = changes[i]!;
    if (!c.added && !c.removed) {
      segments.push({ same: true, a: c.value, b: c.value });
      i++;
      continue;
    }
    // A run of removed (A-only) and/or added (B-only) tokens = one diff region.
    let av = '';
    let bv = '';
    while (i < changes.length && (changes[i]!.added || changes[i]!.removed)) {
      const cc = changes[i]!;
      if (cc.removed) av += cc.value;
      else bv += cc.value;
      i++;
    }
    segments.push({ same: norm(av) === norm(bv), a: av, b: bv });
  }
  return segments;
}

// Rebuild the text from per-segment choices (differences default to B / vision).
export function mergeSegments(segments: DiffSegment[], choices: Record<number, Choice>): string {
  return segments
    .map((s, i) => {
      if (s.same) return s.b || s.a;
      return (choices[i] ?? 'b') === 'a' ? s.a : s.b;
    })
    .join('');
}

export function countDifferences(segments: DiffSegment[]): number {
  return segments.reduce((n, s) => (s.same ? n : n + 1), 0);
}
