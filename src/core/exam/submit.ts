/**
 * Bounding the work that stands between a finished run and its result.
 *
 * Submitting a paper run analyses what was typed: the spell engine has to load
 * a dictionary, and the grammar checker a multi-megabyte WASM linter — or, in
 * AI mode, reach a provider over the network. Every one of those can stall
 * rather than fail, and a promise that never settles cannot be caught: the
 * clock had already stopped, so the candidate was left looking at a frozen
 * screen with no result and a submit button that did nothing, because the run
 * had already marked itself as finishing.
 *
 * Neither analysis is what the run is *marked* on — speed and corrections come
 * from the keystrokes — so neither is worth waiting on indefinitely. A result
 * with no grammar notes beats no result at all.
 */

/**
 * `work`, but never for longer than `ms`, after which `fallback` stands in. A
 * rejection resolves to the same fallback, so one call covers both a failure
 * and a stall.
 *
 * The work is not cancelled — none of what this bounds can be — it is simply
 * left to settle into nothing.
 */
export function withTimeout<T>(work: Promise<T>, fallback: T, ms: number): Promise<T> {
  return new Promise<T>((resolve) => {
    let settled = false;
    const finish = (value: T) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => finish(fallback), ms);
    work.then(
      (value) => finish(value),
      () => finish(fallback),
    );
  });
}
