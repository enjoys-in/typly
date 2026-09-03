import { create } from 'zustand';

/**
 * Whether the app's own furniture — sidebar, page padding — is on screen.
 *
 * Exam-day mode hides it for the duration of a run, and the run is rendered
 * several levels below the shell that owns it, so the request travels through
 * here rather than as props threaded down the tree.
 */
interface ChromeState {
  /** True while a screen has asked to be shown on its own. */
  bare: boolean;
  setBare: (bare: boolean) => void;
}

export const useChromeStore = create<ChromeState>((set) => ({
  bare: false,
  setBare: (bare) => set({ bare }),
}));
