import type { ReactElement } from "react";
import type { PropertyFieldProps } from "@rifrocket/fabricjs-design-tool";

// <option> values are always strings in the DOM, so the selected option's original (possibly
// non-string) value is looked up by matching String(option.value) back to the option list.
export function SelectField({ object, field, onChange }: PropertyFieldProps): ReactElement {
  const options = field.config?.options ?? [];
  const current = object.get(field.key) ?? options[0]?.value ?? "";

  return (
    <label className="flex flex-col gap-1 text-xs text-fdt-fg-muted">
      {field.label ?? field.key}
      <select
        value={String(current)}
        onChange={(event) => {
          const selected = options.find((option) => String(option.value) === event.target.value);
          onChange(selected ? selected.value : event.target.value);
        }}
        className="w-full rounded-md border border-fdt-border bg-fdt-bg px-2 py-1 text-sm text-fdt-fg outline-none focus:border-fdt-accent"
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
