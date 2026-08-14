import type { AssetRecord } from "../assets/assetStore";

// The canonical, renderer-neutral document format (FUTURE_IMPLEMENTATION.md Stage 6) — a
// document format that is Page -> Nodes -> { typeId, properties, children }, not "Fabric JSON
// plus patches" (Stage 5's transitional compatibility bridge). Buildable incrementally, per
// object type, once ObjectTypeDefinition.serialize()/deserialize() (Stage 1) exist for a given
// type — not a flag-day rewrite.
//
// Critical design constraint: the canonical *document* (load, save, validate, migrate) must not
// require a live RendererApi. A document is data; reading/writing it needs nothing but the data
// itself — never a <canvas>, Fabric, or any renderer instance. What genuinely does need a live
// renderer — reading currently-on-screen objects into canonical form, or the reverse — is a
// separate, narrower operation, named "scene sync" (Stage 6.3, canonicalSceneSync.ts), never
// folded into this file's load/save contract. Zero fabric import in this file, by design —
// enforced by the document-assets-no-renderer dependency-cruiser rule (Chunk 0.3/6.5).

// Contract every ObjectTypeDefinition.serialize() implementation must honor: the returned
// properties must be renderer-independent and sufficient, together with typeId, to fully
// reconstruct the logical object via registry.create() on ANY renderer with the same typeId
// registered — not a raw dump of a live Fabric/Three object's own shape. A type that can only
// round-trip through a specific renderer's own object shape doesn't yet have a real serialize()
// by this definition, even if the function compiles and returns data.
export type PortableNodeProperties = Record<string, unknown>;

export interface CanonicalNode {
  id: string;
  typeId: string;
  properties: PortableNodeProperties;
  // Nested nodes (e.g. Fabric groups) — present so this format doesn't inherit Stage 5's
  // top-level-only limitation; populating it for real groups is later, incremental work.
  children?: CanonicalNode[];
  // Non-type-owned state a plugin attaches (layer name, lock flag, z-order hints, ...) — kept
  // distinct from `properties` so plugins don't smuggle renderer-specific state into what's
  // supposed to be the object type's own portable representation.
  metadata?: Record<string, unknown>;
}

// rendererId names the runtime renderer required to display/edit THIS page in the current
// architecture (one renderer per page). It is not a claim that a page can never contain
// mixed-renderer-backed nodes long-term — that's a genuinely harder, separate problem this
// field deliberately doesn't foreclose, just doesn't attempt to solve now. Page-scoped (not
// document-scoped) so a document with some Fabric pages and some future-3D pages is already
// representable.
export interface CanonicalPage {
  id: string;
  rendererId: string;
  nodes: CanonicalNode[];
}

export interface CanonicalDocument {
  schemaVersion: number;
  pages: CanonicalPage[];
  assets: AssetRecord[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertCanonicalNode(value: unknown, path: string): asserts value is CanonicalNode {
  if (!isPlainObject(value)) throw new Error(`${path}: expected an object`);
  if (typeof value.id !== "string") throw new Error(`${path}.id: expected a string`);
  if (typeof value.typeId !== "string") throw new Error(`${path}.typeId: expected a string`);
  if (!isPlainObject(value.properties)) throw new Error(`${path}.properties: expected an object`);
  if (value.children !== undefined) {
    if (!Array.isArray(value.children)) throw new Error(`${path}.children: expected an array`);
    value.children.forEach((child, index) => assertCanonicalNode(child, `${path}.children[${index}]`));
  }
  if (value.metadata !== undefined && !isPlainObject(value.metadata)) {
    throw new Error(`${path}.metadata: expected an object`);
  }
}

function assertCanonicalPage(value: unknown, path: string): asserts value is CanonicalPage {
  if (!isPlainObject(value)) throw new Error(`${path}: expected an object`);
  if (typeof value.id !== "string") throw new Error(`${path}.id: expected a string`);
  if (typeof value.rendererId !== "string") throw new Error(`${path}.rendererId: expected a string`);
  if (!Array.isArray(value.nodes)) throw new Error(`${path}.nodes: expected an array`);
  value.nodes.forEach((node, index) => assertCanonicalNode(node, `${path}.nodes[${index}]`));
}

function assertAssetRecord(value: unknown, path: string): asserts value is AssetRecord {
  if (!isPlainObject(value)) throw new Error(`${path}: expected an object`);
  if (typeof value.id !== "string") throw new Error(`${path}.id: expected a string`);
  if (typeof value.kind !== "string") throw new Error(`${path}.kind: expected a string`);
}

// Pure data in, pure data out. No renderer, no DOM. Safe to run server-side, in a worker, in a
// migration script, or in a test with zero fabric import anywhere on the call path. Validates
// structure (not just casts) so a malformed document fails loudly here rather than surfacing as
// a confusing error deep inside scene sync (Chunk 6.3) later.
export function loadCanonicalDocument(json: unknown): CanonicalDocument {
  if (!isPlainObject(json)) throw new Error("CanonicalDocument: expected an object");
  if (typeof json.schemaVersion !== "number") throw new Error("CanonicalDocument.schemaVersion: expected a number");
  if (!Array.isArray(json.pages)) throw new Error("CanonicalDocument.pages: expected an array");
  if (!Array.isArray(json.assets)) throw new Error("CanonicalDocument.assets: expected an array");
  json.pages.forEach((page, index) => assertCanonicalPage(page, `pages[${index}]`));
  json.assets.forEach((asset, index) => assertAssetRecord(asset, `assets[${index}]`));
  return json as unknown as CanonicalDocument;
}

// Plain serialize — a shallow copy into a bare Record. Note: an AssetRecord's optional `blob`
// field is not JSON-safe (Blob doesn't survive JSON.stringify meaningfully); a caller persisting
// a document with blob-backed assets is responsible for handling that separately — out of scope
// for this minimal function, which does not attempt blob-to-base64 encoding or similar.
export function saveCanonicalDocument(doc: CanonicalDocument): Record<string, unknown> {
  return { ...doc };
}

// schemaVersion-driven, stubbed until a real migration is needed — today only schemaVersion 1
// exists, so there is no migration path to define yet. Throws rather than silently returning a
// document claiming a version it doesn't actually have.
export function migrateCanonicalDocument(doc: CanonicalDocument, toVersion: number): CanonicalDocument {
  if (doc.schemaVersion === toVersion) return doc;
  throw new Error(`No migration path from schemaVersion ${doc.schemaVersion} to ${toVersion}`);
}
