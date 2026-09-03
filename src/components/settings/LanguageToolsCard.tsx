import { SpellCheck } from 'lucide-react';
import { useLanguageToolsStore } from '@/store/languageToolsStore';
import {
  GRAMMAR_MODE_LABEL,
  GrammarMode,
  SPELL_ENGINE_LABEL,
  SpellEngine,
} from '@/core/constants';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

const GRAMMAR_HINT: Record<GrammarMode, string> = {
  [GrammarMode.Off]: 'No grammar checking.',
  [GrammarMode.Offline]: 'Runs fully on-device — private and works offline. English only.',
  [GrammarMode.Ai]: 'Uses your AI coach provider — needs a network + key, and supports Hindi.',
};

const SPELL_HINT: Record<SpellEngine, string> = {
  [SpellEngine.Off]: 'No spell checking.',
  [SpellEngine.Builtin]: 'Hunspell dictionaries via nspell — accurate, offline, lowest memory.',
  [SpellEngine.SymSpell]: 'On-demand fuzzy matching — good for noisy OCR text, uses more memory.',
};

// Lets the user choose which language-tool modules run: grammar mode (on-device
// vs AI) and, as a sub-option, which spell checker flags passage typos.
export function LanguageToolsCard() {
  const t = useT();
  const { grammarMode, spellEngine, setGrammarMode, setSpellEngine } = useLanguageToolsStore();

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-2">
        <SpellCheck size={18} className="text-accent-text" />
        <h2 className="font-semibold">{t('tools.title')}</h2>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t('tools.grammar')}</span>
        <select
          value={grammarMode}
          onChange={(e) => setGrammarMode(e.target.value as GrammarMode)}
          className="select"
        >
          {Object.values(GrammarMode).map((m) => (
            <option key={m} value={m}>
              {GRAMMAR_MODE_LABEL[m]}
            </option>
          ))}
        </select>
        <span className="text-xs text-fg-muted">{GRAMMAR_HINT[grammarMode]}</span>
      </label>

      {/* Sub-option: which spell checker feeds the passage cleanup step. */}
      <label className="flex flex-col gap-2 border-t border-edge pt-5">
        <span className="text-sm font-medium">{t('tools.spell')}</span>
        <select
          value={spellEngine}
          onChange={(e) => setSpellEngine(e.target.value as SpellEngine)}
          className="select"
        >
          {Object.values(SpellEngine).map((s) => (
            <option key={s} value={s}>
              {SPELL_ENGINE_LABEL[s]}
            </option>
          ))}
        </select>
        <span className="text-xs text-fg-muted">{SPELL_HINT[spellEngine]}</span>
      </label>

      <p className="text-xs text-fg-muted">
        Spelling and grammar are kept separate from your typing accuracy — they only flag issues in
        the passage.
      </p>
    </Card>
  );
}
