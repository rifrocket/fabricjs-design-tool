import type { FabricObject } from "fabric";

// The registry type id for an object: `shapeKind` (used by shapes sharing a base Fabric
// class, e.g. polygon-based shapes or "rounded-rectangle") takes precedence over Fabric's
// own read-only `type` getter — see plugin-shapes-basic for why `type` can't be reused.
export function resolveObjectTypeId(object: FabricObject): string {
  const shapeKind: unknown = object.get("shapeKind");
  return typeof shapeKind === "string" ? shapeKind : object.type;
}
