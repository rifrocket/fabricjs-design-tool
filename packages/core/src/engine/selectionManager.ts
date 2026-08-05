import { ActiveSelection, Group } from "fabric";
import type { Canvas, FabricObject } from "fabric";

// Active-selection and grouping, wrapping the live canvas selection API.
export class SelectionManager {
  constructor(private readonly canvas: Canvas) {}

  getActive(): FabricObject | undefined {
    return this.canvas.getActiveObject();
  }

  getActiveObjects(): FabricObject[] {
    return this.canvas.getActiveObjects();
  }

  select(object: FabricObject): void {
    this.canvas.setActiveObject(object);
    this.canvas.requestRenderAll();
  }

  selectMultiple(objects: FabricObject[]): void {
    if (objects.length === 0) return;
    if (objects.length === 1) {
      this.select(objects[0]);
      return;
    }
    const selection = new ActiveSelection(objects, { canvas: this.canvas });
    this.canvas.setActiveObject(selection);
    this.canvas.requestRenderAll();
  }

  clear(): void {
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  group(): Group | null {
    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length < 2) return null;

    this.canvas.discardActiveObject();
    activeObjects.forEach((object) => this.canvas.remove(object));

    const group = new Group(activeObjects, { selectable: true, evented: true });
    this.canvas.add(group);
    this.canvas.setActiveObject(group);
    this.canvas.requestRenderAll();
    return group;
  }

  ungroup(): FabricObject[] | null {
    const active = this.canvas.getActiveObject();
    if (!active || !(active instanceof Group)) return null;

    const objects = active.removeAll();
    this.canvas.remove(active);
    objects.forEach((object) => {
      object.set({ selectable: true, evented: true });
      this.canvas.add(object);
    });

    this.selectMultiple(objects);
    return objects;
  }
}
