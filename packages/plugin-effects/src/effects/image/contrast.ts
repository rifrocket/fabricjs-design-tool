import { FabricImage, filters } from "fabric";
import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";

export interface ContrastProps {
  amount: number;
}

export const contrastEffect: EffectDefinition<ContrastProps> = {
  id: "contrast",
  category: "image",
  label: "Contrast",
  track: "raster",
  schema: [{ key: "amount", kind: "slider", label: "Amount", min: -100, max: 100, unit: "%" }],
  defaults: { amount: 0 },
  applyRaster: (canvasEl, props) => {
    const image = new FabricImage(canvasEl);
    image.filters = [new filters.Contrast({ contrast: Number(props.amount ?? 0) / 100 })];
    image.applyFilters();
    return image.getElement() as HTMLCanvasElement;
  },
};
