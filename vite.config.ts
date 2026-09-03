import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { aiBackendPlugin } from './server/vite';
import pkg from './package.json' with { type: 'json' };

export default defineConfig(({ mode }) => {
  // Server-side fallback key; NEVER exposed to the client (no VITE_ prefix).
  const env = loadEnv(mode, process.cwd(), '');
  const fallbackKey = env.NVIDIA_API_KEY ?? '';

  return {
    // Relative base so the same build loads from a web root and from file:// (Electron).
    base: './',
    plugins: [react(), tailwindcss(), aiBackendPlugin(fallbackKey)],
    // Version string for the About panel, so it can never drift from the manifest.
    define: { __APP_VERSION__: JSON.stringify(pkg.version) },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // Optional legacy Dexie addon pulled in dynamically by @enjoys/react-api; unused.
        'dexie-observable': fileURLToPath(new URL('./src/stubs/empty.ts', import.meta.url)),
        // mnemonist declares only a `require` condition for its subpaths, which
        // the browser build cannot resolve — point at the file directly.
        'mnemonist/symspell': fileURLToPath(
          new URL('./node_modules/mnemonist/symspell.js', import.meta.url),
        ),
      },
    },
    // pdfjs and tesseract ship large wasm/worker assets; keep them external-friendly.
    worker: { format: 'es' },
  };
});
