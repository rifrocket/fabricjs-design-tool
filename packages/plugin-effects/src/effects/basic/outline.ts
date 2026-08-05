import type { EffectDefinition } from "@rifrocket/fabricjs-design-tool";
import { drawSilhouettePass } from "../../pipeline/silhouettePass";

export interface OutlineProps {
  color: string;
  width: number;
}

const MIN_RING_STEPS = 16;
const MAX_RING_STEPS = 128;
// Upper bound on the gap between two consecutive copies around the ring, in canvas px — kept
// under ~2px so the copies visually fuse into one continuous band instead of reading as discrete
// offset duplicates.
const RING_SAMPLE_SPACING_PX = 1.5;

// A fixed step count only samples the dilation circle densely enough at the radius it was tuned
// for (16 steps ≈ 1.6px apart at width 4, the old default) — at larger widths the same 16 steps
// spread further apart (e.g. ~11.8px apart at width 30, the slider's max) and the union stops
// looking like a ring: on a simple filled shape the corners facet into a visible polygon instead
// of a smooth curve, and on thin/disjoint shapes like text glyphs the copies separate into a
// visible multi-copy "echo" instead of a solid outline. Scaling the step count with the circle's
// own circumference keeps the gap roughly constant regardless of width.
export function ringStepsFor(width: number): number {
  const circumference = 2 * Math.PI * Math.max(0, width);
  const steps = Math.ceil(circumference / RING_SAMPLE_SPACING_PX);
  return Math.min(MAX_RING_STEPS, Math.max(MIN_RING_STEPS, steps));
}

export const outlineEffect: EffectDefinition<OutlineProps> = {
  id: "outline",
  category: "basic",
  label: "Outline",
  track: "compositing",
  schema: [
    { key: "width", kind: "slider", label: "Width", min: 1, max: 30, unit: "px" },
    { key: "color", kind: "color", label: "Colour" },
  ],
  defaults: { color: "#000000", width: 4 },
  // Dilates into a solid ring by drawing the silhouette offset around a full circle at radius =
  // width; the object's own normal render (drawn immediately after, by the base pass) sits on
  // top, so only the ring outside the object's own edge remains visible.
  renderBehind: (object, ctx, props, rc) => {
    const steps = ringStepsFor(props.width);
    for (let i = 0; i < steps; i += 1) {
      const angle = (i / steps) * Math.PI * 2;
      drawSilhouettePass(object, ctx, rc.originalRender, {
        color: props.color,
        offsetX: Math.cos(angle) * props.width,
        offsetY: Math.sin(angle) * props.width,
        alpha: 1,
      });
    }
  },
};
