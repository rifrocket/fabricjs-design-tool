import { FabricImage, filters } from "fabric";
import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";

export type SepiaProps = Record<string, never>;

export const sepiaEffect: EffectDefinition<SepiaProps> = {
  id: "sepia",
  category: "image",
  label: "Sepia",
  track: "raster",
  schema: [],
  defaults: {},
  applyRaster: (canvasEl) => {
    const image = new FabricImage(canvasEl);
    image.filters = [new filters.Sepia()];
    image.applyFilters();
    return image.getElement() as HTMLCanvasElement;
  },
};
