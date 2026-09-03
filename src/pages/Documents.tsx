import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  ListOrdered,
  Play,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { examBase, useSettingsStore } from '@/store/settingsStore';
import type { DocumentRow, TestRow } from '@/core/types';
import { DocumentParts } from '@/components/library/DocumentParts';
import { isLongPassage, splitTexts } from '@/core/text/splitter';
import { draftFor, planFor } from '@/core/library/parts';
import {
  clearProgress,
  percentDone,
  readProgressMap,
  startProgress,
  type PartProgress,
  type ProgressMap,
} from '@/core/library/progress';
import { LANG_LABEL, TestStatus } from '@/core/constants';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { useConfirm } from '@/ui/Confirm';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { SkeletonTable } from '@/ui/Skeleton';

type SeriesOrder = 'serial' | 'preference';

const ORDER_OPTIONS: SegmentedOption<'serial' | 'preference'>[] = [
  { value: 'serial', label: 'Serial', title: 'In the order shown' },
  { value: 'preference', label: 'Preference', title: 'Shortest first' },
];

export function Documents() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const setDraft = useExamStore((s) => s.setDraft);
  const startSeries = useExamStore((s) => s.startSeries);
  const settings = useSettingsStore();
  const [docs, setDocs] = useState<DocumentRow[] | null>(null);
  const [history, setHistory] = useState<TestRow[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  // Where the user left off in each split document, keyed by document id.
  const [progress, setProgress] = useState<ProgressMap>({});
  const [order, setOrder] = useState<SeriesOrder>('serial');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const docById = useMemo(() => new Map((docs ?? []).map((d) => [d.id, d])), [docs]);

  function toggleSelect(id: number) {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function move(id: number, dir: -1 | 1) {
    setSelectedIds((ids) => {
      const i = ids.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= ids.length) return ids;
      const next = [...ids];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  }

  useEffect(() => {
    platform.repo.listDocuments().then(setDocs);
    platform.repo.listHistory().then(setHistory);
    readProgressMap((key) => platform.repo.getSetting(key)).then(setProgress);
  }, [platform]);

  const getSetting = (key: string) => platform.repo.getSetting(key);
  const setSetting = (key: string, value: string) => platform.repo.setSetting(key, value);

  // Cut a long paragraph into parts (or re-cut it at a different length).
  async function splitDoc(doc: DocumentRow, chunkChars: number) {
    const parts = splitTexts(doc.content, chunkChars);
    if (parts.length < 2) return;
    const entry = await startProgress(getSetting, setSetting, doc.id, chunkChars, parts.length);
    setProgress((map) => ({ ...map, [String(doc.id)]: entry }));
  }

  async function resetSplit(doc: DocumentRow) {
    await clearProgress(getSetting, setSetting, doc.id);
    setProgress(({ [String(doc.id)]: _dropped, ...rest }) => rest);
  }

  // Resume a split document, from its next unfinished part or a chosen one.
  function startPart(doc: DocumentRow, index?: number) {
    const plan = planFor(doc, progress[String(doc.id)] ?? null);
    if (!plan) {
      runDocument(doc);
      return;
    }
    setDraft(draftFor(doc, { ...plan, startIndex: index ?? plan.startIndex }));
    navigate('/app/setup');
  }

  async function removeDoc(doc: DocumentRow) {
    const ok = await confirm({
      title: `Delete "${doc.title}"?`,
      message:
        'The paragraph is removed from your library. Past results keep their scores, but can no longer be retested or replayed.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    await platform.repo.deleteDocument(doc.id);
    // The split progress would otherwise outlive the paragraph it describes.
    await clearProgress(getSetting, setSetting, doc.id).catch(() => {});
    setProgress(({ [String(doc.id)]: _dropped, ...rest }) => rest);
    setDocs((rows) => (rows ?? []).filter((r) => r.id !== doc.id));
    setSelectedIds((ids) => ids.filter((id) => id !== doc.id));
    setOpenId((id) => (id === doc.id ? null : id));
  }

  const attemptsByDoc = useMemo(() => {
    const map = new Map<number, TestRow[]>();
    for (const t of history) {
      if (t.documentId == null) continue;
      const list = map.get(t.documentId) ?? [];
      list.push(t);
      map.set(t.documentId, list);
    }
    return map;
  }, [history]);

  function runDocument(doc: DocumentRow) {
    setDraft({
      passage: doc.content,
      title: doc.title,
      documentId: doc.id,
      sourceType: doc.sourceType,
      lang: doc.lang,
    });
    navigate('/app/setup');
  }

  // Queue selected paragraphs (or all if none picked) and run them with auto-advance.
  function beginSeries() {
    if (!docs || docs.length === 0) return;
    const picked =
      selectedIds.length > 0
        ? selectedIds.map((id) => docById.get(id)).filter((d): d is DocumentRow => !!d)
        : docs;
    const ordered =
      order === 'preference' ? [...picked].sort((a, b) => a.charCount - b.charCount) : picked;
    const items = ordered.map((d) => ({
      passage: d.content,
      title: d.title,
      documentId: d.id,
      sourceType: d.sourceType,
    }));
    startSeries(items, examBase(settings));
    navigate('/app/exam');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
        <p className="mt-1 text-fg-muted">
          Your saved paragraphs. Run, retest, and compare attempts on a leaderboard.
        </p>
      </div>

      {docs && docs.length > 1 && (
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <ListOrdered size={18} className="text-fg-subtle" />
              <span className="font-medium">Practice series</span>
              <span className="text-fg-muted">
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected · runs in this order, auto-advancing`
                  : `Tick paragraphs to pick, or run all ${docs.length} back-to-back.`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Segmented
                options={ORDER_OPTIONS}
                value={order}
                onChange={setOrder}
                ariaLabel="Series order"
              />
              {selectedIds.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                  Clear
                </Button>
              )}
              <Button size="sm" onClick={beginSeries}>
                <Play size={14} /> {selectedIds.length > 0 ? `Start ${selectedIds.length}` : 'Start all'}
              </Button>
            </div>
          </div>

          {selectedIds.length > 0 && order === 'serial' && (
            <ol className="flex flex-wrap gap-2">
              {selectedIds.map((id, i) => {
                const d = docById.get(id);
                if (!d) return null;
                return (
                  <li
                    key={id}
                    className="flex items-center gap-1.5 rounded-control border border-line bg-surface px-2 py-1 text-xs"
                  >
                    <span className="font-semibold text-fg-subtle">{i + 1}.</span>
                    <span className="max-w-40 truncate">{d.title}</span>
                    <button
                      onClick={() => move(id, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="rounded-inner p-0.5 text-fg-subtle enabled:hover:text-fg disabled:opacity-30"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => move(id, 1)}
                      disabled={i === selectedIds.length - 1}
                      aria-label="Move down"
                      className="rounded-inner p-0.5 text-fg-subtle enabled:hover:text-fg disabled:opacity-30"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      onClick={() => toggleSelect(id)}
                      aria-label="Remove"
                      className="rounded-inner p-0.5 text-fg-subtle hover:text-danger-text"
                    >
                      <X size={14} />
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      )}

      {docs === null ? (
        <SkeletonTable rows={6} cols={6} />
      ) : docs.length === 0 ? (
        <Card className="flex flex-col items-start gap-3">
          <FileText className="text-fg-subtle" />
          <p className="text-sm text-fg-muted">No paragraphs yet. Create one to build your library.</p>
          <Button onClick={() => navigate('/app/new')}>New Test</Button>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="scroll-area max-h-[65vh]">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <colgroup>
                <col className="w-11" />
                <col />
                <col className="w-24" />
                <col className="w-24" />
                <col className="w-20" />
                <col className="w-24" />
                <col className="w-36" />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-surface-2 text-xs uppercase tracking-wide text-fg-muted">
                <tr>
                  <th className="px-3 py-2.5"></th>
                  <th className="px-3 py-2.5 font-medium">Paragraph</th>
                  <th className="px-3 py-2.5 font-medium">Lang</th>
                  <th className="px-3 py-2.5 text-right font-medium">Chars</th>
                  <th className="px-3 py-2.5 text-right font-medium">Tries</th>
                  <th className="px-3 py-2.5 text-right font-medium">Best</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {docs.map((doc) => {
                  const attempts = attemptsByDoc.get(doc.id) ?? [];
                  const best = attempts.reduce((m, a) => Math.max(m, a.netWpm), 0);
                  const open = openId === doc.id;
                  return (
                    <DocRow
                      key={doc.id}
                      doc={doc}
                      attempts={attempts}
                      best={best}
                      open={open}
                      selected={selectedIds.includes(doc.id)}
                      progress={progress[String(doc.id)] ?? null}
                      onSelect={() => toggleSelect(doc.id)}
                      onToggle={() => setOpenId(open ? null : doc.id)}
                      // Resumes the next unfinished part, or runs the whole
                      // paragraph when it was never split.
                      onRun={() => startPart(doc)}
                      onStartPart={(index) => startPart(doc, index)}
                      onSplit={(chunkChars) => void splitDoc(doc, chunkChars)}
                      onReset={() => void resetSplit(doc)}
                      onDelete={() => void removeDoc(doc)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function DocRow({
  doc,
  attempts,
  best,
  open,
  selected,
  progress,
  onSelect,
  onToggle,
  onRun,
  onStartPart,
  onSplit,
  onReset,
  onDelete,
}: {
  doc: DocumentRow;
  attempts: TestRow[];
  best: number;
  open: boolean;
  selected: boolean;
  /** Split progress, or null when the paragraph is a single passage. */
  progress: PartProgress | null;
  onSelect: () => void;
  onToggle: () => void;
  onRun: () => void;
  onStartPart: (index: number) => void;
  onSplit: (chunkChars: number) => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const done = progress ? percentDone(progress) : null;
  const splittable = !progress && isLongPassage(doc.content);
  return (
    <>
      <tr className="transition-colors hover:bg-surface-hover">
        <td className="px-3 py-2.5">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            aria-label={`Add ${doc.title} to series`}
            className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
          />
        </td>
        <td className="px-3 py-2.5">
          <button
            onClick={onToggle}
            className="flex w-full cursor-pointer items-center gap-2 text-left font-medium"
          >
            {open ? (
              <ChevronDown size={16} className="shrink-0" />
            ) : (
              <ChevronRight size={16} className="shrink-0" />
            )}
            <span className="truncate">{doc.title}</span>
            {progress && (
              <span
                className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent-soft-fg uppercase tabular-nums"
                title={`${done}% of the parts finished`}
              >
                {progress.done.length}/{progress.parts}
              </span>
            )}
            {splittable && (
              <span
                className="shrink-0 rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-fg-muted uppercase"
                title="Long enough to split into shorter sittings — open the row to cut it up"
              >
                Long
              </span>
            )}
          </button>
        </td>
        <td className="truncate px-3 py-2.5 text-fg-muted">{LANG_LABEL[doc.lang]}</td>
        <td className="px-3 py-2.5 text-right tabular-nums text-fg-muted">{doc.charCount}</td>
        <td className="px-3 py-2.5 text-right tabular-nums">{attempts.length}</td>
        <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-accent-text">
          {best > 0 ? best : '—'}
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center justify-end gap-1.5">
            <Button size="sm" onClick={onRun} title={attempts.length > 0 ? 'Run again' : 'Use for a test'}>
              <Play size={13} />
              {attempts.length > 0 ? 'Retest' : 'Start'}
            </Button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${doc.title}`}
              title="Delete this paragraph"
              className="cursor-pointer rounded-control p-1.5 text-fg-subtle transition-colors hover:bg-danger-soft hover:text-danger-text"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={7} className="space-y-4 bg-surface-2 px-3 py-4">
            <DocumentParts
              doc={doc}
              progress={progress}
              onStart={onStartPart}
              onSplit={onSplit}
              onReset={onReset}
            />
            <Leaderboard attempts={attempts} />
          </td>
        </tr>
      )}
    </>
  );
}

function Leaderboard({ attempts }: { attempts: TestRow[] }) {
  const ranked = [...attempts].sort((a, b) => b.netWpm - a.netWpm);
  if (ranked.length === 0) {
    return <p className="text-sm text-fg-muted">No attempts yet — be the first to set a score.</p>;
  }
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">
        <Trophy size={14} className="text-[var(--brand-accent-from)]" /> Leaderboard
      </p>
      <table className="w-full text-left text-sm">
        <tbody className="divide-y divide-line">
          {ranked.map((a, i) => (
            <tr key={a.id} className="tabular-nums">
              <td className="w-10 py-2 font-bold text-fg-subtle">#{i + 1}</td>
              <td className="py-2">{format(new Date(a.createdAt), 'dd MMM, HH:mm')}</td>
              <td className="py-2 font-semibold text-accent-text">{a.netWpm} WPM</td>
              <td className="py-2 text-fg-muted">{a.accuracy}%</td>
              <td className="py-2">
                <span
                  className={
                    a.status === TestStatus.Passed ? 'text-accent-text' : 'text-danger-text'
                  }
                >
                  {a.status === TestStatus.Passed ? 'Passed' : 'Failed'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
