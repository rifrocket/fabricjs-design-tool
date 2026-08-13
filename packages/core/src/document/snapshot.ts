import { StaticCanvas } from "fabric";
import type { CanvasEngine } from "../engine/canvasEngine";
import { getSerializedProperties } from "../engine/serializedProperties";
import { applyDeserializeOverrides, serializeWithTypeOverrides } from "./objectTypeSerialization";

const DEFAULT_MAX_DIMENSION = 240;

// Deliberately carries no width/height: the canvas element is a fixed-size viewport, not the
// document's size — page dimensions are a multi-page concern tracked elsewhere.
export interface DocumentSnapshotData {
  json: Record<string, unknown>;
  backgroundColor: string;
  // Structural version and renderer discriminator, as distinct concerns — "what shape is this
  // document" vs. "which runtime understands its content" (FUTURE_IMPLEMENTATION.md Chunk 5.3).
  // Both optional and currently unpopulated by captureSnapshot() — every existing saved
  // document (with neither field) remains valid with no migration; absent means today's shape
  // (schemaVersion 1) produced by the fabric renderer.
  schemaVersion?: number;
  // Named legacyRendererId, not rendererId — distinct from Stage 6's CanonicalPage.rendererId,
  // which identifies the renderer for a *canonical* page. DocumentSnapshotData is the legacy/
  // runtime Fabric-JSON snapshot envelope (this Stage's compatibility bridge), not the canonical
  // document model; keeping the names visibly different prevents a future reader from assuming
  // the two serve the same role just because both say "renderer".
  legacyRendererId?: string;
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

// Reads the live scene through engine.renderer rather than the exporter registry, so this stays
// available even if a consumer overrides or unregisters the "json" export format — it's a
// lower-level primitive distinct from the user-facing export path (CanvasExporter). Routed
// through RendererApi, not engine.getFabricCanvas(), since Chunk 5.1 (FUTURE_IMPLEMENTATION.md)
// — for FabricRendererApi this is a thin pass-through to the same canvas.toObject() call
// (Chunk 5.2 layers optional per-object-type serialize() overrides on top via
// serializeWithTypeOverrides — a no-op for every type that doesn't define one, i.e. every
// shipped type today), so output is unchanged. backgroundColor is read from the exported json's
// own `background` field (fabric's toObject() already includes it when set) rather than a live
// property read, since RendererApi's LifecycleApi has no background getter, only
// setBackgroundColor().
export function captureSnapshot(engine: CanvasEngine): DocumentSnapshotData {
  const json = serializeWithTypeOverrides(engine.renderer, engine.registry.objectTypes, getSerializedProperties());
  return {
    json,
    backgroundColor: (json.background as string | undefined) ?? "#ffffff",
  };
}

// Restores through engine.importFile() rather than calling canvas.loadFromJSON() directly, so a
// custom "json" importer registered by a plugin still runs. applyDeserializeOverrides() then
// layers optional per-object-type deserialize() overrides on top (Chunk 5.2) — a no-op today,
// same reasoning as captureSnapshot() above — without re-importing or touching the importer
// registry itself.
export async function restoreSnapshot(engine: CanvasEngine, snapshot: DocumentSnapshotData): Promise<void> {
  engine.setBackgroundColor(snapshot.backgroundColor);
  await engine.importFile("json", snapshot.json);
  await applyDeserializeOverrides(engine.renderer, engine.registry.objectTypes, snapshot.json);
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
