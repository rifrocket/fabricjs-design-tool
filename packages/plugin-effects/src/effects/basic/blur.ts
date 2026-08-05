import { FabricImage, filters } from "fabric";
import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";

export interface BlurProps {
  amount: number;
}

export const blurEffect: EffectDefinition<BlurProps> = {
  id: "blur",
  category: "basic",
  label: "Blur",
  track: "raster",
  schema: [{ key: "amount", kind: "slider", label: "Blur", min: 0, max: 100, unit: "%" }],
  defaults: { amount: 20 },
  applyRaster: (canvasEl, props) => {
    const image = new FabricImage(canvasEl);
    image.filters = [new filters.Blur({ blur: Math.min(1, Math.max(0, Number(props.amount ?? 0) / 100)) })];
    image.applyFilters();
    return image.getElement() as HTMLCanvasElement;
  },
};
