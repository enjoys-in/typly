import { useMemo } from 'react';
import { Quote as QuoteMark, Snail } from 'lucide-react';
import { ScoringMode } from '@/core/constants';
import { Pace, type PaceVerdict } from '@/core/motivation/pace';
import { pickQuote, type Quote } from '@/core/motivation/quotes';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

interface Props {
  verdict: PaceVerdict;
  quotes: readonly Quote[];
  /** Credit the API only when the quote actually came from it. */
  credit: boolean;
  /**
   * Seeds which quote is shown. The saved run's id, so one run keeps one quote
   * across every re-render of this page and the next run gets a different one.
   */
  seed: number;
}

/** Copy per tier. Keyed off the enum so a new tier cannot forget its strings. */
const HEADING = {
  [Pace.Near]: 'motivation.headingNear',
  [Pace.Short]: 'motivation.headingShort',
  [Pace.Adrift]: 'motivation.headingAdrift',
} as const;

const FOOT = {
  [Pace.Near]: 'motivation.footNear',
  [Pace.Short]: 'motivation.footShort',
  [Pace.Adrift]: 'motivation.footAdrift',
} as const;

/**
 * The consolation prize: a quote, and a bit of ribbing, for a run that came in
 * under the board's speed floor.
 *
 * Deliberately styled *down* rather than up. The confetti it mirrors is loud
 * because a pass deserves to be; this is the opposite occasion, and a big
 * red-bordered panel telling someone they were slow would be a telling-off. So:
 * neutral surface, no danger tones, the quote given the largest type on the
 * card, and the number they missed by reduced to a quiet line underneath. The
 * joke lands on the app or on nobody — the person reading it already knows the
 * run went badly, and they came here for the number, not for a verdict on their
 * character.
 *
 * Renders nothing for `Pace.Fine`, so the results page can hand it any verdict.
 */
export function MotivationCard({ verdict, quotes, credit, seed }: Props) {
  const t = useT();
  const quote = useMemo(() => pickQuote(quotes, seed), [quotes, seed]);

  if (verdict.pace === Pace.Fine || !quote) return null;

  const unit = t(verdict.mode === ScoringMode.Kdph ? 'motivation.unitKdph' : 'motivation.unitWpm');

  return (
    <Card className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
        <Snail size={16} className="shrink-0 text-fg-subtle" />
        {t(HEADING[verdict.pace])}
      </h2>

      {/* The quote outranks everything else on the card, because it is the only
          part of it the reader did not already know. */}
      <blockquote className="relative pl-8">
        <QuoteMark
          size={18}
          aria-hidden
          className="absolute top-0.5 left-0 shrink-0 text-fg-subtle/60"
        />
        <p className="text-[15px] leading-relaxed font-medium text-balance text-fg italic">
          {quote.text}
        </p>
        {quote.author && (
          <footer className="mt-2 text-xs font-semibold tracking-[0.04em] text-fg-muted not-italic">
            — {quote.author}
          </footer>
        )}
      </blockquote>

      <div className="space-y-1 border-t border-line pt-3">
        <p className="text-xs text-fg-muted">
          {t(FOOT[verdict.pace], {
            gap: verdict.shortfall.toLocaleString(),
            unit,
            required: verdict.required.toLocaleString(),
          })}
        </p>
        {credit && <p className="text-[10px] text-fg-subtle">{t('motivation.credit')}</p>}
      </div>
    </Card>
  );
}
