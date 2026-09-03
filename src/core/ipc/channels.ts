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
  AiCoach = 'ai:coach',
  AiGrammar = 'ai:grammar',
  AiOcr = 'ai:ocrVision',
}

// The AI channels are exposed both over IPC (desktop) and HTTP (web/dev).
export type AiChannel = IpcChannel.AiCoach | IpcChannel.AiGrammar | IpcChannel.AiOcr;

export const AI_CHANNELS: readonly AiChannel[] = [
  IpcChannel.AiCoach,
  IpcChannel.AiGrammar,
  IpcChannel.AiOcr,
];

// Web/dev HTTP route for each AI channel (Vite exposes these same channels).
export const AI_HTTP_ROUTE: Record<AiChannel, string> = {
  [IpcChannel.AiCoach]: '/api/coach/analyze',
  [IpcChannel.AiGrammar]: '/api/grammar/check',
  [IpcChannel.AiOcr]: '/api/ocr/vision',
};
