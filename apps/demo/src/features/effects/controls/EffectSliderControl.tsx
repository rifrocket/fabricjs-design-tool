import { useEffect, useState } from "react";
import type { ReactElement } from "react";

export interface EffectSliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Structural mirror of @rifrocket/fdt-properties's SliderField (range + paired number input, a
// transient local text buffer only for the number input), but driven directly by props instead
// of a PropertyFieldDefinition — an effect's props live in one EffectInstance.props object, not
// as individual object properties a field.key could address.
export function EffectSliderControl({ label, value, min, max, step = 1, unit, onChange }: EffectSliderControlProps): ReactElement {
  const [text, setText] = useState(() => String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = (next: number) => {
    const clamped = clamp(next, min, max);
    setText(String(clamped));
    onChange(clamped);
  };

  return (
    <label className="flex flex-col gap-1 text-xs text-fdt-fg-muted">
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <span className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
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
            className="w-14 rounded border border-fdt-border bg-fdt-bg px-1.5 py-0.5 text-right text-fdt-fg outline-none focus:border-fdt-accent"
          />
          {unit && <span className="w-5 text-[10px]">{unit}</span>}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => commit(Number(event.target.value))}
        className="accent-fdt-accent"
      />
    </label>
  );
}
