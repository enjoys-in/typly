import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

// Roles, not colours: primary = brand accent, secondary = neutral outline,
// danger = destructive/failure. `secondary` used to be orange, which collided
// with the error palette — an unselected option should not read as a warning.
//
// The primary and danger fills carry a one-pixel inset highlight along their
// top edge. It is the difference between a button and a coloured rectangle: the
// eye reads it as a lit, pressable surface.
const STYLES: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-fg shadow-e1 ring-1 ring-inset ring-white/15 hover:bg-accent-hover focus-visible:ring-accent-ring',
  secondary:
    'border border-edge bg-surface text-fg shadow-e1 hover:border-fg-subtle hover:bg-surface-2 focus-visible:ring-edge',
  danger:
    'bg-danger text-danger-fg shadow-e1 ring-1 ring-inset ring-white/15 hover:bg-danger-hover focus-visible:ring-danger-ring',
  ghost: 'bg-transparent text-fg-muted hover:bg-surface-hover hover:text-fg focus-visible:ring-edge',
};

// Fixed heights rather than vertical padding, so a button lines up with a
// select or an input on the same row without either being nudged by hand.
const SIZES: Record<Size, string> = {
  sm: 'h-7 gap-1.5 px-2.5 text-xs',
  md: 'h-9 gap-2 px-3.5 text-sm',
  lg: 'h-11 gap-2 px-5 text-sm',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  return (
    <button
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control font-semibold whitespace-nowrap outline-none transition-[background-color,border-color,box-shadow,transform,color] duration-150 focus-visible:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:active:scale-100 ${SIZES[size]} ${STYLES[variant]} ${className}`}
      {...rest}
    />
  );
}
