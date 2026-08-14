import { Rect } from "fabric";
import { describe, expect, it } from "vitest";
import type { SceneNode } from "./sceneNode";

// FabricObject already satisfies SceneNode's structural shape with zero adapter code — the
// whole point of Chunk 1.1 (FUTURE_IMPLEMENTATION.md). Using a real fabric.Rect here rather
// than importing a plugin package (e.g. plugin-shapes-basic), since packages/core must not
// depend on any plugin package — plugins depend on core, never the reverse.
describe("SceneNode", () => {
  it("is satisfied structurally by a real FabricObject, with no adapter", () => {
    const rect = new Rect({ left: 0, top: 0, width: 10, height: 10 });
    const node: SceneNode = rect;

    node.set("left", 42);
    expect(node.get("left")).toBe(42);
  });
});
