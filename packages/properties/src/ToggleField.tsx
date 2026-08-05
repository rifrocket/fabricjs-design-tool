import type { ReactElement } from "react";
import type { PropertyFieldProps } from "@rifrocket/fabricjs-design-tool";

const DEFAULT_ON_OFF: [unknown, unknown] = [true, false];

// Some toggles are real booleans and some are two-value strings (e.g. fontWeight
// "bold"/"normal") — a 2-entry field.config.options array supplies [onValue, offValue]
// (reusing PropertyFieldConfig.options rather than adding a dedicated on/off config shape);
// falls back to a real boolean when absent or the wrong length.
export function ToggleField({ object, field, onChange }: PropertyFieldProps): ReactElement {
  const options = field.config?.options;
  const [onValue, offValue] =
    options?.length === 2 ? [options[0].value, options[1].value] : DEFAULT_ON_OFF;
  const checked = object.get(field.key) === onValue;

  return (
    <label className="flex items-center gap-2 text-xs text-fdt-fg-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked ? onValue : offValue)}
        className="accent-fdt-accent"
      />
      {field.label ?? field.key}
    </label>
  );
}
