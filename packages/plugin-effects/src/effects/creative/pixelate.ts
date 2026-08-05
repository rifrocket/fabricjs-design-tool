import { FabricImage, filters } from "fabric";
import type { EffectDefinition } from "@rifrocket/fdt-core";

export interface PixelateProps {
  blockSize: number;
}

export const pixelateEffect: EffectDefinition<PixelateProps> = {
  id: "pixelate",
  category: "creative",
  label: "Pixelate",
  track: "raster",
  schema: [{ key: "blockSize", kind: "slider", label: "Block size", min: 2, max: 40, step: 1, unit: "px" }],
  defaults: { blockSize: 8 },
  applyRaster: (canvasEl, props) => {
    const image = new FabricImage(canvasEl);
    image.filters = [new filters.Pixelate({ blocksize: Math.max(2, Number(props.blockSize ?? 8)) })];
    image.applyFilters();
    return image.getElement() as HTMLCanvasElement;
  },
};
