import type { PassageWriter } from '../ports';
import type { AiSettings } from '@/core/coach/types';
import type { PassageRequest } from '@/core/passage/prompt';
import type { GeneratedPassage } from '@/core/passage/types';
import { callAi } from './aiTransport';
import { IpcChannel } from '@/core/ipc/channels';
import { isAiEnabled } from '@/store/aiSettingsStore';

// Thin client, like the coach: the browser never calls the AI vendor directly.
// It goes through the backend — Electron main over IPC in the packaged app, or
// the matching HTTP route on the web/dev server.
export class BrowserPassageWriter implements PassageWriter {
  available(): boolean {
    return isAiEnabled();
  }

  async generate(
    request: PassageRequest,
    settings: AiSettings,
    signal?: AbortSignal,
  ): Promise<GeneratedPassage> {
    return (await callAi(
      IpcChannel.AiPassage,
      { request, settings },
      signal,
    )) as GeneratedPassage;
  }
}
