import type { FabricImage } from "fabric";

export interface CropRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

// Crops a FabricImage to a rectangle in the image's own (unscaled, source-pixel)
// coordinate space — Fabric renders only this sub-region of the source image.
export function cropImage(image: FabricImage, rect: CropRect): void {
  image.set({
    cropX: rect.left,
    cropY: rect.top,
    width: rect.width,
    height: rect.height,
  });
  image.setCoords();
}

export function resetCrop(image: FabricImage): void {
  const original = image.getOriginalSize();
  image.set({
    cropX: 0,
    cropY: 0,
    width: original.width as number,
    height: original.height as number,
  });
  image.setCoords();
}
