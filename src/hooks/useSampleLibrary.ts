import { useEffect } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import type { Repository } from '@/platform/ports';
import type { DocumentRow } from '@/core/types';
import { SETTING_KEY } from '@/core/constants';
import { samplePassage } from '@/core/library/samplePassage';

// Single-flight: the boot hook and any page that needs the sample share one
// seeding run, so a first load can never insert the paragraph twice.
let seeding: Promise<void> | null = null;

/**
 * Puts the demo paragraph in the library the first time an account opens the
 * app, so a fresh install can be demonstrated end to end — exam, result,
 * replay, trainer — without importing anything first.
 *
 * Runs at most once per store: the flag is set even when seeding is skipped, so
 * deleting the sample keeps it deleted.
 */
export function seedSampleLibrary(repo: Repository): Promise<void> {
  seeding ??= seedOnce(repo);
  return seeding;
}

async function seedOnce(repo: Repository): Promise<void> {
  try {
    if (await repo.getSetting(SETTING_KEY.SampleSeeded)) return;
    const existing = await repo.listDocuments();
    if (existing.length === 0) {
      const id = await repo.saveDocument(await samplePassage());
      await repo.setSetting(SETTING_KEY.SampleDocId, String(id));
    }
    await repo.setSetting(SETTING_KEY.SampleSeeded, 'true');
  } catch {
    // A failed seed is not worth blocking the app for — it retries next launch.
    seeding = null;
  }
}

/** The seeded sample, or null once the user has deleted it. */
export async function readSampleDocument(repo: Repository): Promise<DocumentRow | null> {
  const raw = await repo.getSetting(SETTING_KEY.SampleDocId);
  const id = Number(raw);
  if (!raw || !Number.isInteger(id)) return null;
  return repo.getDocument(id);
}

/** Boot hook: seeds the sample library once the account is in place. */
export function useSampleLibrary(): void {
  const platform = usePlatform();
  useEffect(() => {
    void seedSampleLibrary(platform.repo);
  }, [platform]);
}
