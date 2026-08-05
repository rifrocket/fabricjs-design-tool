import { FabricImage, filters } from "fabric";
import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";

export interface NoiseProps {
  amount: number;
}

export const noiseEffect: EffectDefinition<NoiseProps> = {
  id: "noise",
  category: "creative",
  label: "Noise",
  track: "raster",
  schema: [{ key: "amount", kind: "slider", label: "Amount", min: 0, max: 100, unit: "%" }],
  defaults: { amount: 30 },
  applyRaster: (canvasEl, props) => {
    const image = new FabricImage(canvasEl);
    image.filters = [new filters.Noise({ noise: Number(props.amount ?? 30) * 4 })];
    image.applyFilters();
    return image.getElement() as HTMLCanvasElement;
  },
};
