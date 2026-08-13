import type { Canvas, FabricObject } from "fabric";
import { getSerializedProperties } from "../engine/serializedProperties";
import { ObjectTypeRegistry } from "../plugin/objectTypeRegistry";
import { serializeWithTypeOverrides } from "../document/objectTypeSerialization";

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
  // registry defaults to a fresh, empty ObjectTypeRegistry so every existing
  // `new CanvasExporter(canvas)` call site (no second argument) behaves byte-identically to
  // before Chunk 5.2 — an empty registry has no serialize() overrides to apply, so exportJSON()
  // falls through to plain canvas.toObject() output unchanged.
  constructor(
    private readonly canvas: Canvas,
    private readonly registry: ObjectTypeRegistry<FabricObject> = new ObjectTypeRegistry(),
  ) {}

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
    const sceneSource = {
      exportSceneJSON: (extraProps?: string[]) => this.canvas.toObject(extraProps) as Record<string, unknown>,
      getNodes: () => this.canvas.getObjects(),
    };
    const json = serializeWithTypeOverrides(sceneSource, this.registry, getSerializedProperties());
    const data = JSON.stringify(json, null, 2);
    return { format: "json", fileName: this.fileName("json"), mimeType: "application/json", data };
  }
}
