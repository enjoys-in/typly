/**
 * Does this keystroke ask for an inspector?
 *
 * Kept apart from the policy module, which touches `app` at load time and so
 * can only be imported inside Electron. This half is pure — a keystroke in, a
 * verdict out — which is what makes the coverage testable rather than assumed.
 */
export function isDevToolsChord(input: {
  type: string;
  key: string;
  control: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
}): boolean {
  if (input.type !== 'keyDown') return false;
  const key = input.key.toLowerCase();
  // F12 on its own, everywhere.
  if (key === 'f12') return true;
  // Ctrl+Shift+I / J / C on Windows and Linux, Cmd+Opt+… on macOS.
  const chord = (input.control || input.meta) && (input.shift || input.alt);
  if (chord && ['i', 'j', 'c'].includes(key)) return true;
  // Ctrl/Cmd+U — view source, the same leak by another route.
  if ((input.control || input.meta) && key === 'u') return true;
  return false;
}
