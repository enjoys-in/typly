import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

// Roles, not colours: primary = brand accent, secondary = neutral outline,
// danger = destructive/failure. `secondary` used to be orange, which collided
// with the error palette — an unselected option should not read as a warning.
const STYLES: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover focus-visible:ring-accent-ring',
  secondary:
    'border border-edge bg-surface text-fg hover:bg-surface-hover focus-visible:ring-edge',
  danger: 'bg-danger text-danger-fg hover:bg-danger-hover focus-visible:ring-danger-ring',
  ghost: 'bg-transparent text-fg hover:bg-surface-hover focus-visible:ring-edge',
};

// One size scale instead of per-call px/py patching: `sm` for dense rows and
// toolbars, `md` for page actions, `lg` for a single hero action.
const SIZES: Record<Size, string> = {
  sm: 'gap-1.5 px-2.5 py-1.5 text-xs',
  md: 'gap-2 px-3.5 py-2 text-sm',
  lg: 'gap-2 px-4 py-2.5 text-sm',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  return (
    <button
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control font-semibold whitespace-nowrap outline-none transition-colors duration-150 focus-visible:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${SIZES[size]} ${STYLES[variant]} ${className}`}
      {...rest}
    />
  );
}
