import { FabricImage } from "fabric";
import type { ObjectTypeRegistry } from "@rifrocket/fdt-core";
import { generateContentString } from "./content";
import { generateQRCodeSVG } from "./generator";
import { MEDIA_FIELDS } from "./propertyFields";
import type { QRCodeContentMap, QRCodeStyleOptions, QRContentType } from "./types";

export interface QRCodeObjectConfig {
  contentType: QRContentType;
  contentData: QRCodeContentMap[QRContentType];
  style?: QRCodeStyleOptions;
  left?: number;
  top?: number;
}

// Requires a real browser (qr-code-styling and FabricImage.fromURL both need `window`/
// `document`), same constraint as fabric.Text and fabric.Canvas noted elsewhere in core.
export function registerQRCodeType(registry: ObjectTypeRegistry): void {
  registry.register<QRCodeObjectConfig>("qrcode", {
    create: async (config) => {
      const content = generateContentString(config.contentType, config.contentData);
      const svg = await generateQRCodeSVG(content, config.style);
      const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
      const image = await FabricImage.fromURL(dataUrl);
      image.set({
        left: config.left ?? 100,
        top: config.top ?? 100,
        selectable: true,
        evented: true,
      });
      image.set("shapeKind", "qrcode");
      return image;
    },
    propertyFields: MEDIA_FIELDS,
  });
}
