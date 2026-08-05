import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { PropertyFieldProps } from "@rifrocket/fdt-core";

// Local state holds only the transient typing buffer (same reasoning as SliderField.tsx's
// paired number input) — the committed value itself is read fresh from the object on every
// render.
//
// For open-ended numeric properties (position, pixel size) that don't fit a bounded 0..max
// slider — canvas position can be negative or exceed the canvas, for instance — step comes
// from the field's own PropertyFieldConfig, defaulting to 1.
// Rounds to the field's own step so a value that's drifted into float noise (e.g. a dragged
// object's "top" landing on 140.0000000000001) never reaches the display text — commit() already
// did this for user-typed edits; seeding `value`/`text` from it too keeps the initial/selection
// render in step, not just post-edit.
function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function NumberField({ object, field, onChange }: PropertyFieldProps): ReactElement {
  const step = field.config?.step ?? 1;
  const value = roundToStep(Number(object.get(field.key) ?? 0), step);
  const [text, setText] = useState(() => String(value));

  useEffect(() => {
    setText(String(roundToStep(Number(object.get(field.key) ?? 0), step)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object, field.key]);

  const commit = (next: number) => {
    const rounded = roundToStep(next, step);
    setText(String(rounded));
    onChange(rounded);
  };

  return (
    <label className="flex flex-col gap-1 text-xs text-fdt-fg-muted">
      {field.label ?? field.key}
      <input
        type="number"
        step={step}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => {
          const parsed = Number(text);
          commit(Number.isFinite(parsed) ? parsed : value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="w-full rounded-md border border-fdt-border bg-fdt-bg px-2 py-1 text-sm text-fdt-fg outline-none focus:border-fdt-accent"
      />
    </label>
  );
}
