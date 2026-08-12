import type { SceneNode } from "../../scene/sceneNode";

// Scene mutation — the primitives Commands (Stage 3) execute against, instead of a raw
// Canvas/FabricObject.
export interface SceneApi<TNode extends SceneNode = SceneNode> {
  addNode(node: TNode): void;
  removeNode(node: TNode): void;
  getNodes(): TNode[];
  requestRender(): void;
}
