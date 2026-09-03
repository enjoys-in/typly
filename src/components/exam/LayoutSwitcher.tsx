import { Columns2, Rows3 } from 'lucide-react';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { useT } from '@/i18n';

export type ExamLayout = 'split' | 'stacked';

export function LayoutSwitcher({
  layout,
  onChange,
}: {
  layout: ExamLayout;
  onChange: (layout: ExamLayout) => void;
}) {
  const t = useT();
  const options: SegmentedOption<ExamLayout>[] = [
    { value: 'split', label: t('exam.split'), icon: Columns2 },
    { value: 'stacked', label: t('exam.stacked'), icon: Rows3 },
  ];

  return (
    <Segmented
      options={options}
      value={layout}
      onChange={onChange}
      ariaLabel={t('exam.layoutAria')}
    />
  );
}
