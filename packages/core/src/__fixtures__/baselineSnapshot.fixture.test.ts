import { describe, expect, it, vi } from "vitest";
import type { CanvasEngine } from "../engine/canvasEngine";
import { restoreSnapshot } from "../document/snapshot";
import type { DocumentSnapshotData } from "../document/snapshot";
import { ObjectTypeRegistry } from "../plugin/objectTypeRegistry";
import baselineSnapshot from "./baseline-snapshot.json";

// Chunk 0.2 of FUTURE_IMPLEMENTATION.md: a snapshot captured from real Fabric objects
// (Rect/Circle/Image, matching plugin-shapes-basic/plugin-image) using today's — pre-refactor —
// captureSnapshot() serialization shape. Every later chunk's "old documents still load
// unchanged" claim gets checked against this fixture, not asserted from memory.
function createFakeEngine(): CanvasEngine {
  return {
    setBackgroundColor: vi.fn(),
    importFile: vi.fn().mockResolvedValue(undefined),
    // restoreSnapshot() also runs applyDeserializeOverrides() as of Chunk 5.2 — a no-op here
    // since no live nodes/registered types are involved in this mock, exactly the
    // no-type-opted-in behavior that keeps this fixture's expected shape unchanged.
    renderer: { getNodes: vi.fn().mockReturnValue([]) },
    registry: { objectTypes: new ObjectTypeRegistry() },
  } as unknown as CanvasEngine;
}

describe("baseline-snapshot.json fixture", () => {
  const snapshot = baselineSnapshot as DocumentSnapshotData;

  it("has the expected object count and types", () => {
    const objects = snapshot.json.objects as Array<Record<string, unknown>>;
    expect(objects).toHaveLength(3);
    expect(objects.map((object) => object.type)).toEqual(["Rect", "Circle", "Image"]);
    expect(objects.map((object) => object.fdtId)).toEqual(["obj_1", "obj_2", "obj_3"]);
  });

  it("restoreSnapshot() reproduces it via the current engine.setBackgroundColor/importFile contract", async () => {
    const engine = createFakeEngine();

    await restoreSnapshot(engine, snapshot);

    expect(engine.setBackgroundColor).toHaveBeenCalledWith(snapshot.backgroundColor);
    expect(engine.importFile).toHaveBeenCalledWith("json", snapshot.json);
  });
});
