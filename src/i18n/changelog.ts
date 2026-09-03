import type { TKey } from './en';

/**
 * What changed, and when.
 *
 * The lines themselves are dictionary keys rather than English strings, so the
 * compiler holds the release notes to the same translation rule as the rest of
 * the interface: a change cannot be listed here without its Hindi wording.
 *
 * Newest release first. Keep each line to what a user would notice.
 */

export interface Release {
  /** Matches the version in package.json. */
  version: string;
  /** ISO date (YYYY-MM-DD) the release was cut. */
  date: string;
  items: readonly TKey[];
}

export const RELEASES: readonly Release[] = [
  {
    version: '0.3.0',
    date: '2026-09-04',
    items: [
      'changelog.deviceSync',
      'changelog.splash',
      'changelog.trayReminder',
      'changelog.loginItem',
      'changelog.icons',
      'changelog.whatsNew',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-09-04',
    items: [
      'changelog.hindi',
      'changelog.paperMode',
      'changelog.examDay',
      'changelog.profile',
      'changelog.splitter',
      'changelog.lessons',
      'changelog.drills',
      'changelog.timestamps',
      'changelog.accessibility',
      'changelog.openWith',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-08-26',
    items: [
      'changelog.firstRelease',
      'changelog.examScoring',
      'changelog.mistakes',
      'changelog.replay',
      'changelog.offline',
    ],
  },
];

/** Stored instead of a version when the user asks not to be told again. */
export const CHANGELOG_DISMISSED = 'off';

/** Numeric compare of dotted versions; a missing part counts as zero. */
export function compareVersions(a: string, b: string): number {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
}

/**
 * Whether to open the panel unprompted.
 *
 * There has to be something newer than the release the user last acknowledged,
 * and they must not have asked to stop being told. A first run is the exception:
 * nothing is "new" to someone who has never used the app, and they already get
 * the onboarding tour — two panels over one dashboard is one too many. Their
 * current version is recorded silently instead, so the *next* release is what
 * gets announced.
 */
export function shouldShowChangelog(
  seen: string | null,
  current: string,
  returning: boolean,
): boolean {
  if (seen === CHANGELOG_DISMISSED) return false;
  if (!seen) return returning;
  return compareVersions(seen, current) < 0;
}

/** Releases worth showing — never one numbered above the running build. */
export function releasesFor(current: string): Release[] {
  return RELEASES.filter((release) => compareVersions(release.version, current) <= 0);
}
