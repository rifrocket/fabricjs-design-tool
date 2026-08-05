import type { FabricObject } from "fabric";
import { getObjectId, resolveObjectTypeId } from "@rifrocket/fdt-core";

export interface LayerRow {
  id: string;
  typeId: string;
  visible: boolean;
  locked: boolean;
  selected: boolean;
  object: FabricObject;
}

// Pure view-model for a layers panel row, independent of any live canvas.
export function buildLayerRows(objects: FabricObject[], selectedIds: readonly string[]): LayerRow[] {
  const selected = new Set(selectedIds);
  return objects.map((object) => {
    const id = getObjectId(object);
    return {
      id,
      typeId: resolveObjectTypeId(object),
      visible: object.visible !== false,
      locked: Boolean(object.lockMovementX && object.lockMovementY),
      selected: selected.has(id),
      object,
    };
  });
}
