import { describe, expect, it } from "vitest";
import type { FabricObject } from "fabric";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { createPageBoundaryRect, findPageBoundary } from "./pageBoundary";

function createFakeEngine(objects: FabricObject[]): CanvasEngine {
  return { layers: { getObjects: () => objects } } as unknown as CanvasEngine;
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
