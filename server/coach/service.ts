// Backend coach domain: build the prompt, ask the configured provider, parse the
// reply. Depends only on the generic provider factory + the pure core prompt.

import {
  buildCoachUserPrompt,
  COACH_SYSTEM_PROMPT,
  parseCoachFeedback,
} from '../../src/core/coach/prompt';
import type { CoachFeedback, CoachInput } from '../../src/core/coach/types';
import { AiError, createAiProvider, type AiProviderConfig } from '../ai';

export async function generateCoachFeedback(
  input: CoachInput,
  config: AiProviderConfig,
  signal?: AbortSignal,
): Promise<CoachFeedback> {
  const provider = createAiProvider(config);
  const { content } = await provider.chat(
    {
      messages: [
        { role: 'system', content: COACH_SYSTEM_PROMPT },
        { role: 'user', content: buildCoachUserPrompt(input) },
      ],
      temperature: 1,
      maxTokens: 700,
    },
    signal,
  );
  const feedback = parseCoachFeedback(content);
  if (!feedback) throw new AiError(502, 'Could not parse the AI response.');
  return feedback;
}
