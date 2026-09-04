import { useMemo } from 'react';
import type { Mistake } from '@/core/types';
import { mistakeTaxonomy } from '@/core/analysis/taxonomy';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n/en';

interface Props {
  mistakes: Mistake[];
}

/**
 * *How* the mistakes were made, not just what they were.
 *
 * The mistake list already says which words went wrong. This says whether they
 * were transposed, doubled, dropped, substituted or shifted — and each of those
 * has a different cure, which is what turns "practice more" into an instruction
 * somebody can follow tomorrow morning.
 */
export function MistakeTaxonomy({ mistakes }: Props) {
  const t = useT();
  const kinds = useMemo(() => mistakeTaxonomy(mistakes), [mistakes]);

  if (kinds.length === 0) return null;
  const worst = kinds[0]!;

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-semibold">{t('taxonomy.title')}</h2>
        <p className="mt-0.5 text-sm text-fg-muted">
          {t('taxonomy.verdict', {
            kind: t(`mistakeKind.${worst.kind}` as TKey),
            share: worst.share,
          })}
        </p>
      </div>

      <ul className="space-y-3">
        {kinds.map((kind) => (
          <li key={kind.kind} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{t(`mistakeKind.${kind.kind}` as TKey)}</span>
              <span className="shrink-0 tabular-nums text-fg-muted">
                {kind.count} · {kind.share}%
              </span>
            </div>
            <span className="block h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
              <span
                className="block h-full rounded-full bg-accent"
                style={{ width: `${kind.share}%` }}
              />
            </span>
            <p className="text-xs text-fg-muted">{t(`mistakeFix.${kind.kind}` as TKey)}</p>
            {kind.examples.length > 0 && (
              <p className="font-mono text-[11px] text-fg-subtle">
                {kind.examples
                  .map((example) => `${example.expected} → ${example.typed}`)
                  .join('   ')}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
