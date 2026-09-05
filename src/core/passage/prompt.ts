/**
 * Asking a model for a passage of a given difficulty, and being able to check
 * the answer.
 *
 * The app already measures how hard a passage is to *type* — `rateDifficulty`
 * blends word length, punctuation, capitals, digits and rare letters. Nothing
 * generated material to hit a chosen reading, so a candidate who needed
 * harder practice had to go and find some.
 *
 * The important half is the check. "Write me something hard" is a wish; a
 * generated passage is only useful if the difficulty it claims is the
 * difficulty it has, so the service scores every reply with the same scorer the
 * library uses and asks again when the answer misses. Nothing here trusts the
 * model's own opinion of its output.
 *
 * Pure: prompt construction and parsing only, no I/O.
 */

import { PASSAGE_BANDS, PassageBand } from '../constants';

export interface PassageRequest {
  band: PassageBand;
  /** Target length in words. */
  words: number;
  /** Human language label, e.g. "English" / "Hindi". */
  language: string;
  /** Optional subject matter, so a candidate can practise on their own field. */
  topic?: string;
}

/**
 * Each band, expressed as the levers the scorer actually reads.
 *
 * Telling a model to write something "hard" produces obscure vocabulary, which
 * is hard to *read* and barely affects typing. The scorer measures five
 * mechanical things, so the prompt asks for those five things directly — which
 * is what makes a requested band reachable instead of a coin toss.
 */
const BAND_BRIEF: Record<PassageBand, string[]> = {
  [PassageBand.VeryEasy]: [
    'Average word length about 4 characters. Use common, short, everyday words.',
    'Almost no punctuation — full stops only, roughly one every 15 words.',
    'No digits at all. No capitals except the first letter of each sentence.',
    'Avoid the letters q, z, x, j, k and v almost entirely.',
  ],
  [PassageBand.Easy]: [
    'Average word length about 4.3 characters. Plain, familiar vocabulary.',
    'Light punctuation — full stops and the occasional comma.',
    'No digits. Capitals only at the start of sentences.',
    'Use q, z, x, j, k and v sparingly.',
  ],
  [PassageBand.Moderate]: [
    'Average word length about 4.7 characters — ordinary newspaper prose.',
    'Normal punctuation: commas, full stops, the odd semicolon.',
    'A couple of capitalised proper nouns. At most one or two numbers.',
    'Ordinary letter distribution.',
  ],
  [PassageBand.Hard]: [
    'Average word length about 5.5 characters. Formal, official register.',
    'Dense punctuation: commas, semicolons, colons, parentheses, hyphens.',
    'Several capitalised proper nouns, acronyms and initials.',
    'Include numbers, percentages and dates.',
    'Use words containing q, x, z, j, k and v more often than usual.',
  ],
  [PassageBand.VeryHard]: [
    'Average word length above 6 characters. Legal or technical register.',
    'Heavy punctuation throughout: semicolons, colons, parentheses, quotation marks, slashes, hyphens.',
    'Many capitalised proper nouns, acronyms, section numbers and initials.',
    'Frequent numbers, percentages, dates and figures.',
    'Deliberately include words with q, x, z, j, k and v.',
  ],
};

export const PASSAGE_SYSTEM_PROMPT = [
  'You write practice passages for typing tests taken by Indian competitive-exam',
  'candidates (SSC, Railway, Banking, Court, CPCT).',
  '',
  'Rules:',
  '- Continuous prose only. No headings, no bullet points, no line breaks.',
  '- Plain text: no markdown, no emphasis marks, no emoji.',
  '- Neutral, factual subject matter suitable for a government exam paper.',
  '- Straight quotes and hyphens only, never curly quotes or dashes.',
  '- The passage must be typeable on an ordinary keyboard.',
  '',
  'Respond with STRICT JSON only — no markdown, no code fences, no prose outside',
  'the object. Use exactly this shape:',
  '{ "passage": string }',
].join('\n');

export function buildPassagePrompt(req: PassageRequest): string {
  const lines = [
    `Write a typing-practice passage in ${req.language}.`,
    `Length: about ${req.words} words.`,
    '',
    'It must have these mechanical characteristics:',
    ...BAND_BRIEF[req.band].map((line) => `- ${line}`),
  ];
  if (req.topic?.trim()) {
    lines.push('', `Subject matter: ${req.topic.trim()}.`);
  }
  return lines.join('\n');
}

/**
 * A second attempt, told which way it missed.
 *
 * The correction is in the scorer's own terms — the same five levers — because
 * "make it harder" is what produced the miss in the first place. The previous
 * text is not sent back: it costs tokens and anchors the model to a passage
 * already known to be wrong.
 */
export function buildRetryPrompt(
  req: PassageRequest,
  measuredScore: number,
  targetScore: number,
): string {
  const harder = measuredScore < targetScore;
  return [
    buildPassagePrompt(req),
    '',
    `Your previous attempt measured ${measuredScore} on a 0-100 typing-difficulty`,
    `scale where the target is about ${targetScore}. Write a new passage that is`,
    harder
      ? 'noticeably HARDER to type: longer words, more punctuation marks, more capitals, more digits.'
      : 'noticeably EASIER to type: shorter and more common words, less punctuation, fewer capitals, fewer digits.',
  ].join('\n');
}

/**
 * The midpoint of a band's score range — what a retry aims at.
 *
 * Indexed off `PASSAGE_BANDS`, which is the array `bandFor` reads, and not off
 * the enum's declaration order. The two happen to agree today; if they ever
 * stopped, inverting the wrong one would aim every retry at the wrong band and
 * nothing would fail loudly enough to notice.
 */
export function targetScore(band: PassageBand): number {
  return PASSAGE_BANDS.indexOf(band) * 20 + 10;
}

/** Pull the passage out of the reply, tolerating a model that ignores the shape. */
export function parsePassage(raw: string): string | null {
  const json = extractJson(raw);
  if (json) {
    try {
      const obj = JSON.parse(json) as unknown;
      if (obj && typeof obj === 'object' && 'passage' in obj) {
        const text = (obj as { passage: unknown }).passage;
        if (typeof text === 'string' && text.trim()) return clean(text);
      }
    } catch {
      // Fall through to treating the reply as plain prose.
    }
  }
  // A model that answered with the passage and nothing else is still useful,
  // and refusing it would fail a request that actually succeeded.
  const bare = raw.trim();
  if (!bare || bare.startsWith('{')) return null;
  return clean(bare);
}

function extractJson(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced?.[1]?.trim() ?? raw.trim();
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  return start >= 0 && end > start ? body.slice(start, end + 1) : null;
}

/**
 * Normalise what came back into something typeable.
 *
 * Curly quotes and en dashes are the usual offenders: they are not on any
 * keyboard a candidate will sit at, so a passage containing them is unpassable
 * however good the prose is.
 */
function clean(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[   ]/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
