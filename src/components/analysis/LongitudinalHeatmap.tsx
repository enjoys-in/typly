import { TrendingDown, TrendingUp } from 'lucide-react';
import type { LongitudinalKeys } from '@/core/analysis/longitudinal';
import { KeyHeatmap } from '@/components/trainer/KeyHeatmap';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

interface Props {
  data: LongitudinalKeys;
}

/**
 * The heatmap over thirty days rather than one session.
 *
 * A per-session heatmap answers "what went wrong just now", which the mistake
 * list already answers better. What it can never answer is whether a weak key
 * is *healing* — and that is the only question worth asking about a key you
 * have been drilling for a fortnight. Comparing the window against the one
 * before it is what makes the answer possible.
 */
export function LongitudinalHeatmap({ data }: Props) {
  const t = useT();

  if (data.runs === 0) {
    return (
      <Card className="space-y-1">
        <h2 className="font-semibold">{t('longitudinal.title', { days: data.days })}</h2>
        <p className="text-sm text-fg-muted">{t('longitudinal.empty', { days: data.days })}</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-semibold">{t('longitudinal.title', { days: data.days })}</h2>
        <p className="mt-0.5 text-sm text-fg-muted">
          {t('longitudinal.subtitle', { runs: data.runs, days: data.days })}
        </p>
      </div>

      <KeyHeatmap
        values={data.values}
        max={data.max}
        tone="error"
        describe={(value) => t('longitudinal.keyErrors', { count: value })}
        emptyLabel={t('longitudinal.noErrors')}
      />

      {(data.healing.length > 0 || data.worsening.length > 0) && (
        <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
          <TrendList
            icon={TrendingDown}
            tone="text-accent-text"
            title={t('longitudinal.healing')}
            hint={t('longitudinal.healingHint')}
            keys={data.healing}
            empty={t('longitudinal.noneHealing')}
          />
          <TrendList
            icon={TrendingUp}
            tone="text-danger-text"
            title={t('longitudinal.worsening')}
            hint={t('longitudinal.worseningHint')}
            keys={data.worsening}
            empty={t('longitudinal.noneWorsening')}
          />
        </div>
      )}
    </Card>
  );
}

function TrendList({
  icon: Icon,
  tone,
  title,
  hint,
  keys,
  empty,
}: {
  icon: typeof TrendingUp;
  tone: string;
  title: string;
  hint: string;
  keys: LongitudinalKeys['healing'];
  empty: string;
}) {
  return (
    <div className="space-y-2">
      <p className={`flex items-center gap-1.5 text-sm font-semibold ${tone}`}>
        <Icon size={14} className="shrink-0" />
        {title}
      </p>
      {keys.length === 0 ? (
        <p className="text-xs text-fg-muted">{empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {keys.map((key) => (
            <li
              key={key.key}
              title={`${key.previous} → ${key.recent}`}
              className="flex items-center gap-1 rounded-inner bg-surface-2 px-2 py-1 font-mono text-xs"
            >
              <span className="font-bold">{key.key === ' ' ? '␣' : key.key}</span>
              <span className={`tabular-nums ${tone}`}>
                {key.delta > 0 ? `+${key.delta}` : key.delta}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-fg-subtle">{hint}</p>
    </div>
  );
}
