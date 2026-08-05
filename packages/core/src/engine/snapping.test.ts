import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { findSnapCandidates, getClosestValue, getObjectCoords, isWithinThreshold } from "./snapping";

// strokeWidth defaults to 1 on a Fabric object and is included in getBoundingRect(),
// which shifts edges by half a pixel. Fix it at 0 so the fixtures below have exact geometry.
function testRect(options: ConstructorParameters<typeof Rect>[0]): Rect {
  return new Rect({ strokeWidth: 0, ...options });
}

describe("getObjectCoords", () => {
  it("derives corner and center points from a real object's bounding rect", () => {
    const rect = testRect({ left: 10, top: 20, width: 100, height: 50 });

    const coords = getObjectCoords(rect);

    expect(coords.tl).toEqual({ x: 10, y: 20 });
    expect(coords.tr).toEqual({ x: 110, y: 20 });
    expect(coords.bl).toEqual({ x: 10, y: 70 });
    expect(coords.br).toEqual({ x: 110, y: 70 });
    expect(coords.center).toEqual({ x: 60, y: 45 });
  });
});

describe("isWithinThreshold", () => {
  it("is true when the difference is within the threshold, inclusive", () => {
    expect(isWithinThreshold(100, 104, 4)).toBe(true);
    expect(isWithinThreshold(100, 106, 4)).toBe(false);
  });
});

describe("getClosestValue", () => {
  it("returns null for an empty candidate list", () => {
    expect(getClosestValue(50, [])).toBeNull();
  });

  it("returns the candidate nearest to the value", () => {
    expect(getClosestValue(50, [10, 48, 90])).toBe(48);
  });
});

describe("findSnapCandidates", () => {
  it("snaps to a sibling object's left edge when within threshold", () => {
    // Wide enough that only its top-left corner lands near the sibling's top-left,
    // so exactly one point pairing matches and the result is unambiguous.
    const moving = testRect({ left: 101, top: 0, width: 200, height: 50 });
    const sibling = testRect({ left: 100, top: 200, width: 50, height: 50 });

    const result = findSnapCandidates(
      getObjectCoords(moving),
      [getObjectCoords(sibling)],
      { width: 800, height: 600 },
      4,
    );

    // deltaX is resolved against the point that actually matched (the left edge, 101 -> 100),
    // not the object's center — applying it must move the matched edge exactly onto the
    // target, which is the whole point of the fix this pins down.
    expect(result.deltaX).toBe(-1);
    expect(moving.left! + result.deltaX!).toBe(sibling.left);
    expect(result.verticalGuides).toHaveLength(1);
  });

  it("returns exactly one guide per axis even when several points would coincidentally match", () => {
    // An axis-aligned box only has 3 distinct positions per axis (edge/center/edge) — tl and bl
    // share an X, tr and br share an X — so a moving object placed to match a sibling on every
    // axis at once must still produce exactly one vertical and one horizontal guide, not one
    // per redundant corner pairing (the "too many lines" bug).
    const moving = testRect({ left: 100, top: 100, width: 50, height: 50 });
    const sibling = testRect({ left: 100, top: 100, width: 50, height: 50 });

    const result = findSnapCandidates(
      getObjectCoords(moving),
      [getObjectCoords(sibling)],
      { width: 800, height: 600 },
      4,
    );

    expect(result.verticalGuides).toHaveLength(1);
    expect(result.horizontalGuides).toHaveLength(1);
  });

  it("picks the single closest match across multiple nearby objects, not every match within threshold", () => {
    const moving = testRect({ left: 102, top: 0, width: 50, height: 50 });
    const farther = testRect({ left: 100, top: 200, width: 50, height: 50 }); // distance 2
    const closer = testRect({ left: 103, top: 400, width: 50, height: 50 }); // distance 1

    const result = findSnapCandidates(
      getObjectCoords(moving),
      [getObjectCoords(farther), getObjectCoords(closer)],
      { width: 800, height: 600 },
      4,
    );

    expect(result.deltaX).toBe(1); // 103 - 102, the closer match, not 100 - 102
    expect(result.verticalGuides).toHaveLength(1);
    expect(result.verticalGuides[0].x).toBe(103);
  });

  it("snaps to the canvas center when the moving object's center is close to it", () => {
    const moving = testRect({ left: 399, top: 0, width: 2, height: 2 });

    const result = findSnapCandidates(getObjectCoords(moving), [], { width: 800, height: 600 }, 4);

    expect(result.deltaX).toBe(0);
  });

  it("returns null deltas when nothing is within threshold", () => {
    const moving = testRect({ left: 5, top: 5, width: 10, height: 10 });
    const sibling = testRect({ left: 500, top: 500, width: 10, height: 10 });

    const result = findSnapCandidates(
      getObjectCoords(moving),
      [getObjectCoords(sibling)],
      { width: 800, height: 600 },
      4,
    );

    expect(result.deltaX).toBeNull();
    expect(result.deltaY).toBeNull();
    expect(result.verticalGuides).toHaveLength(0);
    expect(result.horizontalGuides).toHaveLength(0);
  });
});
