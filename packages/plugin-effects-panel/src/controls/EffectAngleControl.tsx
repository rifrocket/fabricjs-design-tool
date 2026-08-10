import type { ReactElement } from "react";
import { Compass } from "lucide-react";
import { EffectSliderControl } from "./EffectSliderControl";

export interface EffectAngleControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

// A 0-360deg slider with a compass affordance for Direction/Rotation-style props — otherwise the
// same control as EffectSliderControl, just with a fixed range and a distinct icon.
export function EffectAngleControl({ label, value, onChange }: EffectAngleControlProps): ReactElement {
  return (
    <div className="flex items-center gap-2">
      <Compass
        size={14}
        strokeWidth={1.75}
        className="mt-4 shrink-0 text-fdt-fg-muted"
        style={{ transform: `rotate(${value}deg)` }}
      />
      <div className="flex-1">
        <EffectSliderControl label={label} value={value} min={0} max={360} step={1} unit="°" onChange={onChange} />
      </div>
    </div>
  );
}
