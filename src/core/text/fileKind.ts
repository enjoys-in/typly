import { SourceType } from '../constants';

/**
 * Which extraction pipeline a file needs, decided from its name (and MIME type
 * when the browser supplies one). Shared by the drop zone, the "Open with
 * Typly" handler and the desktop file associations, so all three accept exactly
 * the same set of files.
 */

/** Plain-text extensions read straight as UTF-8 — no extraction step. */
export const TEXT_EXTENSIONS = ['.txt', '.text', '.md', '.markdown', '.log', '.csv'] as const;

/** Everything the app can turn into a passage, by extension. */
export const OPENABLE_EXTENSIONS = [...TEXT_EXTENSIONS, '.pdf', '.docx'] as const;

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot < 0 ? '' : name.slice(dot).toLowerCase();
}

/** The pipeline for a file, or null when the file is not something we read. */
export function sourceForFile(name: string, mime = ''): SourceType | null {
  if (mime.startsWith('image/')) return SourceType.Image;
  const ext = extensionOf(name);
  if (mime === 'application/pdf' || ext === '.pdf') return SourceType.Pdf;
  if (ext === '.docx') return SourceType.Docx;
  if (mime === 'text/plain' || (TEXT_EXTENSIONS as readonly string[]).includes(ext)) {
    return SourceType.Text;
  }
  // A text MIME type we don't have an extension for (text/markdown, text/csv…).
  return mime.startsWith('text/') ? SourceType.Text : null;
}

/** True for files the desktop app registers itself as an opener for. */
export function isOpenableFile(name: string): boolean {
  return (OPENABLE_EXTENSIONS as readonly string[]).includes(extensionOf(name));
}
