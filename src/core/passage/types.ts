/**
 * What a generation returns.
 *
 * Deliberately does not carry a difficulty reading. The scorer is pure and
 * shipped in the renderer, so the UI rates the text it actually received rather
 * than displaying a number the backend asserted — which makes it impossible for
 * the band on screen to disagree with the passage under it.
 */
export interface GeneratedPassage {
  text: string;
  /** How many generations it took, so a near miss can be admitted. */
  attempts: number;
  /** Whether the final attempt landed in the requested band. */
  onTarget: boolean;
}
