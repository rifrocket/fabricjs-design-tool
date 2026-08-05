import type { FabricObject } from "fabric";

export interface SilhouettePassOptions {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  blurPx?: number;
  alpha?: number;
  compositeOp?: GlobalCompositeOperation;
}

// Draws one solid-color, offset, optionally-blurred copy of the object's own shape — the same
// fill/stroke-swap trick Fabric's own drawObject(ctx, forClipping) uses to render a clip mask,
// reused here so shadow/glow/echo/glitch/outline passes work generically across any object
// type's own _render (Rect, Text, Path, Group...) without a type-specific implementation.
export function drawSilhouettePass(
  object: FabricObject,
  ctx: CanvasRenderingContext2D,
  originalRender: (ctx: CanvasRenderingContext2D) => void,
  options: SilhouettePassOptions,
): void {
  const { color, offsetX = 0, offsetY = 0, blurPx = 0, alpha = 1, compositeOp = "source-over" } = options;

  ctx.save();
  ctx.shadowColor = "transparent";
  ctx.translate(offsetX, offsetY);
  ctx.filter = blurPx > 0 ? `blur(${blurPx}px)` : "none";
  ctx.globalAlpha = ctx.globalAlpha * alpha;
  ctx.globalCompositeOperation = compositeOp;

  const previousFill = object.fill;
  const previousStroke = object.stroke;
  if (color) {
    object.fill = color;
    if (previousStroke) object.stroke = color;
    // fill/stroke are assigned directly rather than via object.set(), so Fabric's own dirty
    // tracking never sees this change — without forcing it, an already-cached object skips
    // _render() entirely and originalRender() below just redraws the stale (pre-swap) pixels.
    object.dirty = true;
  }
  try {
    originalRender(ctx);
  } finally {
    object.fill = previousFill;
    object.stroke = previousStroke;
  }

  ctx.restore();
}
