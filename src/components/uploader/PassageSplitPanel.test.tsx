import { describe, expect, test } from 'bun:test';
import { act } from 'react';
import { NO_SPLIT, PassageSplitPanel } from './PassageSplitPanel';
import { mount } from '@/test/render';
import { splitTexts } from '@/core/text/splitter';

const LONG = `${'This is a sentence of a decent length. '.repeat(120)}`;

function panel(chunkChars: number, onChange: (next: number) => void = () => {}) {
  return (
    <PassageSplitPanel text={LONG} chunkChars={chunkChars} onChange={onChange} suggested={1_200} />
  );
}

function toggle(container: HTMLElement) {
  return container.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
}

describe('PassageSplitPanel', () => {
  // The import arrives whole. Cutting it up is an offer, not something that
  // has already happened to it.
  test('opens switched off, as one passage', async () => {
    const view = await mount(panel(NO_SPLIT));
    expect(NO_SPLIT).toBe(0);
    expect(toggle(view.container)?.checked).toBe(false);
    // The offer is on the panel; the length picker and the part count are not
    // there at all until the offer is taken.
    expect(view.text()).toContain('split it into passages you can finish one at a time');
    expect(view.text()).not.toContain('cut at sentence ends');
    expect(view.text()).not.toContain('Passage length');
    await view.unmount();
  });

  test('switching it on asks for the suggested length, not an arbitrary one', async () => {
    const chosen: number[] = [];
    const view = await mount(panel(NO_SPLIT, (next) => chosen.push(next)));
    await act(async () => {
      toggle(view.container)!.click();
    });
    expect(chosen).toEqual([1_200]);
    await view.unmount();
  });

  test('switching it off goes back to one passage', async () => {
    const chosen: number[] = [];
    const view = await mount(panel(1_200, (next) => chosen.push(next)));
    expect(toggle(view.container)?.checked).toBe(true);
    await act(async () => {
      toggle(view.container)!.click();
    });
    expect(chosen).toEqual([NO_SPLIT]);
    await view.unmount();
  });

  test('once on, it reports the number of passages the text will make', async () => {
    const view = await mount(panel(1_200));
    const parts = splitTexts(LONG, 1_200).length;
    expect(parts).toBeGreaterThan(1);
    expect(view.text()).toContain(`${parts} passages`);
    expect(view.text()).toContain('cut at sentence ends');
    await view.unmount();
  });

  test('the explanation is behind the info button, not on the panel', async () => {
    const view = await mount(panel(NO_SPLIT));
    const hint = [...view.container.querySelectorAll('button')].find((b) =>
      b.getAttribute('aria-label')?.startsWith('What is this?'),
    );
    expect(hint).toBeDefined();
    expect(view.text()).not.toContain('the library remembers which passage you reached');

    await act(async () => {
      hint!.click();
    });
    expect(view.container.querySelector('[role="tooltip"]')?.textContent).toContain(
      'the library remembers which passage you reached',
    );
    await view.unmount();
  });
});
