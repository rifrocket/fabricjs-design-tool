import type { ReactElement } from "react";
import type { PropertyFieldProps } from "@rifrocket/fdt-core";

// Plain stateless read — see NumberField.tsx for why local state isn't needed. Only handles
// plain hex fill/stroke here — gradients are a distinct, non-string fill value and out of
// scope for this simple swatch; falls back to a neutral default rather than crashing on one.
export function ColorField({ object, field, onChange }: PropertyFieldProps): ReactElement {
  const raw = object.get(field.key);
  const value = typeof raw === "string" && raw.startsWith("#") ? raw : "#000000";

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-fdt-fg-muted">
      {field.label ?? field.key}
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 w-10 cursor-pointer rounded-md border border-fdt-border bg-fdt-bg p-0.5"
      />
    </label>
  );
}
