import type { FabricObject } from "fabric";

export type DistributeProperty = "left" | "top";

export interface DistributionTarget {
  object: FabricObject;
  value: number;
}

// Pure geometry: equalizes the gap between adjacent object edges along an axis. The
// first and last objects (by position) anchor the span; only objects between them move.
// Needs at least 3 objects — with fewer there's nothing to redistribute.
export function computeDistribution(objects: FabricObject[], property: DistributeProperty): DistributionTarget[] {
  if (objects.length < 3) return [];

  const getSize = (object: FabricObject) =>
    property === "left" ? object.getScaledWidth() : object.getScaledHeight();
  const sorted = [...objects].sort((a, b) => (a[property] ?? 0) - (b[property] ?? 0));

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalSize = sorted.reduce((sum, object) => sum + getSize(object), 0);
  const span = (last[property] ?? 0) + getSize(last) - (first[property] ?? 0);
  const gap = (span - totalSize) / (sorted.length - 1);

  const targets: DistributionTarget[] = [];
  let cursor = (first[property] ?? 0) + getSize(first) + gap;
  for (let i = 1; i < sorted.length - 1; i += 1) {
    const object = sorted[i];
    targets.push({ object, value: cursor });
    cursor += getSize(object) + gap;
  }
  return targets;
}
