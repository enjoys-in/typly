// Backend vision-OCR domain: send an image to a multimodal LLM and return the
// transcribed text. Reuses the same OpenAI-compatible provider as the coach.

import { createAiProvider, type AiProviderConfig } from '../ai';

export function buildOcrPrompt(lang?: string): string {
  const script = lang === 'hin' ? ' The text is in Hindi (Devanagari script).' : '';
  return (
    'Extract all the text from this image exactly as written, preserving line breaks, ' +
    `spelling, numbers and punctuation.${script} Output only the extracted text with no ` +
    'explanations, labels, or surrounding quotation marks.'
  );
}

export async function extractTextFromImage(
  imageDataUrl: string,
  prompt: string,
  config: AiProviderConfig,
  signal?: AbortSignal,
): Promise<string> {
  const provider = createAiProvider(config);
  const { content } = await provider.chat(
    {
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
      temperature: 0,
      maxTokens: 1500,
    },
    signal,
  );
  return content.trim();
}
