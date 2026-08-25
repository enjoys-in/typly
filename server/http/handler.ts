// Framework-agnostic request handler for POST /api/coach/analyze. Takes a parsed
// JSON body and returns a status + JSON body, so it can be mounted on the Vite
// dev server today and reused from Fastify or Electron main later.

import type { AiSettings, CoachInput } from '../../src/core/coach/types';
import type { GrammarIssue } from '../../src/core/types';
import { AiError, type AiProviderConfig } from '../ai';
import { generateCoachFeedback } from '../coach/service';
import { checkGrammarWithAi } from '../grammar/service';
import { buildOcrPrompt, extractTextFromImage } from '../ocr/service';

// Default multimodal model for vision OCR when the client doesn't specify one.
export const DEFAULT_VISION_MODEL = 'meta/llama-3.2-90b-vision-instruct';

export interface CoachRequestBody {
  input: CoachInput;
  settings: AiSettings;
}

export interface HandlerResult {
  status: number;
  body: unknown;
}

/**
 * @param fallbackKey Server-side key (e.g. from NVIDIA_API_KEY) used when the
 * client didn't supply one.
 */
export async function handleCoachAnalyze(
  raw: unknown,
  fallbackKey: string,
  signal?: AbortSignal,
): Promise<HandlerResult> {
  const body = raw as Partial<CoachRequestBody> | null;
  if (!body || typeof body !== 'object' || !body.input || !body.settings) {
    return { status: 400, body: { error: 'Expected { input, settings } in the request body.' } };
  }

  const settings = body.settings;
  const config: AiProviderConfig = {
    provider: settings.provider,
    model: settings.model,
    apiKey: settings.apiKey?.trim() || fallbackKey,
    baseUrl: settings.baseUrl,
  };

  try {
    const feedback = await generateCoachFeedback(body.input, config, signal);
    return { status: 200, body: feedback };
  } catch (err) {
    const status = err instanceof AiError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'Unexpected AI error.';
    return { status, body: { error: message } };
  }
}

export interface GrammarRequestBody {
  text: string;
  lang: string; // human label, e.g. "English" / "Hindi"
  settings: AiSettings;
}

/** POST /api/grammar/check — AI grammar/spelling for any language (Mode 2). */
export async function handleGrammarCheck(
  raw: unknown,
  fallbackKey: string,
  signal?: AbortSignal,
): Promise<HandlerResult> {
  const body = raw as Partial<GrammarRequestBody> | null;
  if (!body || typeof body !== 'object' || typeof body.text !== 'string' || !body.settings) {
    return { status: 400, body: { error: 'Expected { text, lang, settings } in the request body.' } };
  }

  const text = body.text.slice(0, 8000); // cap prompt size
  const settings = body.settings;
  const config: AiProviderConfig = {
    provider: settings.provider,
    model: settings.model,
    apiKey: settings.apiKey?.trim() || fallbackKey,
    baseUrl: settings.baseUrl,
  };

  try {
    const issues: GrammarIssue[] = await checkGrammarWithAi(
      text,
      body.lang || 'English',
      config,
      signal,
    );
    return { status: 200, body: { issues } };
  } catch (err) {
    const status = err instanceof AiError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'Unexpected AI error.';
    return { status, body: { error: message } };
  }
}

export interface OcrVisionRequestBody {
  imageDataUrl: string;
  lang?: string; // 'eng' | 'hin'
  model?: string; // override the default vision model
  settings: AiSettings;
}

/** POST /api/ocr/vision — transcribe an image with a multimodal LLM (2nd engine). */
export async function handleOcrVision(
  raw: unknown,
  fallbackKey: string,
  signal?: AbortSignal,
): Promise<HandlerResult> {
  const body = raw as Partial<OcrVisionRequestBody> | null;
  if (!body || typeof body !== 'object' || typeof body.imageDataUrl !== 'string' || !body.settings) {
    return { status: 400, body: { error: 'Expected { imageDataUrl, settings } in the request body.' } };
  }

  const settings = body.settings;
  const config: AiProviderConfig = {
    provider: settings.provider,
    model: body.model?.trim() || DEFAULT_VISION_MODEL,
    apiKey: settings.apiKey?.trim() || fallbackKey,
    baseUrl: settings.baseUrl,
  };

  try {
    const text = await extractTextFromImage(body.imageDataUrl, buildOcrPrompt(body.lang), config, signal);
    return { status: 200, body: { text } };
  } catch (err) {
    const status = err instanceof AiError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'Unexpected AI error.';
    return { status, body: { error: message } };
  }
}
