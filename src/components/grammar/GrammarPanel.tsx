import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, LoaderCircle, SpellCheck } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useLanguageToolsStore } from '@/store/languageToolsStore';
import { spellIssues } from '@/core/text/spell';
import { GRAMMAR_MODE_LABEL, GrammarMode, Lang, SpellEngine } from '@/core/constants';
import type { GrammarIssue } from '@/core/types';
import { Button } from '@/ui/Button';
import { useT } from '@/i18n';

type Status = 'idle' | 'checking' | 'done' | 'error';

// On-demand grammar (Harper) + spelling check for the passage in the New Test
// preview. Runs only when asked so Harper's WASM is fetched lazily, not on load.
export function GrammarPanel({
  text,
  lang,
  onApply,
}: {
  text: string;
  lang: Lang;
  onApply: (next: string) => void;
}) {
  const t = useT();
  const platform = usePlatform();
  const grammarMode = useLanguageToolsStore((s) => s.grammarMode);
  const spellEngine = useLanguageToolsStore((s) => s.spellEngine);
  const [issues, setIssues] = useState<GrammarIssue[] | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const runId = useRef(0);

  const grammarOff = grammarMode === GrammarMode.Off;
  const spellOff = spellEngine === SpellEngine.Off;
  const aiMode = grammarMode === GrammarMode.Ai;
  // On-device grammar (Harper) + the spelling dictionaries are English-only;
  // AI grammar (Mode 2) also handles Hindi.
  const englishOnly = lang !== Lang.En;
  const grammarUsable = !grammarOff && (aiMode || !englishOnly);
  const spellUsable = !spellOff && !englishOnly;
  const canCheck = (grammarUsable || spellUsable) && text.trim().length > 0;

  // The text changing (OCR finishing, an edit, or an applied fix) invalidates the
  // previous offsets — drop stale issues and cancel any in-flight run's result.
  useEffect(() => {
    runId.current++;
    setIssues(null);
    setStatus('idle');
    setErrorMsg('');
  }, [text]);

  const run = useCallback(async () => {
    const id = ++runId.current;
    setStatus('checking');
    setErrorMsg('');
    try {
      const canGrammar =
        grammarMode !== GrammarMode.Off && (grammarMode === GrammarMode.Ai || lang === Lang.En);
      const grammar = canGrammar ? await platform.grammar.check(text, lang) : [];
      let spelling: GrammarIssue[] = [];
      if (spellEngine !== SpellEngine.Off && lang === Lang.En && (await platform.spell.ready())) {
        spelling = spellIssues(text, platform.spell);
      }
      if (id !== runId.current) return; // superseded by a newer run or a text change
      setIssues(merge(grammar, spelling));
      setStatus('done');
    } catch (e) {
      if (id === runId.current) {
        setErrorMsg(e instanceof Error ? e.message : 'Couldn’t run the check.');
        setStatus('error');
      }
    }
  }, [platform, text, lang, grammarMode, spellEngine]);

  function apply(issue: GrammarIssue, replacement: string) {
    // onApply changes `text`, which clears issues via the effect above.
    onApply(text.slice(0, issue.offset) + replacement + text.slice(issue.offset + issue.length));
  }

  return (
    <div className="space-y-3 border-t border-line pt-5">
      <div className="flex flex-wrap items-center gap-2">
        <SpellCheck size={16} className="text-accent-text" />
        <h3 className="text-sm font-semibold">{t('grammar.title')}</h3>
        <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-fg-muted">
          {grammarOff ? 'Grammar off' : GRAMMAR_MODE_LABEL[grammarMode]}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="ml-auto"
          onClick={() => void run()}
          disabled={status === 'checking' || !canCheck}
        >
          {status === 'checking' ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <SpellCheck size={14} />
          )}
          {status === 'checking' ? 'Checking…' : 'Check now'}
        </Button>
      </div>

      {englishOnly && (
        <p className="text-xs text-fg-muted">
          {aiMode
            ? 'AI grammar checks this passage; spelling suggestions remain English-only.'
            : 'On-device grammar & spelling are English-only. Switch grammar to Mode 2 (AI) in Settings to check this passage.'}
        </p>
      )}

      {status === 'checking' && !aiMode && (
        <p className="text-xs text-fg-muted">
          {t('grammar.firstRun')}
        </p>
      )}

      {status === 'error' && (
        <p className="flex items-center gap-1.5 text-sm text-danger-text">
          <AlertTriangle size={15} /> {errorMsg || 'Couldn’t run the check. Please try again.'}
        </p>
      )}

      {status === 'done' &&
        issues !== null &&
        (issues.length === 0 ? (
          <p className="flex items-center gap-1.5 text-sm text-accent-text">
            <Check size={15} /> {t('grammar.noIssues')}
          </p>
        ) : (
          <ul className="space-y-2">
            {issues.map((issue, i) => (
              <li
                key={`${issue.offset}-${i}`}
                className="rounded-control border border-line p-3 text-sm"
              >
                <p className="text-fg">{issue.message}</p>
                <p className="mt-1 font-mono text-xs text-fg-muted">
                  “{text.slice(issue.offset, issue.offset + issue.length)}”
                </p>
                {issue.replacements.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {issue.replacements.map((rep) => (
                      <button
                        key={rep}
                        onClick={() => apply(issue, rep)}
                        className="rounded-inner bg-accent-soft px-2 py-1 text-xs font-medium text-accent-soft-fg transition-colors hover:bg-accent hover:text-accent-fg"
                      >
                        {rep}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}

// Drop spelling issues that overlap a grammar issue, then order by position.
function merge(grammar: GrammarIssue[], spelling: GrammarIssue[]): GrammarIssue[] {
  const filtered = spelling.filter(
    (s) => !grammar.some((g) => s.offset < g.offset + g.length && g.offset < s.offset + s.length),
  );
  return [...grammar, ...filtered].sort((a, b) => a.offset - b.offset);
}
