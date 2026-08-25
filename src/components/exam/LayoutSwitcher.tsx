import { Columns2, Rows3 } from 'lucide-react';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';

export type ExamLayout = 'split' | 'stacked';

const OPTIONS: SegmentedOption<ExamLayout>[] = [
  { value: 'split', label: 'Split', icon: Columns2 },
  { value: 'stacked', label: 'Stacked', icon: Rows3 },
];

export function LayoutSwitcher({
  layout,
  onChange,
}: {
  layout: ExamLayout;
  onChange: (layout: ExamLayout) => void;
}) {
  return (
    <Segmented options={OPTIONS} value={layout} onChange={onChange} ariaLabel="Exam layout" />
  );
}
