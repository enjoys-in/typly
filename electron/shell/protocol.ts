import { protocol, net } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// A privileged, fetch-capable scheme so the packaged renderer loads like a real
// origin (not file://). This lets fetch()/WASM work — including offline OCR from
// bundled assets under dist/tesseract — which Chromium blocks over file://.
export const APP_SCHEME = 'app';
const HOST = 'bundle';

// Must be called before the app 'ready' event.
export function registerAppSchemePrivileges(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_SCHEME,
      privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
    },
  ]);
}

// Serves files from the built renderer directory over app://bundle/…
export function registerAppProtocol(distDir: string): void {
  const root = path.resolve(distDir);
  protocol.handle(APP_SCHEME, (request) => {
    const rel = decodeURIComponent(new URL(request.url).pathname).replace(/^\/+/, '');
    const filePath = path.resolve(root, rel || 'index.html');
    // Contain within the bundle — no path traversal.
    if (filePath !== root && !filePath.startsWith(root + path.sep)) {
      return new Response('Forbidden', { status: 403 });
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

export function appUrl(file = 'index.html'): string {
  return `${APP_SCHEME}://${HOST}/${file}`;
}
