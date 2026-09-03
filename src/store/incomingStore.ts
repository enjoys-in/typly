import { create } from 'zustand';
import type { OpenedFile } from '@/platform/ports';

/**
 * A file the OS handed to Typly ("Open with…", a double-clicked .txt, a drop on
 * the dock icon). The shell listener lives in the app shell, but the file is
 * consumed by the New Test page, so it waits here in between — consumed once,
 * so a later visit to New Test doesn't re-import it.
 */
interface IncomingState {
  file: OpenedFile | null;
  setFile: (file: OpenedFile) => void;
  takeFile: () => OpenedFile | null;
}

export const useIncomingStore = create<IncomingState>((set, get) => ({
  file: null,
  setFile: (file) => set({ file }),
  takeFile: () => {
    const file = get().file;
    if (file) set({ file: null });
    return file;
  },
}));
