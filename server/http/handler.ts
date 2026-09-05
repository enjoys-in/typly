// Framework-agnostic request handler for POST /api/coach/analyze. Takes a parsed
// JSON body and returns a status + JSON body, so it can be mounted on the Vite
// dev server today and reused from Fastify or Electron main later.

import type { AiSettings, CoachInput } from '../../src/core/coach/types';
import type { GrammarIssue } from '../../src/core/types';
import { AiError, type AiProviderConfig } from '../ai';
import { generateCoachFeedback } from '../coach/service';
import { checkGrammarWithAi } from '../grammar/service';
import { buildOcrPrompt, extractTextFromImage } from '../ocr/service';
import { generatePassage } from '../passage/service';
import { PassageBand } from '../../src/core/constants';
import type { PassageRequest } from '../../src/core/passage/prompt';

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

export interface PassageRequestBody {
  request: PassageRequest;
  settings: AiSettings;
}

/** Longest passage worth generating: past this it is a document, not a drill. */
const MAX_WORDS = 600;
const MIN_WORDS = 40;

/** POST /api/passage/generate — prose at a requested typing difficulty. */
export async function handlePassageGenerate(
  raw: unknown,
  fallbackKey: string,
  signal?: AbortSignal,
): Promise<HandlerResult> {
  const body = raw as Partial<PassageRequestBody> | null;
  if (!body || typeof body !== 'object' || !body.request || !body.settings) {
    return { status: 400, body: { error: 'Expected { request, settings } in the request body.' } };
  }

  const req = body.request;
  // Validated here rather than trusted: the word count sets the token budget,
  // so an absurd value is a bill, and an unknown band would index undefined
  // guidance and quietly generate against no brief at all.
  if (!Object.values(PassageBand).includes(req.band)) {
    return { status: 400, body: { error: 'Unknown difficulty band.' } };
  }
  const words = Math.round(Number(req.words));
  if (!Number.isFinite(words) || words < MIN_WORDS || words > MAX_WORDS) {
    return {
      status: 400,
      body: { error: `Word count must be between ${MIN_WORDS} and ${MAX_WORDS}.` },
    };
  }

  const settings = body.settings;
  const config: AiProviderConfig = {
    provider: settings.provider,
    model: settings.model,
    apiKey: settings.apiKey?.trim() || fallbackKey,
    baseUrl: settings.baseUrl,
  };

  try {
    const passage = await generatePassage(
      {
        band: req.band,
        words,
        language: String(req.language || 'English').slice(0, 40),
        ...(req.topic ? { topic: String(req.topic).slice(0, 200) } : {}),
      },
      config,
      signal,
    );
    return { status: 200, body: passage };
  } catch (err) {
    const status = err instanceof AiError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'Unexpected AI error.';
    return { status, body: { error: message } };
  }
}
