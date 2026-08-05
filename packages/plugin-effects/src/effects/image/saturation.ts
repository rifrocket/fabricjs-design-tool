import { FabricImage, filters } from "fabric";
import type { EffectDefinition } from "@rifrocket/fdt-core";

export interface SaturationProps {
  amount: number;
}

export const saturationEffect: EffectDefinition<SaturationProps> = {
  id: "saturation",
  category: "image",
  label: "Saturation",
  track: "raster",
  schema: [{ key: "amount", kind: "slider", label: "Amount", min: -100, max: 100, unit: "%" }],
  defaults: { amount: 0 },
  applyRaster: (canvasEl, props) => {
    const image = new FabricImage(canvasEl);
    image.filters = [new filters.Saturation({ saturation: Number(props.amount ?? 0) / 100 })];
    image.applyFilters();
    return image.getElement() as HTMLCanvasElement;
  },
};
