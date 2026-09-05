// Mounts the backend coach endpoint onto Vite's dev/preview server so the app
// runs as a single process during development. The server-side fallback API key
// is read once at config time and injected here — it never reaches the browser
// bundle. In production, serve `handleCoachAnalyze` from a real backend instead.

import type { Connect, Plugin } from 'vite';
import type { ServerResponse } from 'node:http';
import {
  handleCoachAnalyze,
  handleGrammarCheck,
  handleOcrVision,
  handlePassageGenerate,
  type HandlerResult,
} from './http/handler';
import { AI_HTTP_ROUTE, IpcChannel, type AiChannel } from '../src/core/ipc/channels';

const MAX_BODY_BYTES = 256 * 1024;
const OCR_MAX_BODY_BYTES = 16 * 1024 * 1024; // base64 images are large

type Handler = (body: unknown, fallbackKey: string) => Promise<HandlerResult>;

// Every AI channel + its main handler and body cap — the same channels the
// Electron main process serves over IPC (see electron/ipc/ai.ts).
const AI_HANDLERS: Record<AiChannel, { handler: Handler; maxBytes: number }> = {
  [IpcChannel.AiCoach]: { handler: handleCoachAnalyze, maxBytes: MAX_BODY_BYTES },
  [IpcChannel.AiGrammar]: { handler: handleGrammarCheck, maxBytes: MAX_BODY_BYTES },
  [IpcChannel.AiOcr]: { handler: handleOcrVision, maxBytes: OCR_MAX_BODY_BYTES },
  [IpcChannel.AiPassage]: { handler: handlePassageGenerate, maxBytes: MAX_BODY_BYTES },
};

export function aiBackendPlugin(fallbackKey: string): Plugin {
  const middleware =
    (handler: Handler, maxBytes = MAX_BODY_BYTES): Connect.NextHandleFunction =>
    (req, res, next) => {
      if (req.method !== 'POST') {
        next();
        return;
      }
      readJson(req, maxBytes)
        .then((body) => handler(body, fallbackKey))
        .then(({ status, body }) => sendJson(res, status, body))
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Bad request.';
          sendJson(res, 400, { error: message });
        });
    };

  const mount = (server: { middlewares: Connect.Server }) => {
    (Object.keys(AI_HANDLERS) as AiChannel[]).forEach((channel) => {
      const { handler, maxBytes } = AI_HANDLERS[channel];
      server.middlewares.use(AI_HTTP_ROUTE[channel], middleware(handler, maxBytes));
    });
  };

  return {
    name: 'typly-ai-backend',
    configureServer(server) {
      mount(server);
    },
    configurePreviewServer(server) {
      mount(server);
    },
  };
}

function readJson(req: Connect.IncomingMessage, maxBytes: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Request body too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      if (!text) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
