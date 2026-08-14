import { describe, expect, it, vi } from "vitest";
import type { FabricObject } from "fabric";
import { ObjectTypeRegistry } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { captureSnapshotExcludingBoundary, createPageBoundaryRect, findPageBoundary } from "./pageBoundary";

function createFakeEngine(
  objects: FabricObject[],
  toObject = vi.fn(() => ({ objects: [], background: "#abcdef" })),
): CanvasEngine {
  return {
    layers: { getObjects: () => objects },
    getFabricCanvas: () => ({ toObject, backgroundColor: "#abcdef" }),
    // captureSnapshot() (called by captureSnapshotExcludingBoundary) reads through
    // engine.renderer/engine.registry, not getFabricCanvas(), as of
    // FUTURE_IMPLEMENTATION.md Chunks 5.1/5.2 — reuses the same `toObject` mock for
    // exportSceneJSON so this file's existing assertions on it (called-with,
    // exclude-during-capture, throws) still exercise the real call path. An empty
    // ObjectTypeRegistry means serializeWithTypeOverrides never merges anything on top.
    renderer: { exportSceneJSON: toObject, getNodes: () => objects },
    registry: { objectTypes: new ObjectTypeRegistry() },
  } as unknown as CanvasEngine;
}

describe("createPageBoundaryRect", () => {
  it("creates a non-interactive rect at the origin sized to width/height", () => {
    const rect = createPageBoundaryRect({ width: 400, height: 300 });
    expect(rect.left).toBe(0);
    expect(rect.top).toBe(0);
    expect(rect.width).toBe(400);
    expect(rect.height).toBe(300);
    expect(rect.selectable).toBe(false);
    expect(rect.evented).toBe(false);
  });

  it("defaults fill to white when no backgroundColor is given", () => {
    expect(createPageBoundaryRect({ width: 10, height: 10 }).fill).toBe("#ffffff");
  });

  it("uses the given backgroundColor as fill", () => {
    expect(createPageBoundaryRect({ width: 10, height: 10, backgroundColor: "#123456" }).fill).toBe("#123456");
  });
});

describe("findPageBoundary", () => {
  it("returns undefined when no object is marked as the page boundary", () => {
    expect(findPageBoundary(createFakeEngine([]))).toBeUndefined();
  });

  it("finds the object created by createPageBoundaryRect among other objects", () => {
    const boundary = createPageBoundaryRect({ width: 10, height: 10 });
    const other = createPageBoundaryRect({ width: 5, height: 5 });
    other.set("isPageBoundary", false);
    const engine = createFakeEngine([other, boundary]);
    expect(findPageBoundary(engine)).toBe(boundary);
  });
});

describe("captureSnapshotExcludingBoundary", () => {
  it("excludes the boundary rect from export only for the duration of the capture, then restores it", () => {
    const boundary = createPageBoundaryRect({ width: 10, height: 10 });
    let excludeDuringCapture: boolean | undefined;
    const toObject = vi.fn(() => {
      excludeDuringCapture = boundary.excludeFromExport;
      return { objects: [] };
    });
    const engine = createFakeEngine([boundary], toObject);

    captureSnapshotExcludingBoundary(engine);

    expect(excludeDuringCapture).toBe(true);
    expect(boundary.excludeFromExport).toBeFalsy(); // restored to its (unset) prior value
  });

  it("preserves an already-true excludeFromExport instead of clobbering it to false afterward", () => {
    const boundary = createPageBoundaryRect({ width: 10, height: 10 });
    boundary.excludeFromExport = true;
    const engine = createFakeEngine([boundary]);

    captureSnapshotExcludingBoundary(engine);

    expect(boundary.excludeFromExport).toBe(true);
  });

  it("restores excludeFromExport even if the capture itself throws", () => {
    const boundary = createPageBoundaryRect({ width: 10, height: 10 });
    const toObject = vi.fn(() => {
      throw new Error("boom");
    });
    const engine = createFakeEngine([boundary], toObject);

    expect(() => captureSnapshotExcludingBoundary(engine)).toThrow("boom");
    expect(boundary.excludeFromExport).toBeFalsy();
  });

  it("works normally when there is no boundary rect at all", () => {
    const engine = createFakeEngine([]);
    const snapshot = captureSnapshotExcludingBoundary(engine);
    expect(snapshot.backgroundColor).toBe("#abcdef");
  });
});
