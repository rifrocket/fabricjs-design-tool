import { FabricImage, filters } from "fabric";
import type { EffectDefinition } from "@rifrocket/fdt-core";

export interface BrightnessProps {
  amount: number;
}

export const brightnessEffect: EffectDefinition<BrightnessProps> = {
  id: "brightness",
  category: "image",
  label: "Brightness",
  track: "raster",
  schema: [{ key: "amount", kind: "slider", label: "Amount", min: -100, max: 100, unit: "%" }],
  defaults: { amount: 0 },
  applyRaster: (canvasEl, props) => {
    const image = new FabricImage(canvasEl);
    image.filters = [new filters.Brightness({ brightness: Number(props.amount ?? 0) / 100 })];
    image.applyFilters();
    return image.getElement() as HTMLCanvasElement;
  },
};
