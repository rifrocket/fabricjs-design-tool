import { Gradient } from "fabric";

export interface GradientStop {
  offset: number;
  color: string;
  opacity?: number;
}

// Percentage-based coords (0-1) so the gradient adapts to any object's size without
// needing its pixel dimensions up front. angleDeg 0 = left-to-right, 90 = top-to-bottom.
export function createLinearGradient(stops: GradientStop[], angleDeg = 0): Gradient<"linear"> {
  const radians = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(radians) / 2;
  const dy = Math.sin(radians) / 2;

  return new Gradient({
    type: "linear",
    gradientUnits: "percentage",
    coords: { x1: 0.5 - dx, y1: 0.5 - dy, x2: 0.5 + dx, y2: 0.5 + dy },
    colorStops: stops,
  });
}

export function createRadialGradient(stops: GradientStop[]): Gradient<"radial"> {
  return new Gradient({
    type: "radial",
    gradientUnits: "percentage",
    coords: { x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5, r1: 0, r2: 0.5 },
    colorStops: stops,
  });
}
