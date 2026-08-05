import { FabricImage } from "fabric";
import type { CanvasEngine } from "./canvasEngine";

export interface ImageTransform {
  left?: number;
  top?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  flipX?: boolean;
  flipY?: boolean;
}

// Pure: which transform properties carry over from the old image to its replacement.
export function extractImageTransform(image: FabricImage): ImageTransform {
  return {
    left: image.left,
    top: image.top,
    scaleX: image.scaleX,
    scaleY: image.scaleY,
    angle: image.angle,
    flipX: image.flipX,
    flipY: image.flipY,
  };
}

// Swaps an image's source while preserving its position/scale/rotation, through the
// history-tracked add/remove path so the swap itself is undoable.
export async function replaceImage(engine: CanvasEngine, image: FabricImage, src: string): Promise<FabricImage> {
  const transform = extractImageTransform(image);
  const replacement = await FabricImage.fromURL(src);
  replacement.set(transform);
  engine.removeObject(image);
  engine.addObject(replacement);
  return replacement;
}
