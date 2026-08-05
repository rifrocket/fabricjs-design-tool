import type { Canvas, FabricObject } from "fabric";
import { CompositeCommand } from "../history/command";
import { SetPropertyCommand } from "../history/setPropertyCommand";
import type { HistoryManager } from "../history/historyManager";
import { computeDistribution } from "./distribute";

export type Alignment = "left" | "center" | "right" | "top" | "middle" | "bottom";
export type DistributeAxis = "horizontal" | "vertical";

// Aligns the active selection relative to the canvas (single object) or to itself
// (multiple objects). Routed through HistoryManager so alignment is undoable.
export class AlignmentManager {
  constructor(
    private readonly canvas: Canvas,
    private readonly history: HistoryManager,
  ) {}

  align(alignment: Alignment): void {
    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const commands =
      activeObjects.length === 1
        ? [this.alignToCanvas(activeObjects[0], alignment)]
        : this.alignToSelection(activeObjects, alignment);

    this.history.execute(new CompositeCommand(commands, `align:${alignment}`));
    this.canvas.requestRenderAll();
  }

  // Equalizes the gap between adjacent object edges along an axis. The first and last
  // objects (by position) anchor the span; only the objects between them move.
  distribute(axis: DistributeAxis): void {
    const activeObjects = this.canvas.getActiveObjects();
    const property = axis === "horizontal" ? "left" : "top";
    const targets = computeDistribution(activeObjects, property);
    if (targets.length === 0) return;

    const commands = targets.map((target) => SetPropertyCommand.capture(target.object, property, target.value));
    this.history.execute(new CompositeCommand(commands, `distribute:${axis}`));
    this.canvas.requestRenderAll();
  }

  private alignToCanvas(object: FabricObject, alignment: Alignment): SetPropertyCommand {
    const width = this.canvas.width ?? 0;
    const height = this.canvas.height ?? 0;
    // getScaledWidth()/getScaledHeight(), not the raw width/height properties: a shape resized
    // via its corner handle (the only resize path for circles and polygons, which have no
    // width/height property-panel fields) changes scaleX/scaleY, not width/height, so the raw
    // properties go stale. distribute.ts uses the same scale-aware accessors for this reason.
    const objWidth = object.getScaledWidth();
    const objHeight = object.getScaledHeight();

    switch (alignment) {
      case "left":
        return SetPropertyCommand.capture(object, "left", 0);
      case "center":
        return SetPropertyCommand.capture(object, "left", (width - objWidth) / 2);
      case "right":
        return SetPropertyCommand.capture(object, "left", width - objWidth);
      case "top":
        return SetPropertyCommand.capture(object, "top", 0);
      case "middle":
        return SetPropertyCommand.capture(object, "top", (height - objHeight) / 2);
      case "bottom":
        return SetPropertyCommand.capture(object, "top", height - objHeight);
    }
  }

  private alignToSelection(objects: FabricObject[], alignment: Alignment): SetPropertyCommand[] {
    const bounds = {
      left: Math.min(...objects.map((o) => o.left ?? 0)),
      top: Math.min(...objects.map((o) => o.top ?? 0)),
      right: Math.max(...objects.map((o) => (o.left ?? 0) + o.getScaledWidth())),
      bottom: Math.max(...objects.map((o) => (o.top ?? 0) + o.getScaledHeight())),
    };

    return objects.map((object) => {
      const objWidth = object.getScaledWidth();
      const objHeight = object.getScaledHeight();
      switch (alignment) {
        case "left":
          return SetPropertyCommand.capture(object, "left", bounds.left);
        case "center":
          return SetPropertyCommand.capture(
            object,
            "left",
            bounds.left + (bounds.right - bounds.left - objWidth) / 2,
          );
        case "right":
          return SetPropertyCommand.capture(object, "left", bounds.right - objWidth);
        case "top":
          return SetPropertyCommand.capture(object, "top", bounds.top);
        case "middle":
          return SetPropertyCommand.capture(
            object,
            "top",
            bounds.top + (bounds.bottom - bounds.top - objHeight) / 2,
          );
        case "bottom":
          return SetPropertyCommand.capture(object, "top", bounds.bottom - objHeight);
      }
    });
  }
}
