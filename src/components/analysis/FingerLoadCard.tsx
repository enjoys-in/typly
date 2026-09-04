import { useMemo } from 'react';
import { Hand } from 'lucide-react';
import type { Keystroke } from '@/core/types';
import { fingerLoad } from '@/core/analysis/fingerLoad';
import { FINGER_DOT } from '@/components/exam/fingerStyles';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n/en';

interface Props {
  keystrokes: Keystroke[];
}

/** Hand imbalance beyond this many points is worth naming. */
const IMBALANCE = 15;

/**
 * What each finger actually did — presses, travel and errors.
 *
 * A plateau at 35 WPM is usually mechanical: a pinky doing the ring finger's
 * work, or a right hand carrying 60% of the load. `weakKeys` counts characters
 * and so cannot see it, and no amount of "practice more" fixes it. Travel is in
 * key widths, which is unit-free but proportional — the comparison between
 * fingers is the whole point, not the absolute distance.
 */
export function FingerLoadCard({ keystrokes }: Props) {
  const t = useT();
  const load = useMemo(() => fingerLoad(keystrokes), [keystrokes]);

  if (load.totalPresses === 0) return null;

  const skew = Math.abs(load.leftShare - load.rightShare);
  const heavier = load.leftShare > load.rightShare ? 'left' : 'right';
  const busiest = Math.max(...load.fingers.map((f) => f.presses), 1);

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <Hand size={16} className="shrink-0 text-fg-subtle" />
          {t('fingers.title')}
        </h2>
        <p className="mt-0.5 text-sm text-fg-muted">
          {load.overloaded
            ? t('fingers.verdictOverload', {
                finger: t(`finger.${load.overloaded.finger}` as TKey),
                hand: t(`hand.${load.overloaded.hand}` as TKey),
                share: load.overloaded.share,
              })
            : skew >= IMBALANCE
              ? t('fingers.verdictSkew', {
                  hand: t(`hand.${heavier}` as TKey),
                  share: heavier === 'left' ? load.leftShare : load.rightShare,
                })
              : t('fingers.verdictBalanced')}
        </p>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="w-16 shrink-0 text-fg-muted">{t('hand.left')}</span>
        <span className="flex h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
          <span className="block h-full bg-accent" style={{ width: `${load.leftShare}%` }} />
          <span className="block h-full bg-fg-subtle" style={{ width: `${load.rightShare}%` }} />
        </span>
        <span className="w-16 shrink-0 text-right text-fg-muted">{t('hand.right')}</span>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[11px] tracking-wide text-fg-muted uppercase">
            <th className="pb-2 font-medium">{t('fingers.finger')}</th>
            <th className="pb-2 text-right font-medium">{t('fingers.presses')}</th>
            <th className="pb-2 text-right font-medium">{t('fingers.travel')}</th>
            <th className="pb-2 text-right font-medium">{t('fingers.errorRate')}</th>
          </tr>
        </thead>
        <tbody>
          {load.fingers.map((finger) => (
            <tr key={`${finger.hand}-${finger.finger}`} className="border-t border-line">
              <td className="py-1.5">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={`h-2 w-2 shrink-0 rounded-full ${FINGER_DOT[finger.finger]}`}
                  />
                  <span className="truncate">
                    {t(`hand.${finger.hand}` as TKey)} {t(`finger.${finger.finger}` as TKey)}
                  </span>
                </span>
              </td>
              <td className="py-1.5 text-right tabular-nums">
                <span className="flex items-center justify-end gap-2">
                  <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-surface-3 sm:block">
                    <span
                      className="block h-full rounded-full bg-accent"
                      style={{ width: `${(finger.presses / busiest) * 100}%` }}
                    />
                  </span>
                  {finger.share}%
                </span>
              </td>
              <td className="py-1.5 text-right tabular-nums text-fg-muted">{finger.travel}</td>
              <td
                className={`py-1.5 text-right tabular-nums ${
                  finger.errorRate > 5 ? 'text-danger-text' : 'text-fg-muted'
                }`}
              >
                {finger.errorRate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-fg-muted">{t('fingers.travelNote')}</p>
    </Card>
  );
}
