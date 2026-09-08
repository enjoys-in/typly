import { ipcMain } from 'electron';
import {
  handleCoachAnalyze,
  handleGrammarCheck,
  handleOcrVision,
  handlePassageGenerate,
  handleQuotesBatch,
} from '../../server/http/handler';
import { IpcChannel } from '../../src/core/ipc/channels';

// Serves the backend channels from the main process, so they work in the
// packaged app without a dev server — the same handlers the Vite backend
// exposes over HTTP (see server/vite.ts).
//
// Not all of them are AI: the quote batch is here because the quote API sends
// no CORS headers, and the main process is not a browsing context, so it is the
// one place in the desktop build that can make the request at all.
export function registerBackendIpc(): void {
  const fallbackKey = process.env.NVIDIA_API_KEY ?? '';
  ipcMain.handle(IpcChannel.AiCoach, (_e, body: unknown) => handleCoachAnalyze(body, fallbackKey));
  ipcMain.handle(IpcChannel.AiGrammar, (_e, body: unknown) => handleGrammarCheck(body, fallbackKey));
  ipcMain.handle(IpcChannel.AiOcr, (_e, body: unknown) => handleOcrVision(body, fallbackKey));
  ipcMain.handle(IpcChannel.AiPassage, (_e, body: unknown) =>
    handlePassageGenerate(body, fallbackKey),
  );
  // Takes no body and no key — a plain proxy for a public endpoint.
  ipcMain.handle(IpcChannel.Quotes, () => handleQuotesBatch(null, fallbackKey));
}
