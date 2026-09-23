import { describe, expect, test } from 'bun:test';
import type { Repository } from '@/platform/ports';
import { drillBase, examBase, hydrateSettings, useSettingsStore } from './settingsStore';

/** Just the two methods the settings row needs, standing in for the repo. */
function fakeRepo(stored: Record<string, string> = {}) {
  const writes: Record<string, string> = {};
  const repo = {
    getSetting: async (key: string) => stored[key] ?? null,
    setSetting: async (key: string, value: string) => {
      writes[key] = value;
    },
  } as unknown as Repository;
  return { repo, writes };
}

describe('the count-in preference', () => {
  test('is on by default', () => {
    expect(useSettingsStore.getState().countIn).toBe(true);
  });

  test('can be switched off and back on', () => {
    const { setCountIn } = useSettingsStore.getState();
    setCountIn(false);
    expect(useSettingsStore.getState().countIn).toBe(false);
    setCountIn(true);
    expect(useSettingsStore.getState().countIn).toBe(true);
  });

  // It is a preference about the app, not a property of one exam, so it must
  // not travel in the per-run config the way `briefing` and `readingSec` do.
  test('is not part of a run’s own config', () => {
    const state = useSettingsStore.getState();
    expect('countIn' in examBase(state)).toBe(false);
    expect('countIn' in drillBase(state)).toBe(false);
  });
});

describe('hydration', () => {
  test('a stored preference survives the round trip, and junk in the row does not', async () => {
    const { repo, writes } = fakeRepo({
      userSettings: JSON.stringify({
        countIn: false,
        dailyGoal: 9,
        // Wrong types and unknown keys: a hand-edited or stale row must not be
        // able to put either into the store.
        briefing: 'nonsense',
        nonsense: true,
      }),
    });

    await hydrateSettings(repo);
    const state = useSettingsStore.getState();

    expect(state.countIn).toBe(false);
    expect(state.dailyGoal).toBe(9);
    expect(state.briefing).toBe(true);
    expect('nonsense' in state).toBe(false);

    // And changes made afterwards are written back to the same row.
    useSettingsStore.getState().setCountIn(true);
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(JSON.parse(writes.userSettings!).countIn).toBe(true);
  });
});
