import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";
import { drawSilhouettePass } from "../../pipeline/silhouettePass";

export interface NeonProps {
  color: string;
  blur: number;
  intensity: number;
}

const GLOW_PASSES = 3;

export const neonEffect: EffectDefinition<NeonProps> = {
  id: "neon",
  category: "creative",
  label: "Neon",
  track: "compositing",
  schema: [
    { key: "blur", kind: "slider", label: "Blur", min: 0, max: 60, unit: "px" },
    { key: "intensity", kind: "slider", label: "Intensity", min: 0, max: 100, unit: "%" },
    { key: "color", kind: "color", label: "Colour" },
  ],
  defaults: { color: "#ff2ec4", blur: 18, intensity: 80 },
  renderBehind: (object, ctx, props, rc) => {
    for (let i = 0; i < GLOW_PASSES; i += 1) {
      const factor = (i + 1) / GLOW_PASSES;
      drawSilhouettePass(object, ctx, rc.originalRender, {
        color: props.color,
        blurPx: props.blur * factor,
        alpha: (props.intensity / 100) * (1 - i / GLOW_PASSES) * 0.7,
      });
    }
  },
  // A bright, tightly-blurred core stroke on top of the glow, evoking a lit neon tube.
  renderFront: (object, ctx, props, rc) => {
    drawSilhouettePass(object, ctx, rc.originalRender, {
      color: "#ffffff",
      blurPx: props.blur * 0.15,
      alpha: 0.9,
      compositeOp: "lighten",
    });
  },
};
