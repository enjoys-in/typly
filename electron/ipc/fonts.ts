import { app, ipcMain } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { IpcChannel } from '../../src/core/ipc/channels';

// On-disk cache of uploaded Hindi fonts, kept in the app's userData dir so they
// survive offline and outside the SQLite store. Keyed by font slot id.
function dir(): string {
  return path.join(app.getPath('userData'), 'fonts');
}
function indexPath(): string {
  return path.join(dir(), 'index.json');
}

interface Entry {
  file: string;
  mime: string;
}

async function readIndex(): Promise<Record<string, Entry>> {
  try {
    return JSON.parse(await fs.readFile(indexPath(), 'utf8')) as Record<string, Entry>;
  } catch {
    return {};
  }
}

function parseDataUrl(dataUrl: string): { mime: string; bytes: Buffer } | null {
  const match = /^data:([^;]*);base64,(.*)$/s.exec(dataUrl);
  if (!match) return null;
  return { mime: match[1] || 'font/ttf', bytes: Buffer.from(match[2]!, 'base64') };
}

export function registerFontIpc(): void {
  // Persist one slot's font bytes to disk.
  ipcMain.handle(IpcChannel.FontsWrite, async (_e, slot: string, dataUrl: string) => {
    const parsed = parseDataUrl(dataUrl);
    if (!parsed) throw new Error('Invalid font data URL');
    await fs.mkdir(dir(), { recursive: true });
    const ext = parsed.mime.includes('otf') ? 'otf' : 'ttf';
    const file = `${slot}.${ext}`;
    await fs.writeFile(path.join(dir(), file), parsed.bytes);
    const index = await readIndex();
    index[slot] = { file, mime: parsed.mime };
    await fs.writeFile(indexPath(), JSON.stringify(index));
  });

  // Return every cached slot as a data URL for re-registration in the renderer.
  ipcMain.handle(IpcChannel.FontsRead, async () => {
    const index = await readIndex();
    const out: Record<string, string> = {};
    await Promise.all(
      Object.entries(index).map(async ([slot, entry]) => {
        try {
          const bytes = await fs.readFile(path.join(dir(), entry.file));
          out[slot] = `data:${entry.mime};base64,${bytes.toString('base64')}`;
        } catch {
          // Missing file: skip.
        }
      }),
    );
    return out;
  });
}
