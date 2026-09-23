import { useMemo, useState } from 'react';
import { Printer, Search } from 'lucide-react';
import { InputMethod, Lang } from '@/core/constants';
import { KEY_ROWS, shiftedChar, type Finger } from '@/core/keyboard/layout';
import { isMethodAvailable, keymapFor } from '@/core/text/keymaps';
import { FINGER_BG, FINGER_DOT, FINGER_LABEL } from '@/components/exam/fingerStyles';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { useT } from '@/i18n';

/** The layouts a chart can be drawn for — the two with a key table. */
const METHODS = [InputMethod.InScript, InputMethod.Remington].filter(isMethodAvailable);

/**
 * The chart that is otherwise a photocopy.
 *
 * Neither InScript nor Remington is printed on any keyboard sold in India, so
 * learning one means keeping a chart beside the machine — and the ones in
 * circulation are scans of scans, or images on a site that wants an account.
 * The app already holds both layouts in full, because it types with them; this
 * is that data drawn.
 *
 * Both layers, which is the part the in-exam keyboard cannot show: it labels
 * each key with its unshifted face only, and half the alphabet — every aspirated
 * consonant and every conjunct key — lives behind Shift.
 */
export function LayoutChart() {
  const t = useT();
  const [method, setMethod] = useState<InputMethod>(METHODS[0] ?? InputMethod.InScript);
  const [find, setFind] = useState('');
  const keymap = keymapFor(method, Lang.Hi);

  const options: SegmentedOption<InputMethod>[] = METHODS.map((m) => ({
    value: m,
    label: m === InputMethod.InScript ? 'InScript' : 'Remington',
  }));

  /**
   * The key the searched letter is on.
   *
   * Looked up through the layout's own reverse index — the same one the exam
   * keyboard highlights with — so it answers for a conjunct key as readily as
   * for a plain consonant. Only the last character of the box is used: someone
   * pasting a whole word wants the letter they are stuck on, and typing into a
   * Devanagari field produces sequences, not single letters.
   */
  const found = useMemo(() => {
    const ch = [...find.trim()].pop();
    if (!ch || !keymap) return null;
    const keyId = keymap.keyForOutput(ch);
    if (keyId) {
      const key = KEY_ROWS.flat().find((k) => k.id === keyId);
      return { ch, keyId, finger: key?.finger ?? null, sequence: null };
    }
    // No key of its own. On a typewriter layout that is the normal case for
    // twelve consonants, and the answer is the two keys that build it.
    return { ch, keyId: '', finger: null as Finger | null, sequence: keymap.sequenceFor(ch) };
  }, [find, keymap]);

  if (!keymap) return null;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{t('layout.title')}</h2>
          <p className="mt-0.5 text-sm text-fg-muted">{t('layout.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Segmented
            options={options}
            value={method}
            onChange={setMethod}
            ariaLabel={t('layout.pickAria')}
          />
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Printer size={15} /> {t('layout.print')}
          </Button>
        </div>
      </div>

      {/* Find a letter: the question a learner actually has, which is "where is
          this one", not "what is on this key". */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <label className="flex items-center gap-2">
          <Search size={15} className="shrink-0 text-fg-subtle" />
          <span className="text-sm font-medium text-fg-muted">{t('layout.findLabel')}</span>
          <input
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder={t('layout.findPlaceholder')}
            className="w-28 rounded-control border border-edge bg-field px-3 py-1.5 text-center text-lg outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent-ring"
          />
        </label>
        {found &&
          (found.keyId ? (
            <span className="text-sm text-fg-muted">
              {t('layout.findHit', {
                letter: found.ch,
                key: keyLabel(found.keyId),
                finger: found.finger ? t(`finger.${found.finger}`) : '',
              })}
            </span>
          ) : found.sequence ? (
            <span className="text-sm text-fg-muted">
              {t('layout.findSequence', {
                letter: found.ch,
                keys: found.sequence.map(keyLabel).join(' → '),
              })}
            </span>
          ) : (
            <span className="text-sm text-fg-subtle">
              {t('layout.findMiss', { letter: found.ch })}
            </span>
          ))}
      </div>

      <div id="layout-chart" className="rounded-panel border border-line bg-surface-2 p-3">
        <div className="mx-auto flex max-w-4xl flex-col gap-1.5 select-none">
          {KEY_ROWS.map((row, r) => (
            <div key={r} className="flex justify-center gap-1.5">
              {row.map((key) => {
                const base = keymap.resolve(key.id, '')?.text ?? '';
                const shiftKey = shiftedChar(key.id);
                const shifted = shiftKey ? (keymap.resolve(shiftKey, '')?.text ?? '') : '';
                const highlighted = found?.keyId === key.id;
                return (
                  <span
                    key={key.id}
                    style={{ flexGrow: key.width, flexBasis: 0 }}
                    title={`${key.label}${shiftKey ? ` / Shift+${key.label}` : ''}`}
                    className={`relative flex h-14 flex-col items-center justify-center rounded-inner shadow-e1 ring-1 ring-black/5 ring-inset ${
                      highlighted
                        ? 'z-10 ring-2 ring-accent bg-accent-soft text-accent-soft-fg'
                        : FINGER_BG[key.finger]
                    }`}
                  >
                    {/* The physical key, small and in the corner: it is the one
                        thing already printed on the keyboard in front of them. */}
                    <span className="absolute top-0.5 left-1 text-[9px] font-semibold opacity-55">
                      {key.label}
                    </span>
                    {/* The second layer, above the first, the way every chart
                        in circulation draws it. */}
                    {shifted && (
                      <span className="absolute top-0.5 right-1 text-[11px] leading-none opacity-80">
                        {shifted}
                      </span>
                    )}
                    <span className="mt-1.5 text-lg leading-none font-semibold">
                      {base || (key.id === ' ' ? t('layout.space') : '')}
                    </span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          {(Object.keys(FINGER_LABEL) as Finger[]).map((f) => (
            <span key={f} className="flex items-center gap-1.5 text-[11px] text-fg-muted">
              <span className={`h-2.5 w-2.5 rounded-full ${FINGER_DOT[f]}`} /> {t(`finger.${f}`)}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xs text-fg-muted">
        {t(method === InputMethod.Remington ? 'layout.remingtonNote' : 'layout.inscriptNote')}
      </p>
    </Card>
  );
}

/** A key id as it reads on a physical keyboard. */
function keyLabel(keyId: string): string {
  if (keyId === ' ') return 'Space';
  return keyId.length === 1 && keyId.toLowerCase() !== keyId.toUpperCase()
    ? keyId.toUpperCase()
    : keyId;
}
