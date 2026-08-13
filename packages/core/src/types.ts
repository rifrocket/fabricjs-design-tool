import type { SnapEngineOptions } from "./engine/snapEngine";
import type { HistoryManager } from "./history/historyManager";
import type { AssetStore } from "./assets/assetStore";

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
