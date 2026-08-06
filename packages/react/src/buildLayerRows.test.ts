import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { getObjectId } from "@rifrocket/fabricjs-design-tool";
import { buildLayerRows } from "./buildLayerRows";

describe("buildLayerRows", () => {
  it("derives typeId, visibility, lock state, and selection for each object", () => {
    const rect = new Rect();
    rect.set("visible", false);
    rect.set({ lockMovementX: true, lockMovementY: true });

    const rows = buildLayerRows([rect], [getObjectId(rect)]);

    expect(rows).toEqual([
      { id: getObjectId(rect), typeId: "rect", visible: false, locked: true, selected: true, object: rect },
    ]);
  });

  it("defaults to visible and unlocked when the object doesn't say otherwise", () => {
    const rect = new Rect();

    const [row] = buildLayerRows([rect], []);

    expect(row.visible).toBe(true);
    expect(row.locked).toBe(false);
    expect(row.selected).toBe(false);
  });

  it("marks locked only when both movement axes are locked", () => {
    const rect = new Rect();
    rect.set("lockMovementX", true);

    const [row] = buildLayerRows([rect], []);

    expect(row.locked).toBe(false);
  });

  it("preserves the input object order", () => {
    const a = new Rect();
    const b = new Rect();

    const rows = buildLayerRows([a, b], []);

    expect(rows.map((r) => r.object)).toEqual([a, b]);
  });
});
