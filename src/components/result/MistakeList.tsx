import {
  AlertTriangle,
  CaseUpper,
  Minus,
  Plus,
  Quote,
  Type,
  type LucideIcon,
} from 'lucide-react';
import type { Mistake } from '@/core/types';
import { CATEGORY_LABEL, ErrorCategory } from '@/core/constants';

const CATEGORY_ICON: Record<ErrorCategory, LucideIcon> = {
  [ErrorCategory.MissingChar]: Minus,
  [ErrorCategory.ExtraChar]: Plus,
  [ErrorCategory.WrongChar]: Type,
  [ErrorCategory.WrongWord]: AlertTriangle,
  [ErrorCategory.MissingWord]: Minus,
  [ErrorCategory.ExtraWord]: Plus,
  [ErrorCategory.Capitalization]: CaseUpper,
  [ErrorCategory.Punctuation]: Quote,
};

export function MistakeList({ mistakes }: { mistakes: Mistake[] }) {
  if (mistakes.length === 0) {
    return <p className="text-sm text-fg-muted">No mistakes — perfect run! 🎉</p>;
  }

  return (
    <div className="scroll-area max-h-80 rounded-panel border border-line">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-surface-2 text-xs uppercase tracking-wide text-fg-muted">
          <tr>
            <th className="px-4 py-2 font-medium">#</th>
            <th className="px-4 py-2 font-medium">You typed</th>
            <th className="px-4 py-2 font-medium">Expected</th>
            <th className="px-4 py-2 font-medium">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {mistakes.map((m, i) => {
            const Icon = CATEGORY_ICON[m.category];
            return (
              <tr key={i} className="transition-colors hover:bg-surface-hover">
                <td className="px-4 py-2.5 tabular-nums text-fg-subtle">{i + 1}</td>
                <td className="px-4 py-2.5 font-mono font-medium text-danger-text line-through">
                  {m.typed || '∅'}
                </td>
                <td className="px-4 py-2.5 font-mono font-medium text-accent-text">
                  {m.expected || '∅'}
                </td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
                    <Icon size={14} className="shrink-0" />
                    {CATEGORY_LABEL[m.category]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
