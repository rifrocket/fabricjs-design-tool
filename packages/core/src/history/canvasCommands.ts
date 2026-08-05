import type { Canvas, FabricObject } from "fabric";
import type { Command } from "./command";

export class AddObjectCommand implements Command {
  readonly label = "Add object";

  constructor(
    private readonly canvas: Canvas,
    private readonly object: FabricObject,
  ) {}

  do(): void {
    this.canvas.add(this.object);
    this.canvas.setActiveObject(this.object);
    this.canvas.requestRenderAll();
  }

  undo(): void {
    this.canvas.remove(this.object);
    this.canvas.requestRenderAll();
  }
}

export class RemoveObjectCommand implements Command {
  readonly label = "Remove object";

  constructor(
    private readonly canvas: Canvas,
    private readonly object: FabricObject,
  ) {}

  do(): void {
    this.canvas.remove(this.object);
    this.canvas.requestRenderAll();
  }

  undo(): void {
    this.canvas.add(this.object);
    this.canvas.requestRenderAll();
  }
}
