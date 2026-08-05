import { FabricImage } from "fabric";
import type { ObjectTypeRegistry } from "@rifrocket/fdt-core";
import { MEDIA_FIELDS } from "./propertyFields";

export interface ImageObjectConfig {
  src: string;
  left?: number;
  top?: number;
  scaleX?: number;
  scaleY?: number;
}

const DEFAULT_MAX_DIMENSION = 400;

// No official image object type ships anywhere else in the framework (only the QR plugin uses
// FabricImage internally).
export function registerImageType(registry: ObjectTypeRegistry): void {
  registry.register<ImageObjectConfig>("image", {
    create: async (config) => {
      const image = await FabricImage.fromURL(config.src, { crossOrigin: "anonymous" });
      const scale = Math.min(1, DEFAULT_MAX_DIMENSION / Math.max(image.width, image.height));
      image.set({
        left: config.left ?? 100,
        top: config.top ?? 100,
        scaleX: config.scaleX ?? scale,
        scaleY: config.scaleY ?? scale,
        selectable: true,
        evented: true,
      });
      image.set("shapeKind", "image");
      return image;
    },
    propertyFields: MEDIA_FIELDS,
  });
}
