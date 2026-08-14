import type { FabricObject } from "fabric";
import type { SnapEngineOptions } from "./engine/snapEngine";
import type { HistoryManager } from "./history/historyManager";
import type { AssetStore } from "./assets/assetStore";
import type { RendererApi } from "./engine/rendererApi";
import type { SceneNode } from "./scene/sceneNode";

// Constructs a RendererApi instead of just a fabric.Canvas — a genuine cross-renderer seam
// (FUTURE_IMPLEMENTATION.md Chunk 7.1). Honesty check: this makes the RENDERER pluggable, not
// yet the ENGINE SHELL around it — CanvasEngine itself (owning history/registry/events/store/
// shortcuts/plugin install) is still one concrete class, constructed around whatever RendererApi
// the factory returns. A genuinely swappable engine (e.g. a future ThreeEditorEngine sibling)
// is real, larger follow-up work, out of scope here.
export type RendererApiFactory<TNode extends SceneNode = FabricObject> = (
  element: string | HTMLCanvasElement,
  options: EngineOptions,
) => RendererApi<TNode>;

export interface EngineOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  snapping?: SnapEngineOptions;
  // Injectable ownership (FUTURE_IMPLEMENTATION.md Chunk 4.3) — if omitted, CanvasEngine
  // constructs its own of each, byte-identical to today's behavior. A DocumentSession
  // (Stage 4.2) passes its own shared instances here to give every page's engine the same
  // AssetStore, and — only when explicitly opted into via `history: { scope: "document" }` —
  // the same HistoryManager.
  history?: HistoryManager;
  assets?: AssetStore;
  // Renderer-construction seam (Chunk 7.1/7.2) — if omitted, CanvasEngine.create() uses the
  // default Fabric factory, byte-identical to today's behavior.
  rendererFactory?: RendererApiFactory;
}

export interface EngineState {
  zoom: number;
  panX: number;
  panY: number;
  objectIds: string[];
  selectedObjectIds: string[];
  canUndo: boolean;
  canRedo: boolean;
  // Bumped on every setObjectProperty() call. Selection change alone (selectedObjectIds) does
  // not reflect property edits on the object(s) already selected — UI that needs to reflect a
  // property mutation (not just a selection change) should subscribe to this instead.
  propertyVersion: number;
}
