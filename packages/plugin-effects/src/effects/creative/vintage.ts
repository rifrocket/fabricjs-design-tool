import { FabricImage, filters } from "fabric";
import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";

export type VintageProps = Record<string, never>;

export const vintageEffect: EffectDefinition<VintageProps> = {
  id: "vintage",
  category: "creative",
  label: "Vintage",
  track: "raster",
  schema: [],
  defaults: {},
  applyRaster: (canvasEl) => {
    const image = new FabricImage(canvasEl);
    image.filters = [new filters.Vintage()];
    image.applyFilters();
    return image.getElement() as HTMLCanvasElement;
  },
};
