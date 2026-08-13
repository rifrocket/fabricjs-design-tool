import type { FabricObject } from "fabric";
import type { RendererApi } from "../engine/rendererApi";
import type { ObjectTypeRegistry } from "../plugin/objectTypeRegistry";
import { resolveObjectTypeId } from "../engine/resolveObjectTypeId";
import { getObjectId } from "../engine/objectId";
import type { CanonicalNode, CanonicalPage } from "./canonicalDocument";

// The renderer-touching half of the canonical document model — explicitly named "sync" (not
// "export"/"import") so it's never mistaken for canonicalDocument.ts's own renderer-free
// load/save contract. Reads/writes whatever is *currently live* in a renderer — that's
// inherently something only a live renderer instance can answer, for either Fabric or a future
// 3D implementation (FUTURE_IMPLEMENTATION.md Chunk 6.3).

// Two explicit modes, chosen by the caller — there is no silent third option, because a partial
// document must never be persisted as if it were complete (FUTURE_IMPLEMENTATION.md Chunk 6.4):
//   strict: true  (default) — throws if any live node's ObjectTypeDefinition has no serialize()
//                  defined. The right default for anything that WRITES the result to storage.
//   strict: false — never throws; returns every node it could serialize plus `incomplete: true`
//                  and `skippedNodeIds` for the rest. Callers MUST check `incomplete` before
//                  treating the result as authoritative — this mode exists for inspection/
//                  migration tooling and Stage 9's mock-renderer tests, not silent production
//                  saves.
export interface CanonicalSyncResult {
  page: CanonicalPage;
  incomplete: boolean;
  skippedNodeIds: string[];
}

export interface SyncRendererToCanonicalPageOptions {
  strict?: boolean;
}

// Produces a CanonicalPage by calling each live node's registered type's serialize() directly —
// NOT by post-processing renderer.exportSceneJSON(). Top-level nodes only, matching Stage 5's
// same stated limitation (fabric groups nest children inside their own entry, not flattened
// into renderer.getNodes()). `pageId` is caller-supplied (e.g. a plugin-pages PageMeta.id) —
// this function has no basis to invent a page identity on its own.
export function syncRendererToCanonicalPage(
  renderer: RendererApi<FabricObject>,
  registry: ObjectTypeRegistry<FabricObject>,
  pageId: string,
  options: SyncRendererToCanonicalPageOptions = {},
): CanonicalSyncResult {
  const strict = options.strict ?? true;
  const skippedNodeIds: string[] = [];
  const nodes: CanonicalNode[] = [];

  for (const node of renderer.getNodes()) {
    const typeId = resolveObjectTypeId(node);
    const definition = registry.get(typeId);
    if (!definition?.serialize) {
      if (strict) {
        throw new Error(`Object type "${typeId}" has no serialize() hook — cannot produce a canonical node for it`);
      }
      skippedNodeIds.push(getObjectId(node));
      continue;
    }
    nodes.push({ id: getObjectId(node), typeId, properties: definition.serialize(node) });
  }

  return {
    page: { id: pageId, rendererId: renderer.kind, nodes },
    incomplete: skippedNodeIds.length > 0,
    skippedNodeIds,
  };
}

// The reverse direction: creates a live node for each canonical node (via the registered type's
// create()) and adds it to the renderer. Top-level nodes only, same limitation as above.
export async function syncCanonicalPageToRenderer(
  renderer: RendererApi<FabricObject>,
  registry: ObjectTypeRegistry<FabricObject>,
  page: CanonicalPage,
): Promise<void> {
  for (const node of page.nodes) {
    const definition = registry.get(node.typeId);
    if (!definition) {
      throw new Error(`No object type registered for "${node.typeId}"`);
    }
    const created = await definition.create(node.properties);
    renderer.addNode(created);
  }
}
