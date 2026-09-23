/**
 * Mount a component into a real (Happy-DOM) document, and take it down again.
 *
 * Deliberately thin: no testing-library, because the alternative was one more
 * dependency for `textContent` and `querySelector`.
 */
import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

export interface Mounted {
  container: HTMLElement;
  text: () => string;
  /** Re-render, run effects, and flush whatever they queued. */
  update: (element: ReactElement) => Promise<void>;
  unmount: () => Promise<void>;
}

export async function mount(element: ReactElement): Promise<Mounted> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root!: Root;
  await act(async () => {
    root = createRoot(container);
    root.render(element);
  });
  return {
    container,
    text: () => container.textContent ?? '',
    update: async (next) => {
      await act(async () => {
        root.render(next);
      });
    },
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    },
  };
}

/** Let queued timers and microtasks run inside act(), then settle. */
export async function flush(ms = 0): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}
