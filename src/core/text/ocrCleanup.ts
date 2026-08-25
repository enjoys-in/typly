import { Lang } from '../constants';

// Emoji, flags, skin-tone modifiers, variation selectors, ZWJ and keycap combiner.
// Letters (incl. Devanagari), digits, punctuation and other symbols are preserved.
const EMOJI_RE =
  /[\p{Extended_Pictographic}\p{Regional_Indicator}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D\u20E3]/gu;

// Remove emoji so a passage contains only alphabet, numeric and special characters.
export function stripEmoji(text: string): string {
  return text.replace(EMOJI_RE, '');
}

// Language-aware cleanup of raw OCR / imported text into an exam passage.
export function cleanText(raw: string, lang: Lang): string {
  let text = stripEmoji(raw.replace(/\r\n?/g, '\n'));

  // Collapse runs of spaces/tabs but keep paragraph breaks.
  text = text.replace(/[ \t]+/g, ' ');
  // Join lines that were wrapped mid-sentence (no sentence-ending punctuation).
  text = text.replace(/([^.!?\n])\n(?=\S)/g, '$1 ');
  // Normalize multiple blank lines to a single paragraph break.
  text = text.replace(/\n{3,}/g, '\n\n');

  // English OCR often mangles spacing around punctuation.
  if (lang === Lang.En) {
    text = text.replace(/\s+([,.!?;:])/g, '$1');
  }

  return text.trim();
}

export function charCount(text: string): number {
  return text.length;
}
