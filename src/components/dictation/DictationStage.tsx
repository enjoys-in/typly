import { Ear, Pause, Play, Repeat, SkipForward, VolumeX } from 'lucide-react';
import type { DictationSpec } from '@/core/types';
import { useDictation } from '@/hooks/useDictation';
import type { Lang } from '@/core/constants';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ProgressBar } from '@/ui/ProgressBar';
import { useT } from '@/i18n';

interface Props {
  passage: string;
  spec: DictationSpec;
  lang: Lang;
  /** Move on to the transcription, whether the dictation finished or was skipped. */
  onDone: () => void;
}

/**
 * The dictation phase of a Stenographer skill test.
 *
 * The passage is *not* on screen — that is the entire point, and it is why this
 * cannot be a variant of the reading banner. What is on screen is the pace, the
 * progress and the controls a real dictation offers: play, pause, and repeat
 * the last chunk. The transcription starts only once this is over.
 */
export function DictationStage({ passage, spec, lang, onDone }: Props) {
  const t = useT();
  const dictation = useDictation(passage, spec.wpm, lang);

  if (dictation.unsupported) {
    return (
      <Card className="mx-auto max-w-2xl space-y-4">
        <header className="flex items-center gap-2">
          <VolumeX size={18} className="shrink-0 text-danger-text" />
          <h1 className="text-lg font-bold">{t('dictation.unsupportedTitle')}</h1>
        </header>
        <p className="text-sm text-fg-muted">{t('dictation.unsupportedBody')}</p>
        <div className="flex justify-end">
          <Button onClick={onDone}>{t('dictation.skipToTyping')}</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">
          {t('dictation.heading')}
        </p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Ear size={22} className="shrink-0 text-accent-text" />
          {t('dictation.title', { wpm: spec.wpm })}
        </h1>
        <p className="text-sm text-fg-muted">
          {t('dictation.subtitle', {
            wpm: spec.wpm,
            minutes: spec.transcriptionMinutes,
          })}
        </p>
      </header>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium tracking-wide text-fg-muted uppercase">
            {t('dictation.progress')}
          </span>
          <span className="tabular-nums text-fg-subtle">
            {t('dictation.chunkOf', {
              current: dictation.spoken,
              total: dictation.plan.chunks.length,
            })}
          </span>
        </div>
        <ProgressBar value={dictation.progress} />
        <p className="text-[11px] text-fg-subtle">
          {t('dictation.words', { words: dictation.plan.words })}
        </p>
      </div>

      {/* Nothing of the passage is shown — only that something is being said,
          so the typist knows the voice is working without being able to read
          ahead, which is exactly the condition the real test creates. */}
      <div className="flex min-h-24 items-center justify-center rounded-panel border border-line bg-surface-2 px-6 py-5 text-center">
        <p className="text-sm text-fg-muted">
          {dictation.finished
            ? t('dictation.finished')
            : dictation.playing
              ? t('dictation.listening')
              : t('dictation.ready')}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {dictation.playing ? (
            <Button variant="secondary" onClick={dictation.pause}>
              <Pause size={16} /> {t('dictation.pause')}
            </Button>
          ) : (
            <Button onClick={dictation.start} disabled={dictation.finished}>
              <Play size={16} /> {t(dictation.spoken > 0 ? 'dictation.resume' : 'dictation.start')}
            </Button>
          )}
          <Button variant="secondary" onClick={dictation.repeat} disabled={dictation.spoken === 0}>
            <Repeat size={16} /> {t('dictation.repeat')}
          </Button>
        </div>
        <Button
          variant={dictation.finished ? 'primary' : 'ghost'}
          onClick={() => {
            dictation.stop();
            onDone();
          }}
        >
          <SkipForward size={16} />
          {t(dictation.finished ? 'dictation.beginTranscription' : 'dictation.skip')}
        </Button>
      </div>
    </Card>
  );
}
