// Pure, shared AI-grammar prompt + parser. The model returns the exact wrong
// substring ("excerpt") rather than character offsets (LLMs miscount those), and
// we re-locate each excerpt in the source text to produce reliable GrammarIssues.

import type { GrammarIssue } from '../types';

export const GRAMMAR_SYSTEM_PROMPT = `You are a precise proofreader. Find real grammar, spelling and punctuation mistakes in the user's text.
Reply with ONLY a JSON object — no prose, no code fences:
{"issues":[{"excerpt":"<exact wrong substring copied verbatim from the text>","message":"<short reason>","suggestion":"<corrected replacement for the excerpt, or empty string to delete it>"}]}
Rules:
- "excerpt" MUST be an exact, verbatim substring of the text (identical characters and case) so it can be located.
- Keep each excerpt short — the wrong word or phrase, not the whole sentence.
- Only report genuine mistakes. If there are none, reply {"issues":[]}.
- Work in the text's own language (including Hindi/Devanagari).`;

export function buildGrammarUserPrompt(text: string, langLabel: string): string {
  return `Language: ${langLabel}\n\nText:\n"""\n${text}\n"""`;
}

interface RawIssues {
  issues?: { excerpt?: unknown; message?: unknown; suggestion?: unknown }[];
}

export function parseAiGrammar(content: string, text: string): GrammarIssue[] {
  const parsed = extractJson(content);
  if (!parsed || !Array.isArray(parsed.issues)) return [];

  const issues: GrammarIssue[] = [];
  let cursor = 0;
  for (const raw of parsed.issues) {
    const excerpt = typeof raw?.excerpt === 'string' ? raw.excerpt : '';
    if (!excerpt) continue;
    // Prefer the next occurrence after the last match so duplicates map in order.
    let offset = text.indexOf(excerpt, cursor);
    if (offset === -1) offset = text.indexOf(excerpt);
    if (offset === -1) continue;
    const suggestion = typeof raw?.suggestion === 'string' ? raw.suggestion.trim() : '';
    const message =
      typeof raw?.message === 'string' && raw.message.trim() ? raw.message.trim() : 'Possible mistake';
    issues.push({
      offset,
      length: excerpt.length,
      message,
      replacements: suggestion ? [suggestion] : [],
    });
    cursor = offset + excerpt.length;
  }
  return issues.sort((a, b) => a.offset - b.offset);
}

function extractJson(content: string): RawIssues | null {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(content.slice(start, end + 1)) as RawIssues;
  } catch {
    return null;
  }
}
