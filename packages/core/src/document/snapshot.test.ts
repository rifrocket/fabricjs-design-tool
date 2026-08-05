import { describe, expect, it, vi } from "vitest";
import type { CanvasEngine } from "../engine/canvasEngine";
import { ID_PROPERTY } from "../engine/objectId";
import { getSerializedProperties } from "../engine/serializedProperties";
import { captureSnapshot, restoreSnapshot, renderSnapshotThumbnail } from "./snapshot";
import type { DocumentSnapshotData, OffscreenCanvas, OffscreenCanvasFactory } from "./snapshot";

function createFakeEngine(): CanvasEngine {
  const fabricCanvas = {
    toObject: vi.fn().mockReturnValue({ objects: [{ type: "rect", [ID_PROPERTY]: "obj_1" }] }),
    backgroundColor: "#123456" as string | undefined,
  };
  return {
    getFabricCanvas: vi.fn().mockReturnValue(fabricCanvas),
    setBackgroundColor: vi.fn(),
    importFile: vi.fn().mockResolvedValue(undefined),
  } as unknown as CanvasEngine;
}

describe("captureSnapshot", () => {
  it("reads the live canvas directly, including the object-id property", () => {
    const engine = createFakeEngine();

    const snapshot = captureSnapshot(engine);

    expect(engine.getFabricCanvas().toObject).toHaveBeenCalledWith(getSerializedProperties());
    expect(snapshot.backgroundColor).toBe("#123456");
    expect(snapshot.json).toEqual({ objects: [{ type: "rect", [ID_PROPERTY]: "obj_1" }] });
  });

  it("falls back to white when the canvas has no background color set", () => {
    const engine = createFakeEngine();
    (engine.getFabricCanvas() as unknown as { backgroundColor?: string }).backgroundColor = undefined;

    expect(captureSnapshot(engine).backgroundColor).toBe("#ffffff");
  });
});

describe("restoreSnapshot", () => {
  const snapshot: DocumentSnapshotData = { json: { objects: [] }, backgroundColor: "#fff" };

  it("recolors and imports through engine.importFile('json', ...), without touching canvas dimensions", async () => {
    const engine = createFakeEngine();

    await restoreSnapshot(engine, snapshot);

    expect(engine.setBackgroundColor).toHaveBeenCalledWith("#fff");
    expect(engine.importFile).toHaveBeenCalledWith("json", snapshot.json);
  });

  it("recolors before importing, in that order", async () => {
    const engine = createFakeEngine();
    const order: string[] = [];
    vi.mocked(engine.setBackgroundColor).mockImplementation(() => {
      order.push("setBackgroundColor");
    });
    vi.mocked(engine.importFile).mockImplementation(async () => {
      order.push("importFile");
    });

    await restoreSnapshot(engine, snapshot);

    expect(order).toEqual(["setBackgroundColor", "importFile"]);
  });
});

describe("renderSnapshotThumbnail", () => {
  function createFakeOffscreenCanvas(): OffscreenCanvas {
    return {
      loadFromJSON: vi.fn().mockResolvedValue(undefined),
      renderAll: vi.fn(),
      toDataURL: vi.fn().mockReturnValue("data:image/png;base64,thumb"),
      dispose: vi.fn(),
    };
  }

  it("loads, renders, exports, and disposes an injected offscreen canvas using caller-supplied dimensions", async () => {
    const canvas = createFakeOffscreenCanvas();
    const factory: OffscreenCanvasFactory = vi.fn().mockReturnValue(canvas);
    const snapshot: DocumentSnapshotData = { json: { objects: [] }, backgroundColor: "#fff" };

    const dataUrl = await renderSnapshotThumbnail(snapshot, { width: 800, height: 400 }, {}, factory);

    expect(factory).toHaveBeenCalledWith(800, 400, "#fff");
    expect(canvas.loadFromJSON).toHaveBeenCalledWith(snapshot.json);
    expect(canvas.renderAll).toHaveBeenCalled();
    expect(canvas.dispose).toHaveBeenCalled();
    expect(dataUrl).toBe("data:image/png;base64,thumb");
  });

  it("computes the multiplier from maxDimension relative to the larger of width/height", async () => {
    const canvas = createFakeOffscreenCanvas();
    const factory: OffscreenCanvasFactory = vi.fn().mockReturnValue(canvas);
    const snapshot: DocumentSnapshotData = { json: {}, backgroundColor: "#fff" };

    await renderSnapshotThumbnail(snapshot, { width: 800, height: 400 }, { maxDimension: 200 }, factory);

    expect(canvas.toDataURL).toHaveBeenCalledWith({ format: "png", multiplier: 0.25 });
  });

  it("defaults maxDimension to 240 when not specified", async () => {
    const canvas = createFakeOffscreenCanvas();
    const factory: OffscreenCanvasFactory = vi.fn().mockReturnValue(canvas);
    const snapshot: DocumentSnapshotData = { json: {}, backgroundColor: "#fff" };

    await renderSnapshotThumbnail(snapshot, { width: 480, height: 480 }, {}, factory);

    expect(canvas.toDataURL).toHaveBeenCalledWith({ format: "png", multiplier: 0.5 });
  });
});
