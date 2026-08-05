import { StaticCanvas } from "fabric";
import type { CanvasEngine } from "../engine/canvasEngine";
import { getSerializedProperties } from "../engine/serializedProperties";

const DEFAULT_MAX_DIMENSION = 240;

// Deliberately carries no width/height: the canvas element is a fixed-size viewport, not the
// document's size — page dimensions are a multi-page concern tracked elsewhere.
export interface DocumentSnapshotData {
  json: Record<string, unknown>;
  backgroundColor: string;
}

export interface SnapshotDimensions {
  width: number;
  height: number;
}

export interface RenderThumbnailOptions {
  maxDimension?: number;
}

// Minimal surface renderSnapshotThumbnail needs from an offscreen canvas — injectable so callers
// can fake it in tests, since this repo's jsdom test environment has no real 2D rendering context.
export interface OffscreenCanvas {
  loadFromJSON(json: unknown): Promise<unknown>;
  renderAll(): void;
  toDataURL(options: { format: "png"; multiplier: number }): string;
  dispose(): void;
}

export type OffscreenCanvasFactory = (width: number, height: number, backgroundColor: string) => OffscreenCanvas;

const defaultOffscreenCanvasFactory: OffscreenCanvasFactory = (width, height, backgroundColor) =>
  new StaticCanvas(document.createElement("canvas"), { width, height, backgroundColor }) as unknown as OffscreenCanvas;

// Reads the live canvas directly rather than through the exporter registry, so this stays
// available even if a consumer overrides or unregisters the "json" export format — it's a
// lower-level primitive distinct from the user-facing export path (CanvasExporter).
export function captureSnapshot(engine: CanvasEngine): DocumentSnapshotData {
  const canvas = engine.getFabricCanvas();
  return {
    json: canvas.toObject(getSerializedProperties()) as Record<string, unknown>,
    backgroundColor: (canvas.backgroundColor as string | undefined) ?? "#ffffff",
  };
}

// Restores through engine.importFile() rather than calling canvas.loadFromJSON() directly, so a
// custom "json" importer registered by a plugin still runs.
export async function restoreSnapshot(engine: CanvasEngine, snapshot: DocumentSnapshotData): Promise<void> {
  engine.setBackgroundColor(snapshot.backgroundColor);
  await engine.importFile("json", snapshot.json);
}

// Renders a snapshot that isn't live on the canvas, using a detached StaticCanvas so the
// on-screen canvas is never disturbed. Dimensions come from the caller since
// DocumentSnapshotData doesn't carry them.
export async function renderSnapshotThumbnail(
  snapshot: DocumentSnapshotData,
  dimensions: SnapshotDimensions,
  options: RenderThumbnailOptions = {},
  factory: OffscreenCanvasFactory = defaultOffscreenCanvasFactory,
): Promise<string> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const canvas = factory(dimensions.width, dimensions.height, snapshot.backgroundColor);
  await canvas.loadFromJSON(snapshot.json);
  canvas.renderAll();
  const multiplier = maxDimension / Math.max(dimensions.width, dimensions.height);
  const dataUrl = canvas.toDataURL({ format: "png", multiplier });
  canvas.dispose();
  return dataUrl;
}
