import type { ReactElement } from "react";
import type { PropertyFieldProps } from "@rifrocket/fabricjs-design-tool";

// Plain stateless read — PropertiesPanel re-renders on every property mutation
// (EngineState.propertyVersion), not just selection changes, so object.get() is always fresh.
export function TextField({ object, field, onChange }: PropertyFieldProps): ReactElement {
  const value = String(object.get(field.key) ?? "");

  return (
    <label className="flex flex-col gap-1 text-xs text-fdt-fg-muted">
      {field.label ?? field.key}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-fdt-border bg-fdt-bg px-2 py-1 text-sm text-fdt-fg outline-none focus:border-fdt-accent"
      />
    </label>
  );
}
