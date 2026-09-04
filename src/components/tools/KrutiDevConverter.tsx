import { useMemo, useState } from 'react';
import { ArrowRightLeft, Check, Copy, Eraser } from 'lucide-react';
import { convert, guessDirection, type ConvertDirection } from '@/core/text/krutidev';
import { HindiFont } from '@/core/constants';
import { FONT_FAMILY } from '@/ui/fonts';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { useFlash } from '@/hooks/useFlash';
import { useT } from '@/i18n';

/**
 * Kruti Dev ⇄ Unicode, offline.
 *
 * Every Hindi typist needs this conversion sooner or later, and today they
 * google it and paste their text into whichever advert-covered site comes up
 * first — which is both unpleasant and a privacy problem for anyone converting
 * an official document. Shipping it is small (the mapping already exists for
 * the Remington layout) and it is a real reason to keep the app installed.
 */
export function KrutiDevConverter() {
  const t = useT();
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<ConvertDirection>('toUnicode');
  const [copied, flashCopied] = useFlash(1200);

  const output = useMemo(() => convert(input, direction), [input, direction]);

  const options: SegmentedOption<ConvertDirection>[] = [
    { value: 'toUnicode', label: t('krutidev.toUnicode') },
    { value: 'toKrutiDev', label: t('krutidev.toKrutiDev') },
  ];

  async function copy() {
    if (!output) return;
    await navigator.clipboard?.writeText(output).catch(() => {});
    flashCopied();
  }

  /**
   * Legacy text has to be *shown* in the legacy font or it looks like
   * gibberish. Unicode renders in the ordinary UI font.
   */
  const fontFor = (side: 'in' | 'out') => {
    const legacy = side === 'in' ? direction === 'toUnicode' : direction === 'toKrutiDev';
    return legacy ? FONT_FAMILY[HindiFont.KrutiDev] : undefined;
  };

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-semibold">{t('krutidev.title')}</h2>
        <p className="mt-0.5 text-sm text-fg-muted">{t('krutidev.hint')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          options={options}
          value={direction}
          onChange={setDirection}
          ariaLabel={t('krutidev.directionAria')}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setDirection(guessDirection(input))}
          disabled={!input}
          title={t('krutidev.detectHint')}
        >
          <ArrowRightLeft size={14} /> {t('krutidev.detect')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setInput('')} disabled={!input}>
          <Eraser size={14} /> {t('krutidev.clear')}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium tracking-wide text-fg-muted uppercase">
            {t('krutidev.input')}
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={t(
              direction === 'toUnicode' ? 'krutidev.placeholderLegacy' : 'krutidev.placeholderUnicode',
            )}
            style={{ fontFamily: fontFor('in') }}
            className="scroll-area h-56 w-full resize-none rounded-control border border-edge bg-field p-3 text-sm outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent-ring"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium tracking-wide text-fg-muted uppercase">
              {t('krutidev.output')}
            </span>
            <Button variant="ghost" size="sm" onClick={() => void copy()} disabled={!output}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {t(copied ? 'krutidev.copied' : 'krutidev.copy')}
            </Button>
          </div>
          <output
            style={{ fontFamily: fontFor('out') }}
            className="scroll-area h-56 w-full overflow-auto rounded-control border border-line bg-surface-2 p-3 text-sm whitespace-pre-wrap"
          >
            {output || <span className="text-fg-subtle">{t('krutidev.outputEmpty')}</span>}
          </output>
        </div>
      </div>

      <p className="text-xs text-fg-muted">{t('krutidev.coverage')}</p>
    </Card>
  );
}
