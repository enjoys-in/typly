import { keyIdForChar } from '../keyboard/layout';

/** What a key produces: text to insert, and how much it replaces behind it. */
export interface KeymapOutput {
  text: string;
  /** Characters immediately before the cursor that this output replaces. */
  replace: number;
}

/**
 * A contextual rule: with `before` already sitting behind the cursor, `key`
 * produces `text` in place of it. Typewriter layouts need these — a half
 * consonant plus the vertical-stroke key becomes the full letter.
 */
export interface KeymapSequence {
  before: string;
  key: string;
  text: string;
}

export interface KeymapSpec {
  /** Human-readable layout name, for placeholders and hints. */
  label: string;
  /** Key character (Shift already applied) → output, when no sequence matches. */
  table: Record<string, string>;
  /** Contextual rules, tried before the table. */
  sequences?: KeymapSequence[];
}

/**
 * A physical-keyboard remapping (InScript, Remington, …). One shape for every
 * layout, so the exam input, the on-screen keyboard and the key highlighter
 * depend on this interface instead of on any single layout's table.
 */
export interface Keymap {
  /** Human-readable layout name, for placeholders and hints. */
  readonly label: string;
  /** How many keys the layout defines — 0 means the layout data is not installed. */
  readonly size: number;
  /** Output for a key, given the text already before the cursor. */
  resolve(key: string, before: string): KeymapOutput | null;
  /** Physical key id to highlight for one output character, or '' if unmapped. */
  keyForOutput(ch: string): string;
  /**
   * The keys that produce one character when no single key does, in order.
   *
   * A typewriter layout completes a letter rather than carrying it: Remington
   * has no ख key at all — you type the half form ख् and then the stroke key,
   * which fuses the two. Twelve of the commonest consonants work that way, so
   * "which key is ख on?" has no answer and "which keys" does. Null when the
   * character is a single key (ask `keyForOutput`) or unreachable.
   */
  sequenceFor(ch: string): string[] | null;
  /** Label a physical key shows on the on-screen keyboard. */
  labelFor(keyId: string, fallback: string): string;
}

/**
 * Build a Keymap from a layout spec. The reverse lookup (output → physical key)
 * and the sequence index are derived once, at module load.
 */
export function createKeymap({ label, table, sequences = [] }: KeymapSpec): Keymap {
  // Only single-character outputs can highlight a single key. Where several
  // keys produce the same character, the unshifted one is the better hint.
  const reverse: Record<string, string> = {};
  const viaShift = new Set<string>();
  for (const [key, value] of Object.entries(table)) {
    if (value.length !== 1) continue;
    const id = keyIdForChar(key);
    const shifted = id !== key;
    if (!(value in reverse)) {
      reverse[value] = id;
      if (shifted) viaShift.add(value);
    } else if (!shifted && viaShift.has(value)) {
      reverse[value] = id;
      viaShift.delete(value);
    }
  }

  // Every table entry by what it outputs, whatever its length. The index above
  // is deliberately single-character — it exists to highlight one key — while
  // this one has to find the half form ख्, which is two.
  const byOutput: Record<string, string> = {};
  for (const [key, value] of Object.entries(table)) {
    if (!(value in byOutput)) byOutput[value] = key;
  }

  // Grouped by key, longest context first, so the most specific rule wins.
  const byKey = new Map<string, KeymapSequence[]>();
  for (const seq of sequences) {
    const list = byKey.get(seq.key);
    if (list) list.push(seq);
    else byKey.set(seq.key, [seq]);
  }
  for (const list of byKey.values()) list.sort((a, b) => b.before.length - a.before.length);

  return {
    label,
    size: Object.keys(table).length,
    resolve(key, before) {
      for (const seq of byKey.get(key) ?? []) {
        if (before.endsWith(seq.before)) return { text: seq.text, replace: seq.before.length };
      }
      const direct = table[key];
      return direct === undefined ? null : { text: direct, replace: 0 };
    },
    keyForOutput: (ch) => reverse[ch] ?? '',
    sequenceFor(ch) {
      if (reverse[ch]) return null; // a single key: not a sequence
      for (const seq of sequences) {
        if (seq.text !== ch) continue;
        const first = byOutput[seq.before];
        if (first) return [first, seq.key];
      }
      return null;
    },
    labelFor: (keyId, fallback) => {
      const value = table[keyId];
      return value && value.length === 1 ? value : fallback;
    },
  };
}
