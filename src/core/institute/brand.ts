/**
 * Institute branding for batch certificates.
 *
 * A coaching centre running twenty machines wants its own name on the
 * certificate and wants to print the whole batch at once, not one at a time
 * from twenty different result pages. That is the piece which turns a free app
 * into something a centre will pay for, and it is only a stored brand plus a
 * loop over `CertificateCard`.
 */

import type { TestRow } from '../types';
import { TestStatus } from '../constants';

export interface InstituteBrand {
  /** Institute name, printed where the app's own name would be. */
  name: string;
  /** A line under the name — city, affiliation, whatever they want. */
  subtitle: string;
  /** Logo as a data URL, so it travels inside the settings row and the backup. */
  logo: string | null;
  /** Who signs the certificate. */
  signatory: string;
  signatoryTitle: string;
}

export const EMPTY_BRAND: InstituteBrand = {
  name: '',
  subtitle: '',
  logo: null,
  signatory: '',
  signatoryTitle: '',
};

/** A logo has to fit in a settings row, so it is capped rather than resized. */
export const MAX_LOGO_BYTES = 512 * 1024;

export function brandActive(brand: InstituteBrand): boolean {
  return brand.name.trim().length > 0;
}

/** Reads a stored brand back, dropping anything malformed rather than throwing. */
export function parseBrand(raw: string | null): InstituteBrand {
  if (!raw) return EMPTY_BRAND;
  try {
    const value = JSON.parse(raw) as Partial<InstituteBrand>;
    return {
      name: str(value.name),
      subtitle: str(value.subtitle),
      logo: typeof value.logo === 'string' && value.logo.startsWith('data:') ? value.logo : null,
      signatory: str(value.signatory),
      signatoryTitle: str(value.signatoryTitle),
    };
  } catch {
    return EMPTY_BRAND;
  }
}

export function encodeBrand(brand: InstituteBrand): string {
  return JSON.stringify(brand);
}

/** One row of a batch: a candidate and the attempt being certified. */
export interface BatchEntry {
  /** Candidate name, as it will be printed. */
  name: string;
  row: TestRow;
}

/**
 * The batch a centre would actually print: each candidate's best passing
 * attempt, newest first.
 *
 * Names are not stored per attempt — Typly has one account per machine — so the
 * caller supplies them, and an attempt with no name given is labelled by its
 * date rather than dropped. A certificate with a blank name is still a
 * certificate somebody can hand-write on; a missing one is a complaint.
 */
export function buildBatch(rows: TestRow[], names: Record<number, string> = {}): BatchEntry[] {
  return rows
    .filter((row) => row.status === TestStatus.Passed && row.grossWpm > 0)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((row) => ({ name: (names[row.id] ?? '').trim(), row }));
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
