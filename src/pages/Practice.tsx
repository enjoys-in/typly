import { useNavigate } from 'react-router-dom';
import {
  AlignLeft,
  Asterisk,
  CaseUpper,
  Command,
  Calculator,
  Hash,
  Keyboard,
  Quote,
  Rows3,
  ArrowUpToLine,
  ArrowDownToLine,
  Type,
  type LucideIcon,
} from 'lucide-react';
import { useExamStore } from '@/store/examStore';
import { drillBase, useSettingsStore } from '@/store/settingsStore';
import { generateDrill } from '@/core/practice/generators';
import { isMacOS } from '@/platform/detect';
import { PracticeKind, PRACTICE_LABEL, SourceType } from '@/core/constants';
import { useT } from '@/i18n';

const DRILLS: { kind: PracticeKind; icon: LucideIcon }[] = [
  { kind: PracticeKind.HomeRow, icon: Keyboard },
  { kind: PracticeKind.TopRow, icon: ArrowUpToLine },
  { kind: PracticeKind.BottomRow, icon: ArrowDownToLine },
  { kind: PracticeKind.AllRows, icon: Rows3 },
  { kind: PracticeKind.Words, icon: Type },
  { kind: PracticeKind.Sentences, icon: AlignLeft },
  { kind: PracticeKind.Capitals, icon: CaseUpper },
  { kind: PracticeKind.Numbers, icon: Hash },
  { kind: PracticeKind.Numpad, icon: Calculator },
  { kind: PracticeKind.Symbols, icon: Asterisk },
  { kind: PracticeKind.Punctuation, icon: Quote },
  { kind: PracticeKind.Shortcuts, icon: Command },
];

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DRILLS.map(({ kind, icon: Icon }) => (
          <button
            key={kind}
            onClick={() => start(kind)}
            className="group flex cursor-pointer flex-col items-start gap-3 rounded-panel border border-line bg-surface p-5 text-left transition-colors duration-150 hover:border-accent-border hover:bg-surface-2"
          >
            <span className="brand-gradient flex h-11 w-11 items-center justify-center rounded-control text-white">
              <Icon size={22} />
            </span>
            <h2 className="text-base font-semibold">{t(`practice.${kind}`)}</h2>
            <p className="text-sm text-fg-muted">{t(`practiceDesc.${kind}`)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
