import type { EffectDefinition } from "@rifrocket/fdt-core";
import { applyVignette } from "../../pixelOps/vignette";

export interface VignetteProps {
  strength: number;
  spread: number;
  color: string;
}

export const vignetteEffect: EffectDefinition<VignetteProps> = {
  id: "vignette",
  category: "image",
  label: "Vignette",
  track: "raster",
  schema: [
    { key: "strength", kind: "slider", label: "Strength", min: 0, max: 100, unit: "%" },
    { key: "spread", kind: "slider", label: "Spread", min: 0, max: 100, unit: "%" },
    { key: "color", kind: "color", label: "Colour" },
  ],
  defaults: { strength: 50, spread: 40, color: "#000000" },
  applyRaster: (canvasEl, props) => {
    applyVignette(canvasEl, {
      strength: Number(props.strength ?? 50),
      spread: Number(props.spread ?? 40),
      color: props.color,
    });
  },
};
