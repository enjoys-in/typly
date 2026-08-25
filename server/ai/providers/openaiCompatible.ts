// A single adapter that speaks the OpenAI-compatible /chat/completions API.
// NVIDIA NIM, OpenAI, and most hosted LLM gateways share this shape, so one
// implementation serves many providers — the factory just varies the base URL.

import { AiError, type AiProvider, type ChatRequest, type ChatResult } from '../types';
import {
  RATE_LIMIT_STATUS,
  rateLimitMessage,
  retryAfterSeconds,
} from '../../../src/core/ai/rateLimit';

interface ProviderOptions {
  id: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
}

export class OpenAiCompatibleProvider implements AiProvider {
  readonly id: string;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(opts: ProviderOptions) {
    this.id = opts.id;
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.apiKey = opts.apiKey;
    this.model = opts.model;
  }

  async chat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResult> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal,
        body: JSON.stringify({
          model: this.model,
          temperature: req.temperature ?? 1,
          max_tokens: req.maxTokens ?? 700,
          messages: req.messages,
        }),
      });
    } catch (err) {
      throw new AiError(502, `Could not reach AI provider: ${errorMessage(err)}`);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      if (res.status === RATE_LIMIT_STATUS) {
        throw new AiError(
          RATE_LIMIT_STATUS,
          rateLimitMessage(retryAfterSeconds(res.headers.get('retry-after'))),
        );
      }
      throw new AiError(res.status, `AI provider error (${res.status}): ${truncate(detail)}`);
    }

    const data = (await res.json().catch(() => null)) as ChatCompletionResponse | null;
    const content = data?.choices?.[0]?.message?.content ?? '';
    if (!content) throw new AiError(502, 'AI provider returned an empty response.');
    return { content };
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function truncate(text: string, max = 300): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}
