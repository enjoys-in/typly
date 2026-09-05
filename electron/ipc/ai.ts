import { ipcMain } from 'electron';
import {
  handleCoachAnalyze,
  handleGrammarCheck,
  handleOcrVision,
  handlePassageGenerate,
} from '../../server/http/handler';
import { IpcChannel } from '../../src/core/ipc/channels';

// Serves the AI channels from the main process, so they work in the packaged app
// without a dev server — the same handlers the Vite backend exposes over HTTP.
export function registerAiIpc(): void {
  const fallbackKey = process.env.NVIDIA_API_KEY ?? '';
  ipcMain.handle(IpcChannel.AiCoach, (_e, body: unknown) => handleCoachAnalyze(body, fallbackKey));
  ipcMain.handle(IpcChannel.AiGrammar, (_e, body: unknown) => handleGrammarCheck(body, fallbackKey));
  ipcMain.handle(IpcChannel.AiOcr, (_e, body: unknown) => handleOcrVision(body, fallbackKey));
  ipcMain.handle(IpcChannel.AiPassage, (_e, body: unknown) =>
    handlePassageGenerate(body, fallbackKey),
  );
}

