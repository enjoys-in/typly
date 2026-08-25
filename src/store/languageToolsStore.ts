import { create } from 'zustand';
import { GrammarMode, SpellEngine } from '@/core/constants';

// User's choice of which language-tool modules to use. Persists locally so the
// selection sticks across sessions (same pattern as the AI settings store).
const STORAGE_KEY = 'typly.langtools.settings';

interface Persisted {
  grammarMode: GrammarMode;
  spellEngine: SpellEngine;
}

const DEFAULTS: Persisted = {
  grammarMode: GrammarMode.Offline,
  spellEngine: SpellEngine.Builtin,
};

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Persisted>) };
  } catch {
    return DEFAULTS;
  }
}

function persist(value: Persisted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore quota/availability errors — the choice simply won't persist.
  }
}

interface LanguageToolsState extends Persisted {
  setGrammarMode: (grammarMode: GrammarMode) => void;
  setSpellEngine: (spellEngine: SpellEngine) => void;
}

export const useLanguageToolsStore = create<LanguageToolsState>((set, get) => ({
  ...load(),
  setGrammarMode: (grammarMode) => {
    persist({ grammarMode, spellEngine: get().spellEngine });
    set({ grammarMode });
  },
  setSpellEngine: (spellEngine) => {
    persist({ grammarMode: get().grammarMode, spellEngine });
    set({ spellEngine });
  },
}));
