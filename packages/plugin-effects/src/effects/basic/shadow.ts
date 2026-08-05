import type { EffectDefinition } from "@rifrocket/fdt-core";
import { drawSilhouettePass } from "../../pipeline/silhouettePass";

export interface ShadowProps {
  angle: number;
  distance: number;
  blur: number;
  color: string;
  opacity: number;
}

export const shadowEffect: EffectDefinition<ShadowProps> = {
  id: "shadow",
  category: "basic",
  label: "Shadow",
  track: "compositing",
  schema: [
    { key: "angle", kind: "angle", label: "Direction" },
    { key: "distance", kind: "slider", label: "Offset", min: 0, max: 100, unit: "px" },
    { key: "blur", kind: "slider", label: "Blur", min: 0, max: 60, unit: "px" },
    { key: "opacity", kind: "slider", label: "Transparency", min: 0, max: 100, unit: "%" },
    { key: "color", kind: "color", label: "Colour" },
  ],
  defaults: { angle: -45, distance: 10, blur: 10, color: "#000000", opacity: 60 },
  renderBehind: (object, ctx, props, rc) => {
    const radians = (props.angle * Math.PI) / 180;
    drawSilhouettePass(object, ctx, rc.originalRender, {
      color: props.color,
      offsetX: Math.cos(radians) * props.distance,
      offsetY: Math.sin(radians) * props.distance,
      blurPx: props.blur,
      alpha: props.opacity / 100,
    });
  },
};
