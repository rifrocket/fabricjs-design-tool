import { useState } from "react";
import type { DragEvent, ReactElement } from "react";
import { GripVertical, Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown } from "lucide-react";
import { buildLayerRows, useEditor, useEditorState } from "@rifrocket/fdt-react";
import type { LayerRow } from "@rifrocket/fdt-react";
import { InfoTooltip } from "../../docs/InfoTooltip";
import { logUiEvent } from "../../dev-tools/uiEventLog";

// Reuses buildLayerRows (the same view-model @rifrocket/fdt-react's <LayersPanel> is built on)
// and adds HTML5 drag-and-drop reordering via LayerManager.moveToIndex, which the shipped
// <LayersPanel> doesn't expose a UI for. LayerManager's z-order/visibility/lock methods notify
// the reactive store on their own, so the useEditorState(objectIds) subscription below picks up
// mutations without a manual resync.
export function EnhancedLayersPanel(): ReactElement {
  const engine = useEditor();
  useEditorState((state) => state.objectIds);
  const selectedIds = useEditorState((state) => state.selectedObjectIds);
  const rows = buildLayerRows(engine.layers.getObjects(), selectedIds).reverse();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDrop = (target: LayerRow) => {
    if (!draggedId || draggedId === target.id) return;
    const dragged = rows.find((row) => row.id === draggedId);
    if (!dragged) return;
    const targetIndex = engine.layers.getIndex(target.object);
    engine.layers.moveToIndex(dragged.object, targetIndex);
    logUiEvent("Reorder layer", { typeId: dragged.typeId });
    setDraggedId(null);
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted">
        Layers
        <InfoTooltip featureKey="layers" />
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-fdt-fg-muted">No objects on the canvas yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map((row) => (
            <li
              key={row.id}
              draggable
              onDragStart={() => setDraggedId(row.id)}
              onDragOver={(event: DragEvent<HTMLLIElement>) => event.preventDefault()}
              onDrop={() => handleDrop(row)}
              aria-current={row.selected}
              className={`flex cursor-grab items-center gap-1 rounded-md border px-1.5 py-1 text-xs transition-colors duration-150 active:cursor-grabbing ${
                row.selected ? "border-fdt-accent bg-fdt-bg-elevated" : "border-fdt-border bg-fdt-bg"
              }`}
            >
              <span aria-hidden="true" className="text-fdt-fg-muted">
                <GripVertical size={14} strokeWidth={2} />
              </span>
              <button
                type="button"
                onClick={() => engine.selection.select(row.object)}
                className="flex-1 truncate text-left text-fdt-fg"
              >
                {row.typeId}
              </button>
              <button
                type="button"
                title={row.visible ? "Hide" : "Show"}
                onClick={() => engine.layers.setVisible(row.object, !row.visible)}
                className="rounded p-1 text-fdt-fg-muted hover:bg-fdt-bg-elevated hover:text-fdt-fg"
              >
                {row.visible ? <Eye size={14} strokeWidth={2} /> : <EyeOff size={14} strokeWidth={2} />}
              </button>
              <button
                type="button"
                title={row.locked ? "Unlock" : "Lock"}
                onClick={() => engine.layers.setLocked(row.object, !row.locked)}
                className="rounded p-1 text-fdt-fg-muted hover:bg-fdt-bg-elevated hover:text-fdt-fg"
              >
                {row.locked ? <Lock size={14} strokeWidth={2} /> : <Unlock size={14} strokeWidth={2} />}
              </button>
              <button
                type="button"
                title="Bring forward"
                onClick={() => engine.layers.bringForward(row.object)}
                className="rounded p-1 text-fdt-fg-muted hover:bg-fdt-bg-elevated hover:text-fdt-fg"
              >
                <ChevronUp size={14} strokeWidth={2} />
              </button>
              <button
                type="button"
                title="Send backward"
                onClick={() => engine.layers.sendBackward(row.object)}
                className="rounded p-1 text-fdt-fg-muted hover:bg-fdt-bg-elevated hover:text-fdt-fg"
              >
                <ChevronDown size={14} strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
