import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { computeDistribution } from "./distribute";

function rect(left: number, width: number): Rect {
  return new Rect({ left, top: left, width, height: width, strokeWidth: 0 });
}

describe("computeDistribution", () => {
  it("returns nothing for fewer than 3 objects", () => {
    expect(computeDistribution([rect(0, 10), rect(50, 10)], "left")).toEqual([]);
  });

  it("equalizes the gap between adjacent edges, leaving the first and last untouched", () => {
    // edges: [0,10] [40,50] [90,100] -> span 0..100, total width 30, 2 gaps of 35 each
    const a = rect(0, 10);
    const b = rect(40, 10);
    const c = rect(90, 10);

    const result = computeDistribution([a, b, c], "left");

    expect(result).toEqual([{ object: b, value: 45 }]);
  });

  it("repositions every object strictly between the first and last", () => {
    const a = rect(0, 10);
    const b = rect(20, 10);
    const c = rect(40, 10);
    const d = rect(100, 10);

    const result = computeDistribution([a, b, c, d], "left");

    expect(result.map((r) => r.object)).toEqual([b, c]);
  });

  it("sorts by position first, so pre-sorted input order doesn't matter", () => {
    const a = rect(90, 10);
    const b = rect(0, 10);
    const c = rect(40, 10);

    const result = computeDistribution([a, b, c], "left");

    expect(result).toEqual([{ object: c, value: 45 }]);
  });

  it("accounts for scale when computing effective size", () => {
    const a = rect(0, 10);
    a.set("scaleX", 2); // effective width 20
    const b = rect(50, 10);
    const c = rect(100, 10); // edges: [0,20] [50,60] [100,110], total 40, span 110, gap 35

    const result = computeDistribution([a, b, c], "left");

    expect(result).toEqual([{ object: b, value: 55 }]);
  });
});
