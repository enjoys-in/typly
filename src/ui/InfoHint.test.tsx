import { describe, expect, test } from 'bun:test';
import { act } from 'react';
import { InfoHint } from './InfoHint';
import { mount } from '@/test/render';

const TEXT = 'The cut lands at the nearest sentence end.';

function tooltip(container: HTMLElement) {
  return container.querySelector('[role="tooltip"]');
}

async function press(key: string) {
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });
}

describe('InfoHint', () => {
  test('is only a button until it is asked', async () => {
    const view = await mount(<InfoHint text={TEXT} />);
    expect(view.container.querySelector('button')).not.toBeNull();
    expect(tooltip(view.container)).toBeNull();
    expect(view.text()).not.toContain(TEXT);
    await view.unmount();
  });

  test('names what it explains, so its button is not just "i"', async () => {
    const view = await mount(<InfoHint text={TEXT} subject="Passage length" />);
    expect(view.container.querySelector('button')?.getAttribute('aria-label')).toBe(
      'What is this? Passage length',
    );
    await view.unmount();
  });

  test('falls back to a generic name with no subject', async () => {
    const view = await mount(<InfoHint text={TEXT} />);
    expect(view.container.querySelector('button')?.getAttribute('aria-label')).toBe(
      'What is this?',
    );
    await view.unmount();
  });

  // The phone case: there is no hover, so a tap has to pin the bubble open.
  test('a tap opens it and a second tap closes it', async () => {
    const view = await mount(<InfoHint text={TEXT} />);
    const button = view.container.querySelector('button')!;

    await act(async () => {
      button.click();
    });
    expect(tooltip(view.container)?.textContent).toBe(TEXT);

    await act(async () => {
      button.click();
    });
    expect(tooltip(view.container)).toBeNull();
    await view.unmount();
  });

  test('an open bubble is wired to its button for a screen reader', async () => {
    const view = await mount(<InfoHint text={TEXT} subject="Passage length" />);
    const button = view.container.querySelector('button')!;
    expect(button.getAttribute('aria-describedby')).toBeNull();

    await act(async () => {
      button.click();
    });
    const described = button.getAttribute('aria-describedby');
    expect(described).not.toBeNull();
    expect(tooltip(view.container)?.getAttribute('id')).toBe(described);
    await view.unmount();
  });

  test('Escape closes a pinned bubble', async () => {
    const view = await mount(<InfoHint text={TEXT} />);
    await act(async () => {
      view.container.querySelector('button')!.click();
    });
    expect(tooltip(view.container)).not.toBeNull();

    await press('Escape');
    expect(tooltip(view.container)).toBeNull();
    await view.unmount();
  });

  test('another key does not', async () => {
    const view = await mount(<InfoHint text={TEXT} />);
    await act(async () => {
      view.container.querySelector('button')!.click();
    });
    await press('a');
    expect(tooltip(view.container)).not.toBeNull();
    await view.unmount();
  });

  test('pressing anywhere else closes it', async () => {
    const view = await mount(<InfoHint text={TEXT} />);
    await act(async () => {
      view.container.querySelector('button')!.click();
    });
    expect(tooltip(view.container)).not.toBeNull();

    await act(async () => {
      document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    });
    expect(tooltip(view.container)).toBeNull();
    await view.unmount();
  });

  test('pressing inside it does not', async () => {
    const view = await mount(<InfoHint text={TEXT} />);
    await act(async () => {
      view.container.querySelector('button')!.click();
    });
    await act(async () => {
      tooltip(view.container)!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    });
    expect(tooltip(view.container)).not.toBeNull();
    await view.unmount();
  });

  test('the bubble carries the explanation it was given, in full', async () => {
    const long = 'A'.repeat(400);
    const view = await mount(<InfoHint text={long} />);
    await act(async () => {
      view.container.querySelector('button')!.click();
    });
    expect(tooltip(view.container)?.textContent).toBe(long);
    await view.unmount();
  });
});
