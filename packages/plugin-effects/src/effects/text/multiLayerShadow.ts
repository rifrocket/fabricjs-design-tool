import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";
import { drawSilhouettePass } from "../../pipeline/silhouettePass";

export interface MultiLayerShadowProps {
  angle: number;
  distance: number;
  blur: number;
  color: string;
  opacity: number;
}

// Three fixed sub-shadow layers at increasing distance/blur/fade, scaled together by the
// instance's own props — a one-click stylized look. Stacking multiple ordinary Shadow instances
// already achieves an equivalent result via the generic effect stack; this is a convenience
// preset for that same technique, not a new rendering primitive.
const LAYERS = [
  { distanceFactor: 1, blurFactor: 1, alpha: 0.5 },
  { distanceFactor: 2, blurFactor: 1.6, alpha: 0.3 },
  { distanceFactor: 3.2, blurFactor: 2.4, alpha: 0.18 },
];

export const multiLayerShadowEffect: EffectDefinition<MultiLayerShadowProps> = {
  id: "multi-layer-shadow",
  category: "text",
  label: "Multi-layer Shadow",
  track: "compositing",
  schema: [
    { key: "angle", kind: "angle", label: "Direction" },
    { key: "distance", kind: "slider", label: "Offset", min: 0, max: 40, unit: "px" },
    { key: "blur", kind: "slider", label: "Blur", min: 0, max: 30, unit: "px" },
    { key: "opacity", kind: "slider", label: "Transparency", min: 0, max: 100, unit: "%" },
    { key: "color", kind: "color", label: "Colour" },
  ],
  defaults: { angle: -45, distance: 8, blur: 6, color: "#000000", opacity: 100 },
  renderBehind: (object, ctx, props, rc) => {
    const radians = (props.angle * Math.PI) / 180;
    for (const layer of LAYERS) {
      drawSilhouettePass(object, ctx, rc.originalRender, {
        color: props.color,
        offsetX: Math.cos(radians) * props.distance * layer.distanceFactor,
        offsetY: Math.sin(radians) * props.distance * layer.distanceFactor,
        blurPx: props.blur * layer.blurFactor,
        alpha: layer.alpha * (props.opacity / 100),
      });
    }
  },
};
