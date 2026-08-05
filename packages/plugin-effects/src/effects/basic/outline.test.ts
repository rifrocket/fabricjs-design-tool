import { describe, expect, it } from "vitest";
import { ringStepsFor } from "./outline";

// The outline effect approximates a dilated ring by drawing the object's silhouette offset
// around a circle of radius `width`; too few samples at a given width makes the ring look like
// a faceted polygon (simple shapes) or a smear of separate copies (text) instead of one smooth
// band — see outline.ts's comment. ringStepsFor is what keeps consecutive samples close together
// regardless of width.
describe("ringStepsFor", () => {
  it("never drops below the minimum step count, even at width 0", () => {
    expect(ringStepsFor(0)).toBe(16);
    expect(ringStepsFor(1)).toBe(16);
  });

  it("increases the step count as width grows, keeping consecutive samples close together", () => {
    const width = 30;
    const steps = ringStepsFor(width);
    const arcSpacing = (2 * Math.PI * width) / steps;

    expect(steps).toBeGreaterThan(16);
    expect(arcSpacing).toBeLessThanOrEqual(1.5);
  });

  it("caps the step count so an extreme width can't make rendering unbounded", () => {
    expect(ringStepsFor(10_000)).toBe(128);
  });
});
