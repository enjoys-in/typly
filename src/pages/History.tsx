import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Film, Play } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { useAsync } from '@/hooks/useAsync';
import type { TestRow } from '@/core/types';
import { TestStatus } from '@/core/constants';
import { profileFor } from '@/core/scoring/examProfiles';
import { ProgressChart } from '@/components/history/ProgressChart';
import { ReplayModal } from '@/components/result/ReplayModal';
import { Card } from '@/ui/Card';
import { DataTable, type Column } from '@/ui/DataTable';
import { ToggleChip } from '@/ui/ToggleChip';

const COLUMNS: Column<TestRow>[] = [
  {
    key: 'date',
    header: 'Date',
    width: '9.5rem',
    render: (r) => format(new Date(r.createdAt), 'dd MMM, HH:mm'),
  },
  {
    key: 'exam',
    header: 'Exam',
    render: (r) => profileFor(r.examBoard).name,
  },
  {
    key: 'netWpm',
    header: 'Net WPM',
    width: '7rem',
    align: 'right',
    className: 'font-semibold',
    render: (r) => r.netWpm,
  },
  {
    key: 'accuracy',
    header: 'Accuracy',
    width: '7rem',
    align: 'right',
    render: (r) => `${r.accuracy}%`,
  },
  {
    key: 'errors',
    header: 'Errors',
    width: '6rem',
    align: 'right',
    render: (r) => r.errors,
  },
  {
    key: 'status',
    header: 'Status',
    width: '7.5rem',
    align: 'center',
    render: (r) => (
      <span
        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
          r.status === TestStatus.Passed
            ? 'bg-accent-soft text-accent-soft-fg'
            : 'bg-danger-soft text-danger-soft-fg'
        }`}
      >
        {r.status === TestStatus.Passed ? 'Passed' : 'Failed'}
      </span>
    ),
  },
];

export function History() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const setDraft = useExamStore((s) => s.setDraft);
  const [replayId, setReplayId] = useState<number | null>(null);
  const history = useAsync(() => platform.repo.listHistory(), [platform]);
  const rows = history.data;

  const retest = useCallback(
    async (row: TestRow) => {
      if (row.documentId == null) return;
      const doc = await platform.repo.getDocument(row.documentId);
      if (!doc) return;
      setDraft({
        passage: doc.content,
        title: doc.title,
        documentId: doc.id,
        sourceType: doc.sourceType,
        lang: doc.lang,
      });
      navigate('/app/setup');
    },
    [platform, setDraft, navigate],
  );

  const columns = useMemo<Column<TestRow>[]>(
    () => [
      ...COLUMNS,
      {
        key: 'actions',
        header: '',
        width: '11.5rem',
        align: 'right',
        render: (r) =>
          r.documentId != null ? (
            <div className="flex justify-end gap-1.5">
              <ToggleChip
                active={false}
                onClick={() => setReplayId(r.id)}
                title="Watch this attempt play back"
              >
                <Film size={13} /> Replay
              </ToggleChip>
              <button
                onClick={() => void retest(r)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-control bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg transition-all hover:bg-accent-hover active:scale-95"
              >
                <Play size={13} /> Retest
              </button>
            </div>
          ) : null,
      },
    ],
    [retest],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">History</h1>
      {rows && rows.length >= 2 && (
        <Card className="space-y-4">
          <h2 className="font-semibold">Progress — how much you improved</h2>
          <ProgressChart rows={rows} />
        </Card>
      )}
      <DataTable
        columns={columns}
        rows={rows ?? []}
        rowKey={(r) => r.id}
        loading={history.loading}
        empty="No tests yet. Take your first test!"
        maxHeight="32rem"
      />
      {replayId !== null && <ReplayModal testId={replayId} onClose={() => setReplayId(null)} />}
    </div>
  );
}

