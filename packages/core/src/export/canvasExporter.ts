import type { Canvas } from "fabric";
import { getSerializedProperties } from "../engine/serializedProperties";

export type ExportFormat = "png" | "jpeg" | "svg" | "json";

// SVG export note: canvas.toSVG() never runs through the object-effects rendering pipeline
// (@rifrocket/fdt-plugin-effects patches FabricObject.prototype._render, a separate code path
// from Fabric's toSVG() serialization), so effects from that plugin are omitted from SVG
// output. PNG/JPEG are unaffected since they rasterize the real, already-rendered pixels.

export interface ExportResult {
  format: ExportFormat;
  fileName: string;
  mimeType: string;
  data: string | Blob;
}

// Renders the canvas to PNG/JPEG/SVG/JSON and returns the raw data. Triggering a browser
// download from that data is a UI concern, not core's. PDF export lives in
// @rifrocket/fdt-plugin-export-pdf instead of here — it pulls in jsPDF as a hard dependency,
// which most editors never need.
export class CanvasExporter {
  constructor(private readonly canvas: Canvas) {}

  export(format: ExportFormat): ExportResult {
    switch (format) {
      case "png":
        return this.exportPNG();
      case "jpeg":
        return this.exportJPEG();
      case "svg":
        return this.exportSVG();
      case "json":
        return this.exportJSON();
    }
  }

  private fileName(extension: string): string {
    return `canvas-export-${Date.now()}.${extension}`;
  }

  private exportPNG(): ExportResult {
    const data = this.canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });
    return { format: "png", fileName: this.fileName("png"), mimeType: "image/png", data };
  }

  private exportJPEG(): ExportResult {
    const data = this.canvas.toDataURL({ format: "jpeg", quality: 0.95, multiplier: 2 });
    return { format: "jpeg", fileName: this.fileName("jpg"), mimeType: "image/jpeg", data };
  }

  private exportSVG(): ExportResult {
    const data = this.canvas.toSVG();
    return { format: "svg", fileName: this.fileName("svg"), mimeType: "image/svg+xml", data };
  }

  private exportJSON(): ExportResult {
    const data = JSON.stringify(this.canvas.toObject(getSerializedProperties()), null, 2);
    return { format: "json", fileName: this.fileName("json"), mimeType: "application/json", data };
  }
}
