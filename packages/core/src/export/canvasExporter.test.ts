import { describe, expect, it, vi } from "vitest";
import type { Canvas } from "fabric";
import { CanvasExporter } from "./canvasExporter";
import { ID_PROPERTY } from "../engine/objectId";
import { getSerializedProperties } from "../engine/serializedProperties";

function createFakeCanvas(overrides: Partial<Canvas> = {}): Canvas {
  return {
    toDataURL: vi.fn().mockReturnValue("data:image/png;base64,fake"),
    toSVG: vi.fn().mockReturnValue("<svg></svg>"),
    toObject: vi.fn().mockReturnValue({ objects: [{ type: "rect", [ID_PROPERTY]: "obj_1" }] }),
    // exportJSON() now also reads getObjects() (serializeWithTypeOverrides matches it
    // index-wise against toObject()'s objects[]) — empty here since these tests exercise the
    // no-registered-type-overrides path (CanvasExporter's default, empty ObjectTypeRegistry).
    getObjects: vi.fn().mockReturnValue([]),
    ...overrides,
  } as unknown as Canvas;
}

describe("CanvasExporter", () => {
  it("exportJSON serializes via canvas.toObject(), including the object-id property", () => {
    const canvas = createFakeCanvas();
    const exporter = new CanvasExporter(canvas);

    const result = exporter.export("json");

    expect(canvas.toObject).toHaveBeenCalledWith(getSerializedProperties());
    expect(result.format).toBe("json");
    expect(result.mimeType).toBe("application/json");
    const parsed = JSON.parse(result.data as string);
    expect(parsed.objects[0][ID_PROPERTY]).toBe("obj_1");
  });

  it("exportPNG delegates to canvas.toDataURL and is unaffected by the toObject() change", () => {
    const canvas = createFakeCanvas();
    const exporter = new CanvasExporter(canvas);

    const result = exporter.export("png");

    expect(canvas.toDataURL).toHaveBeenCalledWith({ format: "png", quality: 1, multiplier: 2 });
    expect(result.format).toBe("png");
    expect(result.mimeType).toBe("image/png");
  });

  it("exportJPEG delegates to canvas.toDataURL and is unaffected by the toObject() change", () => {
    const canvas = createFakeCanvas();
    const exporter = new CanvasExporter(canvas);

    const result = exporter.export("jpeg");

    expect(canvas.toDataURL).toHaveBeenCalledWith({ format: "jpeg", quality: 0.95, multiplier: 2 });
    expect(result.mimeType).toBe("image/jpeg");
  });

  it("exportSVG delegates to canvas.toSVG and is unaffected by the toObject() change", () => {
    const canvas = createFakeCanvas();
    const exporter = new CanvasExporter(canvas);

    const result = exporter.export("svg");

    expect(canvas.toSVG).toHaveBeenCalled();
    expect(result.data).toBe("<svg></svg>");
    expect(result.mimeType).toBe("image/svg+xml");
  });
});
