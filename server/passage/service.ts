// Backend passage domain: ask the provider for a passage, then check it with
// the app's own difficulty scorer and ask again if it missed. Depends only on
// the generic provider factory and the pure core modules.

import {
  buildPassagePrompt,
  buildRetryPrompt,
  parsePassage,
  PASSAGE_SYSTEM_PROMPT,
  targetScore,
  type PassageRequest,
} from '../../src/core/passage/prompt';
import type { GeneratedPassage } from '../../src/core/passage/types';
import { bandFor, rateDifficulty } from '../../src/core/text/difficulty';
import { AiError, createAiProvider, type AiProviderConfig } from '../ai';

/** One retry. A second miss is reported, not hidden behind a third bill. */
const MAX_ATTEMPTS = 2;

/** Roughly 1.4 tokens a word, plus headroom for the JSON wrapper. */
function tokenBudget(words: number): number {
  return Math.min(4000, Math.round(words * 2.2) + 400);
}

/** Just the part of a provider this needs, so a test can stand in for one. */
export type ChatFn = (
  request: { messages: { role: string; content: string }[]; temperature: number; maxTokens: number },
  signal?: AbortSignal,
) => Promise<{ content: string }>;

export async function generatePassage(
  req: PassageRequest,
  config: AiProviderConfig,
  signal?: AbortSignal,
): Promise<GeneratedPassage> {
  const provider = createAiProvider(config);
  return generateWithChat(req, (request, sig) => provider.chat(request as never, sig), signal);
}

/**
 * The ask-check-retry loop, with the provider passed in.
 *
 * Separated from `generatePassage` purely so this — the part with the actual
 * decisions in it — can be exercised against a stub instead of a billed
 * network call.
 */
export async function generateWithChat(
  req: PassageRequest,
  chat: ChatFn,
  signal?: AbortSignal,
): Promise<GeneratedPassage> {
  const target = targetScore(req.band);
  let best: { text: string; score: number } | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const user =
      attempt === 1 ? buildPassagePrompt(req) : buildRetryPrompt(req, best!.score, target);
    const { content } = await chat(
      {
        messages: [
          { role: 'system', content: PASSAGE_SYSTEM_PROMPT },
          { role: 'user', content: user },
        ],
        // Prose wants some room to move; the difficulty is pinned by the check
        // below rather than by a low temperature.
        temperature: 0.8,
        maxTokens: tokenBudget(req.words),
      },
      signal,
    );

    const text = parsePassage(content);
    if (!text) throw new AiError(502, 'Could not read a passage out of the AI response.');

    // The whole point: measured with the same scorer the library shows, not
    // taken on trust from the model.
    const score = rateDifficulty(text).score;
    if (bandFor(score) === req.band) return { text, attempts: attempt, onTarget: true };

    // Keep whichever attempt landed closest, so a miss still returns the best
    // passage rather than the last one.
    if (!best || Math.abs(score - target) < Math.abs(best.score - target)) {
      best = { text, score };
    }
  }

  return { text: best!.text, attempts: MAX_ATTEMPTS, onTarget: false };
}
