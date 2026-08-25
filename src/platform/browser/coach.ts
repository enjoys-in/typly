import type { AiCoach } from '../ports';
import type { AiSettings, CoachFeedback, CoachInput } from '@/core/coach/types';
import { callAi } from './aiTransport';
import { IpcChannel } from '@/core/ipc/channels';
import { isAiEnabled } from '@/store/aiSettingsStore';

// Thin client: the browser never calls the AI vendor directly. It goes through the
// backend (Electron main via IPC in the desktop app, or the dev/preview HTTP route).
export class BrowserAiCoach implements AiCoach {
  available(): boolean {
    return isAiEnabled();
  }

  async analyze(
    input: CoachInput,
    settings: AiSettings,
    signal?: AbortSignal,
  ): Promise<CoachFeedback> {
    return (await callAi(IpcChannel.AiCoach, { input, settings }, signal)) as CoachFeedback;
  }
}
