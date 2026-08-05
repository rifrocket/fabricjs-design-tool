import type { EffectDefinition } from "@rifrocket/fdt-core";
import { drawSilhouettePass } from "../../pipeline/silhouettePass";

export interface GlitchProps {
  strength: number;
}

export const glitchEffect: EffectDefinition<GlitchProps> = {
  id: "glitch",
  category: "creative",
  label: "Glitch",
  track: "compositing",
  schema: [{ key: "strength", kind: "slider", label: "Strength", min: 0, max: 100, unit: "%" }],
  defaults: { strength: 50 },
  // Two small, opposite-offset, saturated red/cyan copies blended with "screen" — a chromatic-
  // aberration-style channel split, cheap to compute since it's just two silhouette passes.
  renderBehind: (object, ctx, props, rc) => {
    const offset = (Number(props.strength ?? 50) / 100) * 12;
    drawSilhouettePass(object, ctx, rc.originalRender, {
      color: "#ff003c",
      offsetX: -offset,
      offsetY: 0,
      alpha: 0.75,
      compositeOp: "screen",
    });
    drawSilhouettePass(object, ctx, rc.originalRender, {
      color: "#00e5ff",
      offsetX: offset,
      offsetY: 0,
      alpha: 0.75,
      compositeOp: "screen",
    });
  },
};
