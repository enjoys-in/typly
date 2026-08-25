// Pure prompt construction + response parsing for the AI coach. Shared by the
// backend (which calls the model) and kept provider-agnostic. No I/O here.

import type { CoachFeedback, CoachInput } from './types';

export const COACH_SYSTEM_PROMPT = [
  'You are an expert typing coach for competitive government-exam aspirants',
  '(SSC, Railway, Banking, Court). Analyze the typing performance and give',
  'concise, practical, encouraging feedback.',
  'Respond with STRICT JSON only — no markdown, no code fences, no prose outside',
  'the object. Use exactly this shape:',
  '{',
  '  "summary": string,           // 1-2 sentence overview',
  '  "mainWeakness": string,      // the single biggest issue',
  '  "tips": string[],            // exactly 3 short, actionable tips',
  '  "focusKeys": string[],       // characters/keys to drill',
  '  "exercise": string,          // one short practice exercise',
  '  "goal": string               // one measurable next-session goal',
  '}',
].join('\n');

export function buildCoachUserPrompt(input: CoachInput): string {
  const weak = input.weakWords.length
    ? input.weakWords.map((w) => `${w.word} (${w.count})`).join(', ')
    : 'none';
  const cats = input.categories.length
    ? input.categories.map((c) => `${c.label} (${c.count})`).join(', ')
    : 'none';
  const keys = input.focusChars.length ? input.focusChars.join(', ') : 'none';

  return [
    `Analyze this typing student's performance.`,
    ``,
    `Exam: ${input.exam}`,
    `Language: ${input.language}`,
    `Result: ${input.passed ? 'PASSED' : 'FAILED'}`,
    `Net WPM: ${input.netWpm}`,
    `Gross WPM: ${input.grossWpm}`,
    `Accuracy: ${input.accuracy}%`,
    `Errors: ${input.errors}`,
    `Duration: ${input.durationSec} seconds`,
    `Most-missed keys: ${keys}`,
    `Frequently mistyped words: ${weak}`,
    `Error categories: ${cats}`,
  ].join('\n');
}

/** Defensively parse the model's reply into `CoachFeedback`, or null on failure. */
export function parseCoachFeedback(raw: string): CoachFeedback | null {
  const json = extractJson(raw);
  if (!json) return null;
  let obj: unknown;
  try {
    obj = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof obj !== 'object' || obj === null) return null;
  const o = obj as Record<string, unknown>;
  const feedback: CoachFeedback = {
    summary: asString(o.summary),
    mainWeakness: asString(o.mainWeakness),
    tips: asStringArray(o.tips),
    focusKeys: asStringArray(o.focusKeys),
    exercise: asString(o.exercise),
    goal: asString(o.goal),
  };
  const hasContent = feedback.summary || feedback.mainWeakness || feedback.tips.length;
  return hasContent ? feedback : null;
}

// Models sometimes wrap JSON in ```json fences or add stray text; grab the
// outermost object.
function extractJson(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced?.[1] ?? raw;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  return body.slice(start, end + 1);
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean);
}
