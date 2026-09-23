import { describe, expect, test } from 'bun:test';
import { act } from 'react';
import { CountIn } from './CountIn';
import { flush, mount } from '@/test/render';
import { useSettingsStore } from '@/store/settingsStore';

describe('CountIn', () => {
  test('opens on the number it was given, with the instruction', async () => {
    const view = await mount(<CountIn seconds={3} onDone={() => {}} />);
    expect(view.text()).toContain('3');
    expect(view.text()).toContain('Put your fingers on the keyboard');
    expect(view.text()).toContain('Get ready');
    await view.unmount();
  });

  test('counts down a second at a time and hands over at zero, once', async () => {
    let done = 0;
    const view = await mount(<CountIn seconds={2} onDone={() => (done += 1)} />);
    expect(view.text()).toContain('2');
    expect(done).toBe(0);

    await flush(1_050);
    expect(view.text()).toContain('1');
    expect(done).toBe(0);

    await flush(1_050);
    expect(done).toBe(1);

    // Nothing further: the clock is started exactly once.
    await flush(1_050);
    expect(done).toBe(1);
    await view.unmount();
  });

  test('the skip button starts the run without waiting', async () => {
    let done = 0;
    const view = await mount(<CountIn seconds={3} onDone={() => (done += 1)} />);
    const button = view.container.querySelector('button');
    expect(button?.textContent).toContain('Start now');
    await act(async () => {
      button?.click();
    });
    expect(done).toBe(1);
    await view.unmount();
  });

  test('a run left alone never ticks past zero', async () => {
    const view = await mount(<CountIn seconds={1} onDone={() => {}} />);
    await flush(3_000);
    expect(view.text()).not.toContain('-1');
    expect(view.text()).toContain('0');
    await view.unmount();
  });

  test('the instruction is in the interface language', async () => {
    const previous = useSettingsStore.getState().uiLang;
    await act(async () => {
      useSettingsStore.getState().setUiLang('hi');
    });
    const view = await mount(<CountIn seconds={3} onDone={() => {}} />);
    expect(view.text()).toContain('अपनी उँगलियाँ कीबोर्ड पर रखें');
    await view.unmount();
    await act(async () => {
      useSettingsStore.getState().setUiLang(previous);
    });
  });
});
