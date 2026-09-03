import type { OpenedFile, Shell } from '../ports';

const noop = () => {};

/**
 * The web has no tray, dock or file associations. Every call is inert so the UI
 * can publish status and listen for opened files unconditionally.
 */
export class BrowserShell implements Shell {
  available(): boolean {
    return false;
  }
  takeOpenedFile(): Promise<OpenedFile | null> {
    return Promise.resolve(null);
  }
  onOpenFile(): () => void {
    return noop;
  }
  onNavigate(): () => void {
    return noop;
  }
  setStatus(): void {}
  setProgress(): void {}
}
