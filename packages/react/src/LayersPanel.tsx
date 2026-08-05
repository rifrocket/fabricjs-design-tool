import type { ReactElement } from "react";
import { useEditor } from "./useEditor";
import { useEditorState } from "./useEditorState";
import { buildLayerRows } from "./buildLayerRows";

// Lists canvas objects with select/visibility/lock toggles and z-order controls,
// replacing v1's LeftSidebar (select/visibility/delete only) and RightSidebar's
// disconnected layer-order buttons with a single panel driven by LayerManager.
export function LayersPanel(): ReactElement {
  const engine = useEditor();
  useEditorState((state) => state.objectIds);
  const selectedIds = useEditorState((state) => state.selectedObjectIds);
  const rows = buildLayerRows(engine.layers.getObjects(), selectedIds);

  return (
    <ul>
      {rows.map((row) => (
        <li key={row.id} aria-current={row.selected}>
          <button type="button" onClick={() => engine.selection.select(row.object)}>
            {row.typeId}
          </button>
          <button
            type="button"
            aria-label={row.visible ? "Hide layer" : "Show layer"}
            onClick={() => engine.layers.setVisible(row.object, !row.visible)}
          >
            {row.visible ? "Hide" : "Show"}
          </button>
          <button
            type="button"
            aria-label={row.locked ? "Unlock layer" : "Lock layer"}
            onClick={() => engine.layers.setLocked(row.object, !row.locked)}
          >
            {row.locked ? "Unlock" : "Lock"}
          </button>
          <button type="button" aria-label="Bring forward" onClick={() => engine.layers.bringForward(row.object)}>
            Up
          </button>
          <button type="button" aria-label="Send backward" onClick={() => engine.layers.sendBackward(row.object)}>
            Down
          </button>
        </li>
      ))}
    </ul>
  );
}
