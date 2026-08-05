import type { ReactElement } from "react";

export interface EffectSelectControlProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export function EffectSelectControl({ label, value, options, onChange }: EffectSelectControlProps): ReactElement {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-fdt-fg-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded border border-fdt-border bg-fdt-bg px-1.5 py-0.5 text-fdt-fg outline-none focus:border-fdt-accent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
