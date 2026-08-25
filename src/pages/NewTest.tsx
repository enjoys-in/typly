import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TextUploader } from '@/components/uploader/TextUploader';
import { TextInfoPanel } from '@/components/uploader/TextInfoPanel';
import { GrammarPanel } from '@/components/grammar/GrammarPanel';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import { stripEmoji } from '@/core/text/ocrCleanup';
import { SourceType } from '@/core/constants';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { SpeakButton } from '@/ui/SpeakButton';

function deriveTitle(text: string): string {
  const words = text.trim().split(/\s+/).slice(0, 6).join(' ');
  return words.length > 48 ? `${words.slice(0, 48)}…` : words || 'Untitled paragraph';
}

export function NewTest() {
  const navigate = useNavigate();
  const platform = usePlatform();
  const { lang } = useSettingsStore();
  const setDraft = useExamStore((s) => s.setDraft);
  const [passage, setPassage] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<SourceType>(SourceType.Text);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleText(text: string, src: SourceType) {
    setPassage(text);
    setSource(src);
    setTitle(deriveTitle(text));
  }

  // Back to the paste / upload step with a clean slate.
  function replaceSource() {
    setPassage('');
    setTitle('');
    setEditing(false);
  }

  const isEmpty = passage.trim().length === 0;
  const hasText = passage.length > 0;

  async function proceed() {
    const content = stripEmoji(passage).trim();
    const finalTitle = title.trim() || deriveTitle(content);
    setSaving(true);
    // Save the paragraph to the library so it can be reused / retested.
    const documentId = await platform.repo
      .saveDocument({ title: finalTitle, lang, sourceType: source, content })
      .catch(() => null);
    setSaving(false);
    setDraft({ passage: content, title: finalTitle, documentId, sourceType: source });
    navigate('/app/setup');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Test</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {hasText
            ? 'Review what was detected, then choose the exam type and language next.'
            : 'Paste or upload a paragraph, then choose the exam type and language next. Emoji are removed automatically.'}
        </p>
      </div>

      {/* One step at a time: the uploader is replaced by the detected-text summary,
          so the continue action stays above the fold instead of below a dropzone. */}
      {!hasText ? (
        <Card>
          <TextUploader lang={lang} onText={handleText} />
        </Card>
      ) : (
        <Card className="space-y-5">
          <TextInfoPanel text={passage} source={source} onReplace={replaceSource} />

          <div className="space-y-2 border-t border-line pt-5">
            <label className="text-sm font-medium text-fg-muted">
              Paragraph name
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Paragraph title"
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
                {editing ? 'Hide text' : 'Show & edit text'}
              </button>
              <SpeakButton text={passage} lang={lang} label="Listen" />
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
          <GrammarPanel text={passage} lang={lang} onApply={setPassage} />
          <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
            <span className="text-xs text-danger-text">
              {isEmpty ? 'Paragraph text is required to continue.' : ''}
            </span>
            <Button disabled={isEmpty || saving} onClick={proceed}>
              {saving ? 'Saving…' : 'Save & continue'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
