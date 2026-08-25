import type { AiSettings } from '@/core/coach/types';
import { IpcChannel } from '@/core/ipc/channels';
import { callAi } from './aiTransport';

// Detect image mime from magic bytes so the data URL is well-formed.
function mimeFromBytes(b: Uint8Array): string {
  if (b[0] === 0x89 && b[1] === 0x50) return 'image/png';
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
  if (b[0] === 0x47 && b[1] === 0x49) return 'image/gif';
  if (b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45) return 'image/webp';
  return 'image/png';
}

export function bytesToDataUrl(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:${mimeFromBytes(bytes)};base64,${btoa(binary)}`;
}

// Transcribe an image with a multimodal LLM (2nd OCR engine). Same channel over
// IPC (desktop) or HTTP (web) via the shared AI transport.
export async function recognizeVision(
  imageDataUrl: string,
  settings: AiSettings,
  lang: string,
  signal?: AbortSignal,
): Promise<string> {
  const model = settings.visionModel?.trim() || undefined;
  const body = (await callAi(
    IpcChannel.AiOcr,
    { imageDataUrl, settings, lang, model },
    signal,
  )) as { text?: string };
  return (body.text ?? '').trim();
}
