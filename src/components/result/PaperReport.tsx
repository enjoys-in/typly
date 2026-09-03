import { AlertTriangle, Info, SpellCheck } from 'lucide-react';
import type { PaperResult } from '@/core/types';
import { Card } from '@/ui/Card';
import { Chip, ChipRow } from '@/components/trainer/Chips';

interface Props {
  paper: PaperResult;
}

/**
 * What a paper-mode run found. There is no passage to diff against, so the
 * mistakes are the ones the language itself can point at: words the dictionary
 * rejected, and grammar the checker flagged.
 */
export function PaperReport({ paper }: Props) {
  const { misspelled, grammar, spellChecked, typed, words } = paper;
  const clean = spellChecked && misspelled.length === 0 && grammar.length === 0;

  return (
    <>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <SpellCheck size={16} className="text-fg-subtle" /> Spelling &amp; grammar
          </h2>
          <span className="text-sm text-fg-muted tabular-nums">
            {words} words typed from your paper
          </span>
        </div>

        {!spellChecked ? (
          <p className="flex items-start gap-2 text-sm text-fg-muted">
            <Info size={15} className="mt-0.5 shrink-0" />
            No dictionary was available for this language, so spelling was not checked. Speed,
            words and corrections above are unaffected.
          </p>
        ) : clean ? (
          <p className="text-sm text-accent-text">
            Nothing flagged — every word was in the dictionary and the grammar check found no
            issues.
          </p>
        ) : (
          <div className="space-y-4">
            {misspelled.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-wide text-fg-muted uppercase">
                  Words not in the dictionary ({misspelled.length})
                </p>
                <ChipRow>
                  {misspelled.map((word) => (
                    <Chip key={word}>
                      <span className="font-mono text-danger-text">{word}</span>
                    </Chip>
                  ))}
                </ChipRow>
                <p className="text-xs text-fg-subtle">
                  Proper nouns and technical terms show up here too — the dictionary does not know
                  everything on your sheet.
                </p>
              </div>
            )}

            {grammar.length > 0 && (
              <div className="space-y-2 border-t border-line pt-4">
                <p className="text-xs font-semibold tracking-wide text-fg-muted uppercase">
                  Grammar ({grammar.length})
                </p>
                <ul className="space-y-1.5">
                  {grammar.slice(0, 12).map((issue, i) => (
                    <li key={`${issue.offset}-${i}`} className="flex items-start gap-2 text-sm">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-fg-subtle" />
                      <span className="text-fg-muted">
                        {issue.message}
                        {issue.replacements.length > 0 && (
                          <span className="text-fg-subtle">
                            {' '}
                            → <span className="font-mono">{issue.replacements[0]}</span>
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {grammar.length > 12 && (
                  <p className="text-xs text-fg-subtle">
                    …and {grammar.length - 12} more.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="space-y-2">
        <h2 className="font-semibold">What you typed</h2>
        <p className="scroll-area max-h-60 font-mono text-xs leading-relaxed whitespace-pre-wrap text-fg-muted">
          {typed}
        </p>
      </Card>
    </>
  );
}
