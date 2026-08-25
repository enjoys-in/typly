import type nspellType from 'nspell';
import type { SpellChecker } from '../ports';

// Hunspell dictionaries via nspell. Loads /dictionaries/{en.aff,en.dic} at runtime
// when present; degrades gracefully (treats every word as correct) until then.
export class NspellSpellChecker implements SpellChecker {
  private speller: ReturnType<typeof nspellType> | null = null;
  private loaded = false;

  private async load(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const [aff, dic] = await Promise.all([
        fetch(`${import.meta.env.BASE_URL}dictionaries/en.aff`).then((r) => (r.ok ? r.text() : null)),
        fetch(`${import.meta.env.BASE_URL}dictionaries/en.dic`).then((r) => (r.ok ? r.text() : null)),
      ]);
      if (aff && dic) {
        const { default: nspell } = await import('nspell');
        this.speller = nspell(aff, dic);
      }
    } catch {
      this.speller = null;
    }
  }

  async ready(): Promise<boolean> {
    await this.load();
    return this.speller !== null;
  }

  check(word: string): boolean {
    return this.speller ? this.speller.correct(word) : true;
  }

  suggest(word: string): string[] {
    return this.speller ? this.speller.suggest(word) : [];
  }
}
