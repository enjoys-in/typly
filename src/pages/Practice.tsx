import { useNavigate } from 'react-router-dom';
import {
  AlignLeft,
  ArrowLeftRight,
  Asterisk,
  Baseline,
  Fingerprint,
  Layers,
  CaseUpper,
  Command,
  Calculator,
  Hash,
  Keyboard,
  Quote,
  Rows3,
  Table,
  ArrowUpToLine,
  ArrowDownToLine,
  Type,
  type LucideIcon,
} from 'lucide-react';
import { useExamStore } from '@/store/examStore';
import { drillBase, useSettingsStore } from '@/store/settingsStore';
import { generateDrill } from '@/core/practice/generators';
import { isMacOS } from '@/platform/detect';
import {
  DRILL_DIFFICULTY_ORDER,
  PracticeKind,
  PRACTICE_DIFFICULTY,
  PRACTICE_LABEL,
  SourceType,
} from '@/core/constants';
import { EndlessCard } from '@/components/exam/EndlessCard';
import { useT } from '@/i18n';

const DRILL_ICON: Record<PracticeKind, LucideIcon> = {
  [PracticeKind.HomeRow]: Keyboard,
  [PracticeKind.Words]: Type,
  [PracticeKind.TopRow]: ArrowUpToLine,
  [PracticeKind.BottomRow]: ArrowDownToLine,
  [PracticeKind.Capitals]: CaseUpper,
  [PracticeKind.Punctuation]: Quote,
  [PracticeKind.Numbers]: Hash,
  [PracticeKind.Sentences]: AlignLeft,
  [PracticeKind.AllRows]: Rows3,
  [PracticeKind.Bigrams]: Baseline,
  [PracticeKind.Alternating]: ArrowLeftRight,
  [PracticeKind.Numpad]: Calculator,
  [PracticeKind.Symbols]: Asterisk,
  [PracticeKind.LongWords]: AlignLeft,
  [PracticeKind.SameFinger]: Fingerprint,
  [PracticeKind.Shortcuts]: Command,
  [PracticeKind.Mixed]: Layers,
  [PracticeKind.DataEntry]: Table,
};

/**
 * Every drill in one flat list, easiest first. Deliberately not grouped by
 * difficulty — a quiet chip on each card is enough, and grouping would make
 * the harder half look like a locked section.
 */
const DRILLS: PracticeKind[] = Object.values(PracticeKind).sort(
  (a, b) =>
    DRILL_DIFFICULTY_ORDER[PRACTICE_DIFFICULTY[a]] - DRILL_DIFFICULTY_ORDER[PRACTICE_DIFFICULTY[b]],
);

export function Practice() {
  const navigate = useNavigate();
  const setConfig = useExamStore((s) => s.setConfig);
  const settings = useSettingsStore();
  const t = useT();

  function start(kind: PracticeKind) {
    setConfig({
      ...drillBase(settings),
      passage: generateDrill(kind, isMacOS()),
      title: `${PRACTICE_LABEL[kind]} drill`,
      documentId: null,
      sourceType: SourceType.Text,
    });
    navigate('/app/exam');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('practice.title')}</h1>
        <p className="mt-1 text-fg-muted">
          {t('practice.subtitle')}
        </p>
      </div>

      {/* Not a drill: every card below runs for a fixed length, and this is the
          one that runs until you cannot hold the pace. */}
      <EndlessCard />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DRILLS.map((kind) => {
          const Icon = DRILL_ICON[kind];
          return (
            <button
              key={kind}
              onClick={() => start(kind)}
              className="group flex cursor-pointer flex-col items-start gap-3 rounded-panel border border-line bg-surface p-5 text-left transition-colors duration-150 hover:border-accent-border hover:bg-surface-2"
            >
              <div className="flex w-full items-start justify-between gap-3">
                <span className="brand-gradient flex h-11 w-11 items-center justify-center rounded-control text-white">
                  <Icon size={22} />
                </span>
                {/* Quiet on purpose: it informs the choice without ranking the
                    cards or implying anything is locked. */}
                <span className="mt-1 text-[11px] font-medium tracking-wide text-fg-subtle uppercase">
                  {t(`drill.${PRACTICE_DIFFICULTY[kind]}`)}
                </span>
              </div>
              <h2 className="text-base font-semibold">{t(`practice.${kind}`)}</h2>
              <p className="text-sm text-fg-muted">{t(`practiceDesc.${kind}`)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
