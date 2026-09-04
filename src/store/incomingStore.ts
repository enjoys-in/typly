import { create } from 'zustand';
import type { OpenedFile } from '@/platform/ports';
import type { Challenge } from '@/core/share/challenge';

/**
 * Things the OS handed to Typly, waiting for the page that consumes them.
 *
 * A file arrives from "Open with…", a double-clicked .txt or a drop on the dock
 * icon; the shell listener lives in the app shell but the file is consumed by
 * the New Test page, so it waits here in between — taken once, so a later visit
 * doesn't re-import it.
 *
 * A challenge is the same idea with a longer life: it has to survive the setup
 * page and the whole run so the result page can show the head-to-head, which is
 * the only reason the file was opened.
 */
interface IncomingState {
  file: OpenedFile | null;
  setFile: (file: OpenedFile) => void;
  takeFile: () => OpenedFile | null;
  /** The challenge this run is answering, if it is answering one. */
  challenge: Challenge | null;
  setChallenge: (challenge: Challenge | null) => void;
  clearChallenge: () => void;
}

export const useIncomingStore = create<IncomingState>((set, get) => ({
  file: null,
  setFile: (file) => set({ file }),
  takeFile: () => {
    const file = get().file;
    if (file) set({ file: null });
    return file;
  },
  challenge: null,
  setChallenge: (challenge) => set({ challenge }),
  clearChallenge: () => set({ challenge: null }),
}));
