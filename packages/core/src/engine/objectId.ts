import type { FabricObject } from "fabric";

const ids = new WeakMap<FabricObject, string>();
let counter = 0;

// The property name stamped onto FabricObjects so their id survives a toObject()/loadFromJSON()
// round trip. Named export so any code serializing objects outside CanvasExporter includes it too.
export const ID_PROPERTY = "fdtId";

// Stable identity for a FabricObject, persisted across serialization. An object restored via
// loadFromJSON() already carries its previous id as a plain property, which is adopted rather
// than overwritten so the id survives a reload or a copy onto another canvas. Never-serialized
// objects get a new counter-based id, stamped on so the *next* export includes it too.
export function getObjectId(object: FabricObject): string {
  const cached = ids.get(object);
  if (cached) return cached;

  const restored = (object as unknown as Record<string, unknown>)[ID_PROPERTY];
  const id = typeof restored === "string" ? restored : `obj_${(counter += 1)}`;

  ids.set(object, id);
  if (restored !== id) {
    object.set(ID_PROPERTY, id);
  }
  return id;
}
