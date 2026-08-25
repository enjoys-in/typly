import type { SpellChecker } from '../ports';

// Low-memory fuzzy spell engine: an accurate full-dictionary membership check plus
// on-demand bounded edit-distance suggestions — no giant precomputed delete index,
// so it stays ~30MB instead of hundreds of MB. Loads /dictionaries/en.txt (flat word
// list) and falls back to the Hunspell /dictionaries/en.dic word list, else degrades.
export class SymSpellSpellChecker implements SpellChecker {
  private words: Set<string> | null = null;
  private byLen = new Map<number, string[]>();
  private loaded = false;

  private async load(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const list = await this.loadWordList();
      if (list.length === 0) return;
      this.words = new Set(list);
      // Bucket by length so suggestions only scan plausible candidates.
      for (const w of this.words) {
        const bucket = this.byLen.get(w.length);
        if (bucket) bucket.push(w);
        else this.byLen.set(w.length, [w]);
      }
    } catch {
      this.words = null;
      this.byLen.clear();
    }
  }

  private async loadWordList(): Promise<string[]> {
    const base = import.meta.env.BASE_URL;
    const plain = await fetch(`${base}dictionaries/en.txt`).then((r) => (r.ok ? r.text() : null));
    if (plain) return normalize(plain.split(/\r?\n/));
    const dic = await fetch(`${base}dictionaries/en.dic`).then((r) => (r.ok ? r.text() : null));
    // Hunspell .dic: first line is a count, entries look like `word/FLAGS`.
    if (dic) return normalize(dic.split(/\r?\n/).slice(1).map((l) => l.split('/')[0] ?? ''));
    return [];
  }

  async ready(): Promise<boolean> {
    await this.load();
    return this.words !== null;
  }

  check(word: string): boolean {
    if (!this.words) return true;
    return this.words.has(word.toLowerCase());
  }

  suggest(word: string): string[] {
    if (!this.words) return [];
    const q = word.toLowerCase();
    const max = 1; // OSA distance 1 covers insert/delete/substitute/transpose typos
    const out: { term: string; dist: number }[] = [];
    for (let len = q.length - max; len <= q.length + max; len++) {
      const bucket = this.byLen.get(len);
      if (!bucket) continue;
      for (const cand of bucket) {
        const dist = osa(q, cand, max);
        if (dist <= max) out.push({ term: cand, dist });
      }
    }
    out.sort((a, b) => a.dist - b.dist || a.term.length - b.term.length);
    return out.slice(0, 5).map((s) => s.term);
  }
}

function normalize(words: string[]): string[] {
  return words
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 1 && /^[a-z']+$/.test(w));
}

// Optimal string alignment (Damerau–Levenshtein with adjacent transpositions),
// bounded by `max` with per-row early exit so most candidates bail out fast.
function osa(a: string, b: string, max: number): number {
  const al = a.length;
  const bl = b.length;
  if (Math.abs(al - bl) > max) return max + 1;
  let two = new Array<number>(bl + 1);
  let one = new Array<number>(bl + 1);
  let cur = new Array<number>(bl + 1);
  for (let j = 0; j <= bl; j++) one[j] = j;
  for (let i = 1; i <= al; i++) {
    cur[0] = i;
    let rowMin = i;
    const ai = a.charCodeAt(i - 1);
    const aiPrev = i > 1 ? a.charCodeAt(i - 2) : -1;
    for (let j = 1; j <= bl; j++) {
      const bj = b.charCodeAt(j - 1);
      const cost = ai === bj ? 0 : 1;
      let v = Math.min(one[j]! + 1, cur[j - 1]! + 1, one[j - 1]! + cost);
      if (i > 1 && j > 1 && ai === b.charCodeAt(j - 2) && aiPrev === bj) {
        v = Math.min(v, two[j - 2]! + 1);
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    const tmp = two;
    two = one;
    one = cur;
    cur = tmp;
  }
  return one[bl]!;
}
