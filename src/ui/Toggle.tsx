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
        <span className="h-6 w-11 rounded-full bg-edge transition-colors peer-checked:brand-gradient peer-focus-visible:ring-4 peer-focus-visible:ring-accent-ring" />
        <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
