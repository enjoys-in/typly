// Single source of truth for IPC/backend channel names, shared by the Electron
// main process, the preload bridge, the Vite backend, and the renderer — so no
// channel is ever a bare string literal.
export const enum IpcChannel {
  RepoInvoke = 'repo:invoke',
  RepoAvailable = 'repo:available',
  FontsRead = 'fonts:read',
  FontsWrite = 'fonts:write',
  ReminderSet = 'reminder:set',
  /** Main → renderer: a file the OS asked Typly to open. */
  FileOpened = 'file:opened',
  /** Renderer → main: hand over a file that arrived before the UI was ready. */
  FilePending = 'file:pending',
  /** Renderer → main: what the tray, dock badge and jump list should say. */
  ShellStatus = 'shell:status',
  /** Renderer → main: 0..1 exam progress for the taskbar/dock progress bar. */
  ShellProgress = 'shell:progress',
  /** Main → renderer: a route picked from the tray, dock menu or jump list. */
  ShellNavigate = 'shell:navigate',
  /** Main → renderer: do not disturb was switched from the tray. */
  ShellSetDnd = 'shell:setDnd',
  /** Renderer → main: the interface is on screen, so the splash can go. */
  AppReady = 'app:ready',
  /** Renderer → main: serve this backup on the local network for pairing. */
  SyncStart = 'sync:start',
  /** Renderer → main: close the pairing session now. */
  SyncStop = 'sync:stop',
  /** Main → renderer: pairing started, stopped or expired. */
  SyncState = 'sync:state',
  /** Main → renderer: a backup arrived from the paired device. */
  SyncIncoming = 'sync:incoming',
  AiCoach = 'ai:coach',
  AiGrammar = 'ai:grammar',
  AiOcr = 'ai:ocrVision',
  AiPassage = 'ai:passage',
  /** A batch of motivational quotes, fetched on the app's behalf. */
  Quotes = 'quotes:batch',
}

// The AI channels are exposed both over IPC (desktop) and HTTP (web/dev).
export type AiChannel =
  | IpcChannel.AiCoach
  | IpcChannel.AiGrammar
  | IpcChannel.AiOcr
  | IpcChannel.AiPassage;

export const AI_CHANNELS: readonly AiChannel[] = [
  IpcChannel.AiCoach,
  IpcChannel.AiGrammar,
  IpcChannel.AiOcr,
  IpcChannel.AiPassage,
];

/**
 * Everything the backend serves, AI or not.
 *
 * The dispatch underneath — the preload allowlist, the renderer transport, the
 * Vite middleware and the Electron handlers — was never actually specific to
 * AI; it is "work the renderer cannot do itself, done in a trusted process".
 * Quotes need exactly that and nothing else: the quote API sends no
 * `Access-Control-Allow-Origin` header, so a fetch from the page is blocked by
 * CORS on the web and the request has to be made somewhere that is not a
 * browsing context. Hence a backend channel rather than a `fetch` in an adapter.
 *
 * `AiChannel` stays as it is so the AI callers keep saying what they mean.
 */
export type BackendChannel = AiChannel | IpcChannel.Quotes;

export const BACKEND_CHANNELS: readonly BackendChannel[] = [...AI_CHANNELS, IpcChannel.Quotes];

// Web/dev HTTP route for each AI channel (Vite exposes these same channels).
export const AI_HTTP_ROUTE: Record<AiChannel, string> = {
  [IpcChannel.AiCoach]: '/api/coach/analyze',
  [IpcChannel.AiGrammar]: '/api/grammar/check',
  [IpcChannel.AiOcr]: '/api/ocr/vision',
  [IpcChannel.AiPassage]: '/api/passage/generate',
};

/** The same, for every backend channel. */
export const BACKEND_HTTP_ROUTE: Record<BackendChannel, string> = {
  ...AI_HTTP_ROUTE,
  [IpcChannel.Quotes]: '/api/quotes/batch',
};
