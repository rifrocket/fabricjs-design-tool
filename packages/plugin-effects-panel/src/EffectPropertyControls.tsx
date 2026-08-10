import type { ReactElement } from "react";
import type { EffectInstance, EffectPropSchemaField } from "@rifrocket/fabricjs-design-tool";
import { EffectSliderControl } from "./controls/EffectSliderControl";
import { EffectColorControl } from "./controls/EffectColorControl";
import { EffectAngleControl } from "./controls/EffectAngleControl";
import { EffectSelectControl } from "./controls/EffectSelectControl";

export interface EffectPropertyControlsProps {
  schema: EffectPropSchemaField[];
  instance: EffectInstance;
  onChange: (propsPatch: Record<string, unknown>) => void;
}

// Renders one control per schema field, in schema-declaration order — every input fires on
// every change event (not just blur/commit), so a slider drag live-previews on the canvas as it
// moves (see useObjectEffects.ts: apply() goes straight through engine.setObjectProperty).
export function EffectPropertyControls({ schema, instance, onChange }: EffectPropertyControlsProps): ReactElement {
  return (
    <div className="flex flex-col gap-2.5 pt-1">
      {schema.map((field) => {
        const value = instance.props[field.key];
        switch (field.kind) {
          case "slider":
            return (
              <EffectSliderControl
                key={field.key}
                label={field.label}
                value={Number(value ?? field.min)}
                min={field.min}
                max={field.max}
                step={field.step}
                unit={field.unit}
                onChange={(next) => onChange({ [field.key]: next })}
              />
            );
          case "color":
            return (
              <EffectColorControl
                key={field.key}
                label={field.label}
                value={typeof value === "string" ? value : "#000000"}
                onChange={(next) => onChange({ [field.key]: next })}
              />
            );
          case "angle":
            return (
              <EffectAngleControl
                key={field.key}
                label={field.label}
                value={Number(value ?? 0)}
                onChange={(next) => onChange({ [field.key]: next })}
              />
            );
          case "select":
            return (
              <EffectSelectControl
                key={field.key}
                label={field.label}
                value={typeof value === "string" ? value : (field.options[0]?.value ?? "")}
                options={field.options}
                onChange={(next) => onChange({ [field.key]: next })}
              />
            );
        }
      })}
    </div>
  );
}
