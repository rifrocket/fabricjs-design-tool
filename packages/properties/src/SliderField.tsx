import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { PropertyFieldProps } from "@rifrocket/fabricjs-design-tool";

// Range/step come from the field's own PropertyFieldConfig (registerPropertyFields), falling
// back to a generic 0..100 range for any field registered without one.
const DEFAULT_RANGE = { min: 0, max: 100, step: 0.1 };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function roundToStep(value: number, step: number): number {
  const decimals = (step.toString().split(".")[1] ?? "").length;
  return Number(value.toFixed(decimals));
}

// The range slider itself is a plain, stateless read — PropertiesPanel re-renders on every
// property mutation (EngineState.propertyVersion), so object.get() is always fresh; no local
// mirror state needed to avoid a "stuck" thumb.
//
// Local state survives only for the paired number input's transient typing buffer — "12.",
// "-", or an empty string mid-edit aren't valid committed numbers yet — and it resets when a
// *different* object is selected, since a field component instance is reused across objects
// of the same type, keyed by field.key, not object id.
export function SliderField({ object, field, onChange }: PropertyFieldProps): ReactElement {
  const range = {
    min: field.config?.min ?? DEFAULT_RANGE.min,
    max: field.config?.max ?? DEFAULT_RANGE.max,
    step: field.config?.step ?? DEFAULT_RANGE.step,
  };
  // Seeded through the same roundToStep as commit() uses, so a value that's drifted into float
  // noise (e.g. a dragged/rotated object's property landing on 0.30000000000000004) never reaches
  // the display text on initial render/selection, not just after a user edit.
  const value = roundToStep(Number(object.get(field.key) ?? range.min), range.step);
  const [text, setText] = useState(() => String(value));

  useEffect(() => {
    setText(String(roundToStep(Number(object.get(field.key) ?? range.min), range.step)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object, field.key]);

  const commit = (next: number) => {
    const clamped = roundToStep(clamp(next, range.min, range.max), range.step);
    setText(String(clamped));
    onChange(clamped);
  };

  return (
    <label className="flex flex-col gap-1 text-xs text-fdt-fg-muted">
      <span className="flex items-center justify-between gap-2">
        <span>{field.label ?? field.key}</span>
        <input
          type="number"
          min={range.min}
          max={range.max}
          step={range.step}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={() => {
            const parsed = Number(text);
            commit(Number.isFinite(parsed) ? parsed : value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className="w-16 rounded border border-fdt-border bg-fdt-bg px-1.5 py-0.5 text-right text-sm text-fdt-fg outline-none focus:border-fdt-accent"
        />
      </span>
      <input
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(event) => commit(Number(event.target.value))}
        className="accent-fdt-accent"
      />
    </label>
  );
}
