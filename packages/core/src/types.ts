import type { SnapEngineOptions } from "./engine/snapEngine";

export interface EngineOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  snapping?: SnapEngineOptions;
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
