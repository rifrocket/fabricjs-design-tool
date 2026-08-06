import type { FabricObject } from "fabric";
import { getSerializedProperties } from "@rifrocket/fabricjs-design-tool";

const PASTE_OFFSET = 20;

// Fabric v6's clone() only carries over properties passed as propertiesToInclude — custom
// properties like shapeKind or an effect stack are otherwise silently dropped. Passing every
// registered serialized property keeps the copy consistent with JSON export/snapshot capture.
export async function cloneFabricObject<T extends FabricObject>(object: T, offset = PASTE_OFFSET): Promise<T> {
  const clone = await object.clone(getSerializedProperties());
  clone.set({
    left: (object.left ?? 0) + offset,
    top: (object.top ?? 0) + offset,
  });
  return clone;
}
