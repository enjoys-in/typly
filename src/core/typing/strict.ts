/**
 * Strict mode: nothing advances past a word until that word is right.
 *
 * The standard cure for typing fast and fixing later — a habit a practice app
 * happily rewards and an accuracy-gated exam like DEST at 90% does not.
 *
 * Deliberately narrower than error-free mode. Error-free rejects every wrong
 * *key*, which is a different exercise; this rejects only the word *boundary*,
 * so a mistake can be made and fixed inside a word but never carried into the
 * next one. That is what trains the habit rather than merely preventing it.
 */

/** A key that would finish the current word. */
export function isWordBoundary(key: string): boolean {
  return key === ' ' || key === 'Enter' || key === 'Tab';
}

/** Where the word being typed starts — just past the last whitespace. */
function wordStart(typed: string): number {
  for (let i = typed.length - 1; i >= 0; i--) {
    if (/\s/.test(typed[i]!)) return i + 1;
  }
  return 0;
}

/** The whole word the passage expects at `from`, up to its next whitespace. */
function expectedWordAt(passage: string, from: number): string {
  const rest = passage.slice(from);
  const end = rest.search(/\s/);
  return end === -1 ? rest : rest.slice(0, end);
}

/**
 * Whether the word in progress matches the passage *completely*.
 *
 * Compared against the whole expected word, not just its prefix: a half-typed
 * word is not a correct word, so `ca` for `cat` must not be allowed to end. And
 * compared over the *current* word only, because a mistake the typist has
 * already moved past must not lock the input forever.
 */
export function wordComplete(passage: string, typed: string): boolean {
  // Nothing to compare against — paper mode and free-form runs have no passage.
  if (!passage) return true;
  const start = wordStart(typed);
  return typed.slice(start) === expectedWordAt(passage, start);
}

/**
 * Whether strict mode can safely be enforced.
 *
 * With corrections forbidden there would be no way out of a wrong word: the
 * boundary is blocked and the character cannot be deleted, so the attempt
 * would be over. The two rules are mutually exclusive, and this is the one
 * place that says so.
 */
export function strictPossible(backspaceEnabled: boolean): boolean {
  return backspaceEnabled;
}
