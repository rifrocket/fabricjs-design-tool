import { describe, expect, it } from "vitest";
import { computeRulerTicks } from "./ruler";

describe("computeRulerTicks", () => {
  it("returns nothing for a non-positive zoom or length", () => {
    expect(computeRulerTicks({ length: 600, zoom: 0, pan: 0 })).toEqual([]);
    expect(computeRulerTicks({ length: 0, zoom: 1, pan: 0 })).toEqual([]);
  });

  it("keeps every tick's screen position within the ruler's length", () => {
    const ticks = computeRulerTicks({ length: 600, zoom: 1, pan: 0 });
    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks) {
      expect(tick.position).toBeGreaterThanOrEqual(0);
      expect(tick.position).toBeLessThanOrEqual(600);
    }
  });

  it("spaces consecutive ticks evenly", () => {
    const ticks = computeRulerTicks({ length: 600, zoom: 1, pan: 0 });
    const gaps = new Set<number>();
    for (let i = 1; i < ticks.length; i += 1) {
      gaps.add(Math.round((ticks[i].position - ticks[i - 1].position) * 1000) / 1000);
    }
    expect(gaps.size).toBe(1);
  });

  it("marks every fifth tick as major by default", () => {
    const ticks = computeRulerTicks({ length: 600, zoom: 1, pan: 0 });
    const majors = ticks.filter((t) => t.isMajor);
    // every 5th tick, so roughly a fifth of them (allow off-by-one from the boundary)
    expect(majors.length).toBeGreaterThanOrEqual(Math.floor(ticks.length / 5) - 1);
    expect(majors.length).toBeLessThanOrEqual(Math.ceil(ticks.length / 5) + 1);
  });

  it("shows fewer, more widely spaced document values as zoom decreases", () => {
    const zoomedIn = computeRulerTicks({ length: 600, zoom: 4, pan: 0 });
    const zoomedOut = computeRulerTicks({ length: 600, zoom: 0.25, pan: 0 });
    const spacingIn = zoomedIn[1].value - zoomedIn[0].value;
    const spacingOut = zoomedOut[1].value - zoomedOut[0].value;
    expect(spacingOut).toBeGreaterThan(spacingIn);
  });

  it("shifts tick values (but not spacing) when panned", () => {
    const unpanned = computeRulerTicks({ length: 600, zoom: 1, pan: 0 });
    const panned = computeRulerTicks({ length: 600, zoom: 1, pan: 25 });
    const intervalUnpanned = unpanned[1].value - unpanned[0].value;
    const intervalPanned = panned[1].value - panned[0].value;
    expect(intervalPanned).toBe(intervalUnpanned);
  });
});
