import { useCallback, useEffect, useRef } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import type { Repository } from '@/platform/ports';
import type { ExamConfig, ExamSnapshot, Keystroke } from '@/core/types';
import { createSnapshot, parseSnapshot, serializeSnapshot } from '@/core/exam/snapshot';
import { SETTING_KEY, SNAPSHOT_SAVE_MS } from '@/core/constants';

/** Read the stored checkpoint, if there is a usable one. */
export async function readExamSnapshot(repo: Repository): Promise<ExamSnapshot | null> {
  return parseSnapshot(await repo.getSetting(SETTING_KEY.ExamSnapshot));
}

export async function clearExamSnapshot(repo: Repository): Promise<void> {
  await repo.setSetting(SETTING_KEY.ExamSnapshot, '');
}

interface Options {
  /** Checkpoint only while the run is live — never over a finished attempt. */
  active: boolean;
  config: ExamConfig | null;
  /** Read at save time, so ticking does not re-render the exam. */
  read: () => { typed: string; elapsedMs: number; keystrokes: Keystroke[] };
}

/**
 * Checkpoints an attempt in progress so a reload, crash or accidental close can
 * resume it instead of losing an hour of typing. Returns a `clear` to call once
 * the attempt is submitted.
 */
export function useExamSnapshot({ active, config, read }: Options): () => Promise<void> {
  const platform = usePlatform();
  const readRef = useRef(read);
  readRef.current = read;
  // Once the attempt is submitted the checkpoint is gone for good — without
  // this, the unmount flush would write the finished run straight back.
  const cleared = useRef(false);

  const clear = useCallback(() => {
    cleared.current = true;
    return clearExamSnapshot(platform.repo);
  }, [platform]);

  useEffect(() => {
    if (!active || !config) return;

    const save = () => {
      if (cleared.current) return;
      const { typed, elapsedMs, keystrokes } = readRef.current();
      if (typed.length === 0) return;
      void platform.repo
        .setSetting(
          SETTING_KEY.ExamSnapshot,
          serializeSnapshot(createSnapshot(config, typed, elapsedMs, keystrokes)),
        )
        .catch(() => {});
    };

    const id = setInterval(save, SNAPSHOT_SAVE_MS);
    // Hiding the window is the most likely moment before a kill, so save then too.
    const onHide = () => {
      if (document.visibilityState === 'hidden') save();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onHide);
      save();
    };
  }, [active, config, platform]);

  return clear;
}
