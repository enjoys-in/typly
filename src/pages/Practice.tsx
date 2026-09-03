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

const DRILLS: { kind: PracticeKind; icon: LucideIcon; desc: string }[] = [
  { kind: PracticeKind.HomeRow, icon: Keyboard, desc: 'Anchor the a-s-d-f / j-k-l-; keys.' },
  { kind: PracticeKind.TopRow, icon: ArrowUpToLine, desc: 'Reach up to q-w-e-r-t / y-u-i-o-p.' },
  { kind: PracticeKind.BottomRow, icon: ArrowDownToLine, desc: 'Reach down to z-x-c-v-b / n-m keys.' },
  { kind: PracticeKind.AllRows, icon: Rows3, desc: 'Finger ladders across all three rows.' },
  { kind: PracticeKind.Words, icon: Type, desc: 'Frequent English words to build flow.' },
  { kind: PracticeKind.Sentences, icon: AlignLeft, desc: 'Full sentences with real rhythm.' },
  { kind: PracticeKind.Capitals, icon: CaseUpper, desc: 'Shift for Title, ALL CAPS and CamelCase.' },
  { kind: PracticeKind.Numbers, icon: Hash, desc: 'Number-row and numeric accuracy.' },
  { kind: PracticeKind.Numpad, icon: Calculator, desc: 'Digits, decimals and + - * / operators.' },
  { kind: PracticeKind.Symbols, icon: Asterisk, desc: 'Special characters and symbols.' },
  { kind: PracticeKind.Punctuation, icon: Quote, desc: 'Commas, periods, and marks.' },
  { kind: PracticeKind.Shortcuts, icon: Command, desc: 'Real editor shortcuts for your OS.' },
];

export function Practice() {
  const navigate = useNavigate();
  const setConfig = useExamStore((s) => s.setConfig);
  const settings = useSettingsStore();

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
        <h1 className="text-3xl font-bold tracking-tight">Practice drills</h1>
        <p className="mt-1 text-fg-muted">
          Targeted exercises for weak areas. Each generates a fresh passage using your current
          settings.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DRILLS.map(({ kind, icon: Icon, desc }) => (
          <button
            key={kind}
            onClick={() => start(kind)}
            className="group flex cursor-pointer flex-col items-start gap-3 rounded-panel border border-line bg-surface p-5 text-left transition-colors duration-150 hover:border-accent-border hover:bg-surface-2"
          >
            <span className="brand-gradient flex h-11 w-11 items-center justify-center rounded-control text-white">
              <Icon size={22} />
            </span>
            <h2 className="text-base font-semibold">{PRACTICE_LABEL[kind]}</h2>
            <p className="text-sm text-fg-muted">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
