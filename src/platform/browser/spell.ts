import type { SpellChecker } from '../ports';
import { SpellEngine } from '@/core/constants';
import { useLanguageToolsStore } from '@/store/languageToolsStore';
import { NspellSpellChecker } from './nspell';
import { SymSpellSpellChecker } from './symspell';

// Dispatches to whichever spell engine the user picked in Settings. Both engines
// load their dictionary lazily and degrade gracefully when none is bundled.
export class BrowserSpellChecker implements SpellChecker {
  private nspell = new NspellSpellChecker();
  private symspell = new SymSpellSpellChecker();

  private engine(): SpellChecker | null {
    switch (useLanguageToolsStore.getState().spellEngine) {
      case SpellEngine.Builtin:
        return this.nspell;
      case SpellEngine.SymSpell:
        return this.symspell;
      case SpellEngine.Off:
        return null;
      default:
        return null;
    }
  }

  async ready(): Promise<boolean> {
    const engine = this.engine();
    return engine ? engine.ready() : false;
  }

  check(word: string): boolean {
    const engine = this.engine();
    return engine ? engine.check(word) : true;
  }

  suggest(word: string): string[] {
    const engine = this.engine();
    return engine ? engine.suggest(word) : [];
  }
}
