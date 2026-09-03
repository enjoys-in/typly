import { Lang, SourceType } from '../constants';
import type { DocumentInput } from '../types';
import { cleanText } from '../text/ocrCleanup';

export const SAMPLE_TITLE = 'Sample — Learning to type well';

/**
 * The demo paragraph every new account starts with, so the exam, the result
 * report and the trainer all have something real to work on before the user has
 * imported anything.
 *
 * Bundled rather than fetched: it has to be there on a first, offline run, on
 * the web and inside the desktop app alike. The import is lazy so the text only
 * loads on the one run that seeds it.
 */
export async function samplePassage(): Promise<DocumentInput> {
  const { default: raw } = await import('../../assets/sample-typing-text.txt?raw');
  return {
    title: SAMPLE_TITLE,
    lang: Lang.En,
    sourceType: SourceType.Text,
    content: cleanText(raw, Lang.En),
  };
}
