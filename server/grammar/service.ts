// Backend AI-grammar domain: build the prompt, ask the configured provider, parse
// + re-locate issues. Depends only on the generic provider factory + pure core.

import {
  GRAMMAR_SYSTEM_PROMPT,
  buildGrammarUserPrompt,
  parseAiGrammar,
} from '../../src/core/grammar/aiPrompt';
import type { GrammarIssue } from '../../src/core/types';
import { createAiProvider, type AiProviderConfig } from '../ai';

export async function checkGrammarWithAi(
  text: string,
  langLabel: string,
  config: AiProviderConfig,
  signal?: AbortSignal,
): Promise<GrammarIssue[]> {
  const provider = createAiProvider(config);
  const { content } = await provider.chat(
    {
      messages: [
        { role: 'system', content: GRAMMAR_SYSTEM_PROMPT },
        { role: 'user', content: buildGrammarUserPrompt(text, langLabel) },
      ],
      temperature: 0,
      maxTokens: 900,
    },
    signal,
  );
  return parseAiGrammar(content, text);
}
