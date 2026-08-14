import type { SceneNode } from "../../scene/sceneNode";

export interface SelectionApi<TNode extends SceneNode = SceneNode> {
  setActiveNode(node: TNode): void;
  getActiveNodes(): TNode[];
  clearSelection(): void;
}
