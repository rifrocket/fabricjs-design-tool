import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";
import { drawSilhouettePass } from "../../pipeline/silhouettePass";

export interface InnerShadowProps {
  angle: number;
  distance: number;
  blur: number;
  color: string;
  opacity: number;
}

export const innerShadowEffect: EffectDefinition<InnerShadowProps> = {
  id: "inner-shadow",
  category: "basic",
  label: "Inner Shadow",
  track: "compositing",
  schema: [
    { key: "angle", kind: "angle", label: "Direction" },
    { key: "distance", kind: "slider", label: "Offset", min: 0, max: 40, unit: "px" },
    { key: "blur", kind: "slider", label: "Blur", min: 0, max: 40, unit: "px" },
    { key: "opacity", kind: "slider", label: "Transparency", min: 0, max: 100, unit: "%" },
    { key: "color", kind: "color", label: "Colour" },
  ],
  defaults: { angle: -45, distance: 6, blur: 8, color: "#000000", opacity: 60 },
  // Clips the shadow pass to whatever is already opaque on the canvas via "source-atop" — since
  // this runs as a front pass after the object's own base render, that's this object's own
  // silhouette in the common case. Objects overlapping earlier-drawn siblings on the shared
  // canvas can bleed into that pass instead — a known limitation of compositing directly against
  // one shared context rather than an isolated per-object buffer.
  renderFront: (object, ctx, props, rc) => {
    const radians = (props.angle * Math.PI) / 180;
    drawSilhouettePass(object, ctx, rc.originalRender, {
      color: props.color,
      offsetX: Math.cos(radians) * props.distance,
      offsetY: Math.sin(radians) * props.distance,
      blurPx: props.blur,
      alpha: props.opacity / 100,
      compositeOp: "source-atop",
    });
  },
};
