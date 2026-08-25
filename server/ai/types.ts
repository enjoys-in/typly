// Generic AI provider contract for the backend. Providers are interchangeable
// behind this interface so the coach service never depends on a vendor.

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: ChatContent;
}

// Text-only, or OpenAI-style multimodal parts (used for vision OCR).
export type ChatContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    >;

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResult {
  content: string;
}

export interface AiProvider {
  readonly id: string;
  chat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResult>;
}

/** Everything the factory needs to build a provider. */
export interface AiProviderConfig {
  provider: string; // 'nvidia' | 'openai' | ...
  model: string;
  apiKey: string;
  /** Optional base-URL override; the factory supplies a per-provider default. */
  baseUrl?: string;
}

/** Carries an HTTP status so the route can map failures to responses. */
export class AiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AiError';
  }
}
