import type { Canvas, FabricObject } from "fabric";

// Z-order, visibility, and lock state for canvas objects.
export class LayerManager {
  // Fabric's z-order/visibility/lock APIs (bringObjectToFront, moveObjectTo, object.set
  // "visible", etc.) fire no event CanvasEngine listens for (only object:added/removed and
  // selection:*), so without this callback the reactive store silently goes stale after every
  // mutation below — including for the shipped <LayersPanel>. CanvasEngine wires this to its
  // own syncObjects() when constructing LayerManager; it's optional so LayerManager stays
  // usable standalone (e.g. in tests) without a store.
  constructor(
    private readonly canvas: Canvas,
    private readonly onChange?: () => void,
  ) {}

  getObjects(): FabricObject[] {
    return this.canvas.getObjects();
  }

  bringToFront(object: FabricObject): void {
    this.canvas.bringObjectToFront(object);
    this.canvas.requestRenderAll();
    this.onChange?.();
  }

  sendToBack(object: FabricObject): void {
    this.canvas.sendObjectToBack(object);
    this.canvas.requestRenderAll();
    this.onChange?.();
  }

  bringForward(object: FabricObject): void {
    this.canvas.bringObjectForward(object);
    this.canvas.requestRenderAll();
    this.onChange?.();
  }

  sendBackward(object: FabricObject): void {
    this.canvas.sendObjectBackwards(object);
    this.canvas.requestRenderAll();
    this.onChange?.();
  }

  // Moves an object to an arbitrary z-index, for drag-to-reorder in a layers panel.
  moveToIndex(object: FabricObject, index: number): boolean {
    const moved = this.canvas.moveObjectTo(object, index);
    this.canvas.requestRenderAll();
    this.onChange?.();
    return moved;
  }

  getIndex(object: FabricObject): number {
    return this.canvas.getObjects().indexOf(object);
  }

  setVisible(object: FabricObject, visible: boolean): void {
    object.set("visible", visible);
    this.canvas.requestRenderAll();
    this.onChange?.();
  }

  isVisible(object: FabricObject): boolean {
    return object.visible !== false;
  }

  setLocked(object: FabricObject, locked: boolean): void {
    object.set({
      lockMovementX: locked,
      lockMovementY: locked,
      lockRotation: locked,
      lockScalingX: locked,
      lockScalingY: locked,
      selectable: !locked,
    });
    this.canvas.requestRenderAll();
    this.onChange?.();
  }

  isLocked(object: FabricObject): boolean {
    return Boolean(object.lockMovementX && object.lockMovementY);
  }
}
