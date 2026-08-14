import type { Canvas, FabricObject } from "fabric";
import type { Command } from "./command";
import type { SceneApi, SelectionApi } from "../engine/rendererApi";
import type { SceneNode } from "../scene/sceneNode";
import { SelectionManager } from "../engine/selectionManager";

// The subset of RendererApi these commands need — scene mutation + active-selection, no
// viewport/serialization/lifecycle capabilities (FUTURE_IMPLEMENTATION.md Chunk 3.2).
export type ObjectMutationSurface<TNode extends SceneNode = SceneNode> = SceneApi<TNode> & SelectionApi<TNode>;

function isFabricCanvas(value: unknown): value is Canvas {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Canvas).add === "function" &&
    typeof (value as Canvas).requestRenderAll === "function"
  );
}

// Normalizes a legacy raw Canvas into an ObjectMutationSurface. Exists for external consumers
// who construct these commands directly against a Canvas — a real published package export, so
// backward compatibility for it matters even though CanvasEngine itself now passes its own
// `renderer` (see canvasEngine.ts's addObject/removeObject/deleteSelection).
function toObjectMutationSurface(canvas: Canvas): ObjectMutationSurface<FabricObject> {
  const selection = new SelectionManager(canvas);
  return {
    addNode: (node) => canvas.add(node),
    removeNode: (node) => canvas.remove(node),
    getNodes: () => canvas.getObjects(),
    requestRender: () => canvas.requestRenderAll(),
    setActiveNode: (node) => selection.select(node),
    getActiveNodes: () => selection.getActiveObjects(),
    clearSelection: () => selection.clear(),
  };
}

export class AddObjectCommand<TNode extends SceneNode = FabricObject> implements Command {
  readonly label = "Add object";
  private readonly surface: ObjectMutationSurface<TNode>;

  constructor(
    target: Canvas | ObjectMutationSurface<TNode>,
    private readonly object: TNode,
  ) {
    this.surface = isFabricCanvas(target)
      ? (toObjectMutationSurface(target) as unknown as ObjectMutationSurface<TNode>)
      : target;
  }

  do(): void {
    this.surface.addNode(this.object);
    this.surface.setActiveNode(this.object);
    this.surface.requestRender();
  }

  undo(): void {
    this.surface.removeNode(this.object);
    this.surface.requestRender();
  }
}

export class RemoveObjectCommand<TNode extends SceneNode = FabricObject> implements Command {
  readonly label = "Remove object";
  private readonly surface: ObjectMutationSurface<TNode>;

  constructor(
    target: Canvas | ObjectMutationSurface<TNode>,
    private readonly object: TNode,
  ) {
    this.surface = isFabricCanvas(target)
      ? (toObjectMutationSurface(target) as unknown as ObjectMutationSurface<TNode>)
      : target;
  }

  do(): void {
    this.surface.removeNode(this.object);
    this.surface.requestRender();
  }

  undo(): void {
    this.surface.addNode(this.object);
    this.surface.requestRender();
  }
}
