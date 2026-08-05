import { FabricImage, filters } from "fabric";
import type { EffectDefinition } from "@rifrocket/fdt-core";

export interface HueProps {
  angle: number;
}

export const hueEffect: EffectDefinition<HueProps> = {
  id: "hue",
  category: "image",
  label: "Hue",
  track: "raster",
  schema: [{ key: "angle", kind: "angle", label: "Rotation" }],
  defaults: { angle: 0 },
  applyRaster: (canvasEl, props) => {
    const image = new FabricImage(canvasEl);
    image.filters = [new filters.HueRotation({ rotation: (Number(props.angle ?? 0) / 180) * Math.PI })];
    image.applyFilters();
    return image.getElement() as HTMLCanvasElement;
  },
};
