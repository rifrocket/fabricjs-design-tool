import QRCodeStyling from "qr-code-styling";
import type { QRCodeStyleOptions } from "./types";

// jsdom's Blob (unlike every evergreen browser's) doesn't implement the `.text()` method, so
// reading qr-code-styling's Blob output needs a FileReader fallback to work under jsdom-based
// tests as well as real browsers.
function blobToText(blob: Blob): Promise<string> {
  if (typeof blob.text === "function") return blob.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

// Renders a QR code encoding `content` to an SVG string using qr-code-styling. Each option
// group is merged over sane defaults (options win) so callers can override just the parts they
// care about — e.g. only `dotsOptions.gradient` — without having to repeat the rest of the group.
export async function generateQRCodeSVG(content: string, options: QRCodeStyleOptions = {}): Promise<string> {
  const size = options.size ?? 200;

  const qrCode = new QRCodeStyling({
    width: size,
    height: size,
    type: "svg",
    data: content,
    margin: options.margin ?? 10,
    shape: options.shape ?? "square",
    qrOptions: { errorCorrectionLevel: "Q", ...options.qrOptions },
    dotsOptions: { color: "#000000", type: "square", ...options.dotsOptions },
    cornersSquareOptions: { color: "#000000", type: "square", ...options.cornersSquareOptions },
    cornersDotOptions: { color: "#000000", type: "square", ...options.cornersDotOptions },
    backgroundOptions: { color: "#ffffff", ...options.backgroundOptions },
    ...(options.image
      ? {
          image: options.image,
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.3,
            margin: 8,
            crossOrigin: "anonymous",
            ...options.imageOptions,
          },
        }
      : {}),
  });

  const rawData = await qrCode.getRawData("svg");
  if (!rawData) {
    throw new Error("Failed to generate QR code");
  }
  return rawData instanceof Blob ? blobToText(rawData) : rawData.toString();
}
