import { stripEmoji } from '../text/ocrCleanup';

/** What the app knows about the person using it. Stored on the local account. */
export interface Profile {
  /** Required — the app greets by it and prints it on certificates. */
  name: string;
  /** Optional. Present means the extras below are unlocked. */
  email?: string;
}

export const MAX_NAME_LENGTH = 40;
export const MIN_NAME_LENGTH = 2;

/** Trim, collapse runs of spaces, drop emoji, and cap the length. */
export function normalizeName(raw: string): string {
  return stripEmoji(raw).replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

export function isValidName(raw: string): boolean {
  return normalizeName(raw).length >= MIN_NAME_LENGTH;
}

/** What to greet someone by: the first word of their name. */
export function firstName(name: string): string {
  return normalizeName(name).split(' ')[0] ?? '';
}

/** Initial for the avatar tile. */
export function initialOf(name: string): string {
  return firstName(name).charAt(0).toUpperCase();
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Deliberately permissive: an address the user can only mistype, never lose. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(raw: string): boolean {
  return EMAIL_RE.test(normalizeEmail(raw));
}

/** True when the field is either empty (allowed) or a valid address. */
export function isAcceptableEmail(raw: string): boolean {
  return raw.trim() === '' || isValidEmail(raw);
}

/**
 * Extras an email address unlocks. Nothing is sent anywhere — the address is
 * the user telling us who they are, and these are the features that only make
 * sense for someone who has.
 */
export interface ProfileFeatures {
  /** Sessions longer than the guest cap. */
  longSessions: boolean;
  /** Saving the certificate as an image. */
  certificateDownload: boolean;
  /** Exporting the progress report. */
  progressExport: boolean;
}

const LOCKED: ProfileFeatures = {
  longSessions: false,
  certificateDownload: false,
  progressExport: false,
};

const UNLOCKED: ProfileFeatures = {
  longSessions: true,
  certificateDownload: true,
  progressExport: true,
};

/**
 * Structural on purpose: core stays independent of the Account type in the
 * platform layer, and any caller with an email field can ask.
 */
export function featuresFor(holder: { email?: string } | null | undefined): ProfileFeatures {
  return holder?.email ? UNLOCKED : LOCKED;
}
