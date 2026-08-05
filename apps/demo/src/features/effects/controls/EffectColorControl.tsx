import type { ReactElement } from "react";

export interface EffectColorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

// Structural mirror of @rifrocket/fdt-properties's ColorField's bare hex swatch, driven directly
// by props rather than a PropertyFieldDefinition/object.get(field.key) read.
export function EffectColorControl({ label, value, onChange }: EffectColorControlProps): ReactElement {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-fdt-fg-muted">
      {label}
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-6 w-10 cursor-pointer rounded border border-fdt-border bg-fdt-bg"
      />
    </label>
  );
}
