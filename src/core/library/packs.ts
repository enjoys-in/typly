/**
 * Bundled passage packs — an hour of typing that is also an hour of reading
 * what you need.
 *
 * Typly's users are not only preparing for a typing test. They are
 * simultaneously preparing for a general-knowledge paper, a reasoning paper and
 * often a descriptive one. Practising on "the quick brown fox" wastes that
 * overlap entirely, whereas practising on polity, economy, an editorial or a
 * real office-memorandum format means the hour counts twice.
 *
 * Bundled per release rather than fetched: the whole app is offline-first, and
 * a pack that needs a network is a pack half the users never see. The imports
 * are lazy, so a pack's text only loads on the run that imports it.
 */

import type { DocumentInput } from '../types';
import { Lang, SourceType } from '../constants';
import { cleanText } from '../text/ocrCleanup';

export type PackId = 'polity' | 'economy' | 'editorial' | 'letter' | 'polityHi';

export interface PassagePack {
  id: PackId;
  /** Library title the imported paragraph gets. */
  title: string;
  lang: Lang;
  /** What this pack is for, in one line. */
  blurb: string;
  /** The exam paper it doubles as revision for, or null for format practice. */
  subject: string | null;
  load: () => Promise<string>;
}

/**
 * `?raw` imports are resolved by the bundler at build time, so each entry has
 * to name its file literally — a computed path would leave the text out of the
 * bundle and the pack would silently fail to import.
 */
export const PACKS: PassagePack[] = [
  {
    id: 'polity',
    title: 'GK · Indian Polity',
    lang: Lang.En,
    blurb: 'The Constitution, Parliament and the constitutional bodies.',
    subject: 'General Studies',
    load: async () => (await import('../../assets/packs/gk-polity.txt?raw')).default,
  },
  {
    id: 'economy',
    title: 'GK · Indian Economy',
    lang: Lang.En,
    blurb: 'The RBI, GST, financial inclusion and how GDP is measured.',
    subject: 'General Studies',
    load: async () => (await import('../../assets/packs/gk-economy.txt?raw')).default,
  },
  {
    id: 'editorial',
    title: 'Editorial · Skills and recruitment',
    lang: Lang.En,
    blurb: 'Long sentences and abstract argument — editorial pace.',
    subject: 'Comprehension',
    load: async () => (await import('../../assets/packs/editorial.txt?raw')).default,
  },
  {
    id: 'letter',
    title: 'Format · Office memorandum',
    lang: Lang.En,
    blurb: 'Numbers, abbreviations and the government letter format itself.',
    subject: null,
    load: async () => (await import('../../assets/packs/official-letter.txt?raw')).default,
  },
  {
    id: 'polityHi',
    title: 'सामान्य ज्ञान · भारतीय राज्यव्यवस्था',
    lang: Lang.Hi,
    blurb: 'संविधान, संसद और संवैधानिक निकाय — हिंदी टाइपिंग के लिए।',
    subject: 'General Studies',
    load: async () => (await import('../../assets/packs/gk-polity-hi.txt?raw')).default,
  },
];

export function packFor(id: PackId): PassagePack | null {
  return PACKS.find((pack) => pack.id === id) ?? null;
}

/** A pack as a library document, cleaned the same way an import would be. */
export async function packDocument(pack: PassagePack): Promise<DocumentInput> {
  const raw = await pack.load();
  return {
    title: pack.title,
    lang: pack.lang,
    sourceType: SourceType.Text,
    content: cleanText(raw, pack.lang),
  };
}

/** Which packs have already been imported, read back from the settings row. */
export function parseSeeded(raw: string | null): Set<PackId> {
  if (!raw) return new Set();
  try {
    const value = JSON.parse(raw);
    return new Set(Array.isArray(value) ? (value as PackId[]) : []);
  } catch {
    return new Set();
  }
}

export function encodeSeeded(ids: Set<PackId>): string {
  return JSON.stringify([...ids]);
}
