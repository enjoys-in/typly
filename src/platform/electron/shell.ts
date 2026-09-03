import type { OpenedFile, Shell } from '../ports';
import { isShellRoute, type ShellRoute, type ShellStatus } from '@/core/ipc/shell';

const noop = () => {};

/**
 * Desktop shell, over the preload bridge: receives files the OS asked Typly to
 * open, forwards tray/dock navigation into the router, and pushes the practice
 * status the tray menu and dock badge are drawn from.
 */
export class ElectronShell implements Shell {
  available(): boolean {
    return Boolean(window.bridge?.shell);
  }

  async takeOpenedFile(): Promise<OpenedFile | null> {
    const file = await window.bridge?.shell?.pendingFile();
    return file ? normalize(file) : null;
  }

  onOpenFile(handler: (file: OpenedFile) => void): () => void {
    const shell = window.bridge?.shell;
    if (!shell) return noop;
    return shell.onOpenFile((file) => handler(normalize(file)));
  }

  onNavigate(handler: (route: ShellRoute) => void): () => void {
    const shell = window.bridge?.shell;
    if (!shell) return noop;
    // The main process only ever sends allowlisted routes; re-check anyway so a
    // compromised main can't push the router at an arbitrary path.
    return shell.onNavigate((route) => {
      if (isShellRoute(route)) handler(route);
    });
  }

  onSetDnd(handler: (dnd: boolean) => void): () => void {
    const shell = window.bridge?.shell;
    if (!shell) return noop;
    return shell.onSetDnd((dnd) => handler(dnd === true));
  }

  setStatus(status: ShellStatus): void {
    window.bridge?.shell?.setStatus(status);
  }

  setProgress(fraction: number | null): void {
    window.bridge?.shell?.setProgress(fraction);
  }

  ready(): void {
    window.bridge?.shell?.ready();
  }
}

/** IPC hands back a structured clone, which may arrive as a plain ArrayBuffer. */
function normalize(file: { name: string; bytes: Uint8Array | ArrayBuffer }): OpenedFile {
  const bytes = file.bytes instanceof Uint8Array ? file.bytes : new Uint8Array(file.bytes);
  return { name: file.name, bytes };
}
