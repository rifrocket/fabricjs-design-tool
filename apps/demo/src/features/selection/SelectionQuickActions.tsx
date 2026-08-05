import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { BringToFront, SendToBack, Copy, Trash2 } from "lucide-react";
import { useEditor, useEditorState } from "@rifrocket/fdt-react";
import { applyViewportTransform } from "@rifrocket/fabricjs-design-tool";
import { cloneFabricObject } from "@rifrocket/fdt-plugin-clipboard";
import { logUiEvent } from "../../dev-tools/uiEventLog";

interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

const BUTTON_CLASS =
  "flex h-6 w-6 items-center justify-center rounded text-xs text-fdt-fg transition-colors duration-150 hover:bg-fdt-bg hover:text-fdt-accent";

// Fills the "toolbar-start" slot, the one part of the app's chrome that lives inside <Editor>'s
// own div — used here for a floating mini-toolbar positioned relative to the canvas.
export function SelectionQuickActions(): ReactElement | null {
  const engine = useEditor();
  const selectedIds = useEditorState((state) => state.selectedObjectIds);
  const zoom = useEditorState((state) => state.zoom);
  const panX = useEditorState((state) => state.panX);
  const panY = useEditorState((state) => state.panY);
  // Fabric v6's getBoundingRect() returns document-space coordinates, not screen pixels, so the
  // pan/zoom transform (applyViewportTransform) is reapplied below to place this toolbar correctly.
  const [bounds, setBounds] = useState<Bounds | null>(null);

  useEffect(() => {
    const canvas = engine.getFabricCanvas();
    const recompute = () => {
      const active = canvas.getActiveObject();
      setBounds(active ? active.getBoundingRect() : null);
    };
    // Hide (not recompute) during "object:moving"/"object:scaling": those fire on every
    // mousemove, and a React re-render on every drag frame was measurable jank.
    const hide = () => setBounds(null);
    canvas.on("object:moving", hide);
    canvas.on("object:scaling", hide);

    recompute();
    const recomputeEvents = ["object:modified", "selection:created", "selection:updated", "selection:cleared"] as const;
    recomputeEvents.forEach((event) => canvas.on(event, recompute));

    return () => {
      canvas.off("object:moving", hide);
      canvas.off("object:scaling", hide);
      recomputeEvents.forEach((event) => canvas.off(event, recompute));
    };
  }, [engine]);

  if (selectedIds.length === 0 || !bounds) return null;

  const active = engine.selection.getActive();
  const screenOrigin = applyViewportTransform(bounds.left, bounds.top, [zoom, 0, 0, zoom, panX, panY]);

  return (
    <div
      className="fdt-animate-fade-in pointer-events-auto absolute z-30 flex -translate-y-[calc(100%+8px)] items-center gap-0.5 rounded-lg border border-fdt-border bg-fdt-bg-elevated p-1 shadow-md"
      style={{ left: Math.max(screenOrigin.x, 0), top: Math.max(screenOrigin.y, 0) }}
    >
      <button
        type="button"
        title="Bring to front"
        className={BUTTON_CLASS}
        onClick={() => {
          if (!active) return;
          engine.layers.bringToFront(active);
          logUiEvent("Bring to front");
        }}
      >
        <BringToFront size={14} strokeWidth={2} />
      </button>
      <button
        type="button"
        title="Send to back"
        className={BUTTON_CLASS}
        onClick={() => {
          if (!active) return;
          engine.layers.sendToBack(active);
          logUiEvent("Send to back");
        }}
      >
        <SendToBack size={14} strokeWidth={2} />
      </button>
      <button
        type="button"
        title="Duplicate"
        className={BUTTON_CLASS}
        onClick={async () => {
          const objects = engine.selection.getActiveObjects();
          const duplicated = await Promise.all(objects.map((object) => cloneFabricObject(object)));
          duplicated.forEach((object) => engine.addObject(object));
          engine.selection.selectMultiple(duplicated);
        }}
      >
        <Copy size={14} strokeWidth={2} />
      </button>
      <button
        type="button"
        title="Delete"
        className={`${BUTTON_CLASS} hover:text-fdt-danger`}
        onClick={() => {
          engine.deleteSelection();
        }}
      >
        <Trash2 size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
