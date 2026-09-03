import { Minus, Plus, RotateCcw } from 'lucide-react';
import { EXAM_ZOOM_DEFAULT, EXAM_ZOOM_MAX, EXAM_ZOOM_MIN } from '@/core/constants';
import { useT } from '@/i18n';

interface Props {
  zoom: number;
  onChange: (zoom: number) => void;
}

/** Steps the passage + input text size together, so they never desynchronise. */
export function ZoomControl({ zoom, onChange }: Props) {
  const t = useT();
  const atMin = zoom <= EXAM_ZOOM_MIN + 0.001;
  const atMax = zoom >= EXAM_ZOOM_MAX - 0.001;
  const isDefault = Math.abs(zoom - EXAM_ZOOM_DEFAULT) < 0.001;

  return (
    <div className="flex items-center gap-0.5 rounded-control border border-line bg-surface-2 p-0.5">
      <IconButton label={t('zoom.out')} disabled={atMin} onClick={() => onChange(zoom - 0.125)}>
        <Minus size={14} />
      </IconButton>
      <span className="min-w-11 text-center text-[11px] font-semibold tabular-nums text-fg-muted">
        {Math.round(zoom * 100)}%
      </span>
      <IconButton label={t('zoom.in')} disabled={atMax} onClick={() => onChange(zoom + 0.125)}>
        <Plus size={14} />
      </IconButton>
      <IconButton
        label={t('zoom.reset')}
        disabled={isDefault}
        onClick={() => onChange(EXAM_ZOOM_DEFAULT)}
      >
        <RotateCcw size={13} />
      </IconButton>
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-inner text-fg-muted outline-none transition-colors hover:bg-surface-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-ring disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
