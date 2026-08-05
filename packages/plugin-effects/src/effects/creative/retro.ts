import { FabricImage, filters } from "fabric";
import type { EffectDefinition } from "@rifrocket/fdt-core";
import { applyVignette } from "../../pixelOps/vignette";

export interface RetroProps {
  vignetteStrength: number;
}

export const retroEffect: EffectDefinition<RetroProps> = {
  id: "retro",
  category: "creative",
  label: "Retro",
  track: "raster",
  schema: [{ key: "vignetteStrength", kind: "slider", label: "Vignette", min: 0, max: 100, unit: "%" }],
  defaults: { vignetteStrength: 40 },
  applyRaster: (canvasEl, props) => {
    const image = new FabricImage(canvasEl);
    image.filters = [new filters.Technicolor()];
    image.applyFilters();
    const filtered = image.getElement() as HTMLCanvasElement;
    applyVignette(filtered, { strength: Number(props.vignetteStrength ?? 40), spread: 30 });
    return filtered;
  },
};
