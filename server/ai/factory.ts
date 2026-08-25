// The adapter factory: maps a provider id + config to a concrete AiProvider.
// Add a new vendor by registering its default base URL (or a bespoke adapter
// class) here — nothing else in the backend changes.

import { AiError, type AiProvider, type AiProviderConfig } from './types';
import { OpenAiCompatibleProvider } from './providers/openaiCompatible';

/** Per-provider default endpoints (all OpenAI-compatible). */
const DEFAULT_BASE_URLS: Record<string, string> = {
  nvidia: 'https://integrate.api.nvidia.com/v1',
  openai: 'https://api.openai.com/v1',
};

export function createAiProvider(config: AiProviderConfig): AiProvider {
  const baseUrl = (config.baseUrl?.trim() || DEFAULT_BASE_URLS[config.provider]) ?? '';
  if (!baseUrl) {
    throw new AiError(400, `Unknown AI provider "${config.provider}".`);
  }
  if (!config.apiKey) {
    throw new AiError(401, 'No AI API key. Add your key in Settings to use AI features.');
  }
  if (!config.model) {
    throw new AiError(400, 'Missing model id.');
  }
  return new OpenAiCompatibleProvider({
    id: config.provider,
    baseUrl,
    apiKey: config.apiKey,
    model: config.model,
  });
}
