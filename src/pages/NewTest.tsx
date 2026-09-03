import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TextUploader } from '@/components/uploader/TextUploader';
import { TextInfoPanel } from '@/components/uploader/TextInfoPanel';
import { NO_SPLIT, PassageSplitPanel } from '@/components/uploader/PassageSplitPanel';
import { GrammarPanel } from '@/components/grammar/GrammarPanel';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { useIncomingStore } from '@/store/incomingStore';
import { usePaperRun } from '@/hooks/usePaperRun';
import { useSettingsStore } from '@/store/settingsStore';
import { stripEmoji } from '@/core/text/ocrCleanup';
import { isLongPassage, splitTexts, suggestChunkChars } from '@/core/text/splitter';
import { startProgress } from '@/core/library/progress';
import { SourceType } from '@/core/constants';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { PaperModeCard } from '@/components/uploader/PaperModeCard';
import { SpeakButton } from '@/ui/SpeakButton';
import { useT } from '@/i18n';

function deriveTitle(text: string): string {
  const words = text.trim().split(/\s+/).slice(0, 6).join(' ');
  return words.length > 48 ? `${words.slice(0, 48)}…` : words || 'Untitled paragraph';
}

export function NewTest() {
  const t = useT();
  const navigate = useNavigate();
  const platform = usePlatform();
  const { lang } = useSettingsStore();
  const setDraft = useExamStore((s) => s.setDraft);
  const startPaperRun = usePaperRun();
  const incoming = useIncomingStore((s) => s.file);
  const takeIncoming = useIncomingStore((s) => s.takeFile);
  const [passage, setPassage] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<SourceType>(SourceType.Text);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  // 0 = run the text as one passage; otherwise the chunk size to split it into.
  const [chunkChars, setChunkChars] = useState<number>(NO_SPLIT);

  function handleText(text: string, src: SourceType) {
    setPassage(text);
    setSource(src);
    setTitle(deriveTitle(text));
    // Long imports default to being split — that is almost always what someone
    // pasting a whole chapter wants, and the toggle is right there to undo it.
    setChunkChars(isLongPassage(text) ? suggestChunkChars(text.trim().length) : NO_SPLIT);
  }

  // Back to the paste / upload step with a clean slate.
  function replaceSource() {
    setPassage('');
    setTitle('');
    setEditing(false);
    setChunkChars(NO_SPLIT);
  }

  const isEmpty = passage.trim().length === 0;
  const hasText = passage.length > 0;
  const splittable = hasText && isLongPassage(passage);
  const suggested = useMemo(() => suggestChunkChars(passage.trim().length), [passage]);
  const partCount = useMemo(
    () => (chunkChars > 0 ? splitTexts(passage, chunkChars).length : 1),
    [passage, chunkChars],
  );

  async function proceed() {
    const content = stripEmoji(passage).trim();
    const finalTitle = title.trim() || deriveTitle(content);
    // The whole text is saved as one document; the split is a view over it, so
    // the parts can be recomputed (and the progress kept) at any time.
    const parts = chunkChars > 0 ? splitTexts(content, chunkChars) : [];
    setSaving(true);
    const documentId = await platform.repo
      .saveDocument({ title: finalTitle, lang, sourceType: source, content })
      .catch(() => null);
    // Record the split so the Library and the Dashboard can resume it later.
    if (documentId != null && parts.length > 1) {
      await startProgress(
        (key) => platform.repo.getSetting(key),
        (key, value) => platform.repo.setSetting(key, value),
        documentId,
        chunkChars,
        parts.length,
      ).catch(() => {});
    }
    setSaving(false);
    setDraft({
      passage: parts.length > 1 ? parts[0]! : content,
      title: finalTitle,
      documentId,
      sourceType: source,
      lang,
      split: parts.length > 1 ? { chunkChars, parts, startIndex: 0 } : null,
    });
    navigate('/app/setup');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('newTest.title')}</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {t(hasText ? 'newTest.subtitleReady' : 'newTest.subtitleEmpty')}
        </p>
      </div>

      {/* One step at a time: the uploader is replaced by the detected-text summary,
          so the continue action stays above the fold instead of below a dropzone. */}
      {!hasText ? (
        <>
          <Card>
            <TextUploader
              lang={lang}
              onText={handleText}
              incoming={incoming}
              onIncomingTaken={takeIncoming}
            />
          </Card>
          {/* No passage needed: the text is on paper in front of the typist. */}
          <PaperModeCard onStart={startPaperRun} />
        </>
      ) : (
        <Card className="space-y-5">
          <TextInfoPanel text={passage} source={source} onReplace={replaceSource} />

          <div className="space-y-2 border-t border-line pt-5">
            <label className="text-sm font-medium text-fg-muted">
              {t('newTest.paragraphName')}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('newTest.paragraphTitle')}
              className="w-full max-w-xl rounded-control border border-edge bg-field px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent-ring"
            />
          </div>

          {/* Collapsed by default — the numbers above are the point, the raw text
              is only needed when something needs correcting. */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing((e) => !e)}
                className="flex cursor-pointer items-center gap-1.5 rounded-control text-sm font-medium text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-4 focus-visible:ring-edge"
              >
                {editing ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {t(editing ? 'newTest.hideText' : 'newTest.showText')}
              </button>
              <SpeakButton text={passage} lang={lang} label={t('newTest.listen')} />
            </div>
            {editing ? (
              <textarea
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
                className="scroll-area h-40 w-full resize-none rounded-control border border-edge bg-field p-3 font-mono text-sm outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent-ring"
              />
            ) : (
              <p className="line-clamp-2 font-mono text-xs leading-relaxed text-fg-muted">
                {passage}
              </p>
            )}
          </div>
          {splittable && (
            <PassageSplitPanel
              text={passage}
              chunkChars={chunkChars}
              onChange={setChunkChars}
              suggested={suggested}
            />
          )}

          <GrammarPanel text={passage} lang={lang} onApply={setPassage} />
          <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
            <span className="text-xs text-danger-text">
              {isEmpty ? t('newTest.required') : ''}
            </span>
            <Button disabled={isEmpty || saving} onClick={proceed}>
              {saving
                ? t('newTest.saving')
                : partCount > 1
                  ? t('newTest.saveSplit', { count: partCount })
                  : t('newTest.saveContinue')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
