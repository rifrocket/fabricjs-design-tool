import type { EffectDefinition } from "@rifrocket/fdt-core";
import { applyDuotone } from "../../pixelOps/duotone";

export interface DuotoneProps {
  shadowColor: string;
  highlightColor: string;
  intensity: number;
}

export const duotoneEffect: EffectDefinition<DuotoneProps> = {
  id: "duotone",
  category: "creative",
  label: "Duotone",
  track: "raster",
  schema: [
    { key: "shadowColor", kind: "color", label: "Shadow colour" },
    { key: "highlightColor", kind: "color", label: "Highlight colour" },
    { key: "intensity", kind: "slider", label: "Intensity", min: 0, max: 100, unit: "%" },
  ],
  defaults: { shadowColor: "#1e1b4b", highlightColor: "#f472b6", intensity: 100 },
  applyRaster: (canvasEl, props) => {
    applyDuotone(canvasEl, {
      shadowColor: props.shadowColor,
      highlightColor: props.highlightColor,
      intensity: Number(props.intensity ?? 100),
    });
  },
};
