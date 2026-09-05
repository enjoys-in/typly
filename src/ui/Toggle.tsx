interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}

// Accessible on/off switch built on a native checkbox.
export function Toggle({ checked, onChange, label, hint, disabled = false }: Props) {
  return (
    <label
      className={`flex max-w-2xl items-center justify-between gap-4 ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      <span className="flex flex-col">
        <span className="text-sm font-medium text-fg">{label}</span>
        {hint && <span className="text-xs text-fg-muted">{hint}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-6 w-[2.625rem] rounded-full bg-edge ring-1 ring-black/5 transition-colors ring-inset peer-checked:brand-gradient peer-focus-visible:ring-4 peer-focus-visible:ring-accent-ring" />
        {/* The knob eases rather than snaps: on a switch it is the one place a
            spring curve reads as quality instead of decoration. */}
        <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-e2 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] peer-checked:translate-x-[1.125rem]" />
      </span>
    </label>
  );
}
