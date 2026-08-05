import { createLinearGradient } from "@rifrocket/fabricjs-design-tool";
import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";

export interface GradientFillProps {
  colorStart: string;
  colorEnd: string;
  angle: number;
}

export const gradientFillEffect: EffectDefinition<GradientFillProps> = {
  id: "gradient-fill",
  category: "text",
  label: "Gradient Fill",
  track: "compositing",
  schema: [
    { key: "colorStart", kind: "color", label: "Start colour" },
    { key: "colorEnd", kind: "color", label: "End colour" },
    { key: "angle", kind: "angle", label: "Direction" },
  ],
  defaults: { colorStart: "#6d28d9", colorEnd: "#ec4899", angle: 45 },
  // Swaps the object's own fill for a real fabric Gradient (percentage-based, so it adapts to
  // the object's own size) for the duration of the render — reuses Fabric's native gradient
  // painting rather than manually computing a bounding box and clipping a rect.
  wrapRender: (object, _ctx, props, next) => {
    const previousFill = object.fill;
    object.fill = createLinearGradient(
      [
        { offset: 0, color: props.colorStart },
        { offset: 1, color: props.colorEnd },
      ],
      props.angle,
    );
    // Assigning fill directly bypasses Fabric's own dirty tracking (object.set() would trigger
    // it), so an already-cached object would otherwise skip _render() and next() would just
    // redraw the stale, pre-gradient cached bitmap.
    object.dirty = true;
    try {
      next();
    } finally {
      object.fill = previousFill;
    }
  },
};
