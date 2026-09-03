// Populate public/tesseract with the local OCR assets so Tesseract can run
// offline: worker + wasm cores copied from node_modules, and one traineddata
// file per supported language, downloaded once from the tessdata CDN. Re-run any time; it skips
// files that already exist. Absent assets simply fall back to the CDN at runtime.
import { mkdir, copyFile, access, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', 'tesseract');
const TESSDATA = path.join(OUT, 'tessdata');
const CORE_DIR = path.join(ROOT, 'node_modules', 'tesseract.js-core');
const WORKER = path.join(ROOT, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js');
// Keep in step with the Lang enum in src/core/constants.ts — the values there
// are these Tesseract codes.
const LANGS = ['eng', 'hin', 'mar', 'ben', 'tam', 'guj'];
const TESSDATA_CDN = 'https://tessdata.projectnaptha.com/4.0.0';

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  await mkdir(TESSDATA, { recursive: true });

  await copyFile(WORKER, path.join(OUT, 'worker.min.js'));
  const coreFiles = (await readdir(CORE_DIR)).filter(
    (f) => f.endsWith('.wasm') || f.endsWith('.wasm.js'),
  );
  for (const f of coreFiles) await copyFile(path.join(CORE_DIR, f), path.join(OUT, f));
  console.log(`copied worker + ${coreFiles.length} core files`);

  for (const lang of LANGS) {
    const dest = path.join(TESSDATA, `${lang}.traineddata.gz`);
    if (await exists(dest)) {
      console.log(`skip ${lang} (exists)`);
      continue;
    }
    console.log(`download ${lang}…`);
    await download(`${TESSDATA_CDN}/${lang}.traineddata.gz`, dest);
  }
  console.log('OCR assets ready in public/tesseract');
}

main().catch((err) => {
  console.error('OCR asset setup failed:', err.message);
  process.exit(1);
});
