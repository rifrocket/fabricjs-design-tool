import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";
import { drawSilhouettePass } from "../../pipeline/silhouettePass";

export interface EchoProps {
  angle: number;
  distance: number;
  count: number;
  opacity: number;
}

export const echoEffect: EffectDefinition<EchoProps> = {
  id: "echo",
  category: "creative",
  label: "Echo",
  track: "compositing",
  schema: [
    { key: "angle", kind: "angle", label: "Direction" },
    { key: "distance", kind: "slider", label: "Offset", min: 0, max: 60, unit: "px" },
    { key: "count", kind: "slider", label: "Copies", min: 1, max: 6, step: 1 },
    { key: "opacity", kind: "slider", label: "Transparency", min: 0, max: 100, unit: "%" },
  ],
  defaults: { angle: 45, distance: 10, count: 3, opacity: 60 },
  // No color override — the copies keep the object's own fill/stroke, echoing its appearance
  // rather than recoloring it, unlike Shadow/Glow/Outline.
  renderBehind: (object, ctx, props, rc) => {
    const radians = (props.angle * Math.PI) / 180;
    const count = Math.max(1, Math.round(props.count));
    for (let i = count; i >= 1; i -= 1) {
      drawSilhouettePass(object, ctx, rc.originalRender, {
        offsetX: Math.cos(radians) * props.distance * i,
        offsetY: Math.sin(radians) * props.distance * i,
        alpha: (props.opacity / 100) * (1 - i / (count + 1)),
      });
    }
  },
};
