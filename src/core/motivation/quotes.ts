/**
 * The quote itself, and a bundled set for when there is no network.
 *
 * Typly is offline-first — that is the whole product, not a nice-to-have — so a
 * feature that only works online would be a regression even if it degraded
 * politely. The bundled quotes are therefore not a fallback in the apologetic
 * sense: they are the default, and a fetched batch is an upgrade over them.
 *
 * They lean deliberately towards persistence and repetition rather than
 * grand-vision material. The reader has just missed a cut-off; "practice is
 * what makes this work" is useful to them and "follow your dreams" is not.
 */

export interface Quote {
  text: string;
  /** Attribution as given. Empty for the handful that circulate unattributed. */
  author: string;
}

/**
 * Ships in the bundle. All long out of copyright or so widely circulated as to
 * be proverbial, which is the constraint that keeps this list safe to embed —
 * a fetched quote is shown as the API served it and credited to the API.
 */
export const FALLBACK_QUOTES: readonly Quote[] = [
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Practice is the best of all instructors.', author: 'Publilius Syrus' },
  {
    text: 'Perseverance is not a long race; it is many short races one after the other.',
    author: 'Walter Elliot',
  },
  { text: 'Little strokes fell great oaks.', author: 'Benjamin Franklin' },
  { text: 'The beginning is the most important part of the work.', author: 'Plato' },
  { text: 'A river cuts through rock not because of its power, but its persistence.', author: '' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'Patience and perseverance have a magical effect.', author: 'John Quincy Adams' },
  { text: 'Slow and steady wins the race.', author: 'Aesop' },
  { text: 'What we learn to do, we learn by doing.', author: 'Aristotle' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
  {
    text: 'Nothing in the world can take the place of persistence.',
    author: 'Calvin Coolidge',
  },
];

/** Longest quote worth showing: past this it is an essay, not a nudge. */
const MAX_LENGTH = 180;

/**
 * Trims and rejects what cannot be shown.
 *
 * Applied to fetched quotes because they arrive from someone else's database:
 * the occasional entry is a paragraph, is blank, or carries the HTML entities
 * of the API's own pre-rendered markup. Better to drop those than to render a
 * `&rsquo;` at the reader.
 */
export function usableQuote(quote: Quote): boolean {
  const text = quote.text.trim();
  return text.length > 0 && text.length <= MAX_LENGTH && !/[<>]|&[a-z#][a-z0-9]*;/i.test(text);
}

/**
 * One quote from the set, chosen by `seed`.
 *
 * Deterministic on purpose. The results page re-renders on a series countdown
 * tick, and a quote that reshuffled underneath the reader mid-sentence would be
 * the single most irritating thing on the screen. Seeding it on the saved run
 * means one run keeps one quote, and the next run gets a different one.
 */
export function pickQuote(quotes: readonly Quote[], seed: number): Quote | null {
  if (quotes.length === 0) return null;
  const index = Math.abs(Math.trunc(seed)) % quotes.length;
  return quotes[index] ?? null;
}
