import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";
import { drawSilhouettePass } from "../../pipeline/silhouettePass";

export interface GlowProps {
  color: string;
  blur: number;
  intensity: number;
}

const PASSES = 3;

export const glowEffect: EffectDefinition<GlowProps> = {
  id: "glow",
  category: "basic",
  label: "Glow",
  track: "compositing",
  schema: [
    { key: "blur", kind: "slider", label: "Blur", min: 0, max: 60, unit: "px" },
    { key: "intensity", kind: "slider", label: "Intensity", min: 0, max: 100, unit: "%" },
    { key: "color", kind: "color", label: "Colour" },
  ],
  defaults: { color: "#8b5cf6", blur: 20, intensity: 70 },
  renderBehind: (object, ctx, props, rc) => {
    for (let i = 0; i < PASSES; i += 1) {
      const factor = (i + 1) / PASSES;
      drawSilhouettePass(object, ctx, rc.originalRender, {
        color: props.color,
        blurPx: props.blur * factor,
        alpha: (props.intensity / 100) * (1 - i / PASSES) * 0.6,
      });
    }
  },
};
