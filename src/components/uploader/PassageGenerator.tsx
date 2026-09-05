import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle, Sparkles, TriangleAlert, Wand2 } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { currentAiSettings, useAiSettingsStore } from '@/store/aiSettingsStore';
import { LANG_LABEL, PASSAGE_BANDS, PassageBand, SourceType, type Lang } from '@/core/constants';
import { rateDifficulty } from '@/core/text/difficulty';
import { DifficultyBadge } from '@/components/library/DifficultyBadge';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n/en';

/** Offered lengths, in words: a warm-up, a standard skill test, a long paper. */
const LENGTHS = [80, 200, 350] as const;

interface Props {
  lang: Lang;
  onText: (text: string, source: SourceType) => void;
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; text: string; onTarget: boolean; attempts: number }
  | { status: 'error'; message: string };

/**
 * Practice prose to order.
 *
 * The app can already say how hard a passage is to type; this is the other
 * direction. A candidate who needs harder material had to go and find some,
 * and what they found was rated only after the fact.
 *
 * The result is rated here, in the renderer, from the text that actually
 * arrived — never from a number the backend claimed. If the generator missed
 * the band it is told so plainly rather than quietly relabelled, because a
 * passage that says "hard" and types like a postcard is worse than no passage.
 */
export function PassageGenerator({ lang, onText }: Props) {
  const t = useT();
  const { passageWriter } = usePlatform();
  const ai = useAiSettingsStore();
  const [band, setBand] = useState<PassageBand>(PassageBand.Moderate);
  const [words, setWords] = useState<number>(200);
  const [topic, setTopic] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });

  if (!passageWriter.available()) return null;

  const bandOptions: SegmentedOption<PassageBand>[] = PASSAGE_BANDS.map((b) => ({
    value: b,
    label: t(`passageBand.${b}` as TKey),
  }));
  const lengthOptions: SegmentedOption<number>[] = LENGTHS.map((n) => ({
    value: n,
    label: t('generate.words', { count: n }),
  }));

  async function generate() {
    setState({ status: 'loading' });
    try {
      const result = await passageWriter.generate(
        { band, words, language: LANG_LABEL[lang], ...(topic.trim() ? { topic } : {}) },
        currentAiSettings(ai),
      );
      setState({
        status: 'done',
        text: result.text,
        onTarget: result.onTarget,
        attempts: result.attempts,
      });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : t('generate.failed'),
      });
    }
  }

  // Measured from the delivered text, so the badge cannot disagree with it.
  const measured = state.status === 'done' ? rateDifficulty(state.text) : null;

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Wand2 size={18} className="shrink-0 text-accent-text" />
        <h2 className="font-semibold">{t('generate.title')}</h2>
      </div>
      <p className="text-sm text-fg-muted">{t('generate.hint')}</p>

      <div className="space-y-3">
        <Row label={t('generate.difficulty')}>
          <Segmented
            options={bandOptions}
            value={band}
            onChange={setBand}
            ariaLabel={t('generate.difficulty')}
          />
        </Row>
        <Row label={t('generate.length')}>
          <Segmented
            options={lengthOptions}
            value={words}
            onChange={setWords}
            ariaLabel={t('generate.length')}
          />
        </Row>
        <Row label={t('generate.topic')}>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('generate.topicPlaceholder')}
            maxLength={200}
            className="select w-full"
          />
        </Row>
      </div>

      {state.status === 'done' && measured ? (
        <div className="space-y-3 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10.5px] font-semibold tracking-[0.09em] text-fg-muted uppercase">
              {t('generate.measured')}
            </span>
            <DifficultyBadge difficulty={measured} />
            {!state.onTarget && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] font-semibold text-warn-soft-fg">
                <TriangleAlert size={11} />
                {t('generate.offTarget', { band: t(`passageBand.${band}` as TKey) })}
              </span>
            )}
          </div>
          <p className="scroll-area max-h-32 rounded-panel bg-surface-2 p-3 font-mono text-[13px] leading-relaxed ring-1 ring-line ring-inset">
            {state.text}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onText(state.text, SourceType.Text)}>
              {t('generate.use')}
            </Button>
            <Button variant="secondary" onClick={() => void generate()}>
              <Sparkles size={15} /> {t('generate.again')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <Button onClick={() => void generate()} disabled={state.status === 'loading'}>
            {state.status === 'loading' ? (
              <>
                <LoaderCircle size={15} className="animate-spin" /> {t('generate.working')}
              </>
            ) : (
              <>
                <Sparkles size={15} /> {t('generate.action')}
              </>
            )}
          </Button>
          {state.status === 'error' && (
            <p className="text-sm text-danger-text">{state.message}</p>
          )}
        </div>
      )}

      <p className="text-xs text-fg-subtle">
        {t('generate.privacy')}{' '}
        <Link to="/app/settings" className="font-medium text-accent-text hover:underline">
          {t('coach.settingsLink')}
        </Link>
      </p>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fg-muted">{label}</span>
      {children}
    </div>
  );
}
