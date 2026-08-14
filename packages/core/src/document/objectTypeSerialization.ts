import type { FabricObject } from "fabric";
import { resolveObjectTypeId } from "../engine/resolveObjectTypeId";
import type { RendererApi } from "../engine/rendererApi";
import type { ObjectTypeRegistry } from "../plugin/objectTypeRegistry";

// Layers optional per-object-type serialize()/deserialize() hooks (ObjectTypeDefinition,
// packages/core/src/plugin/objectTypeRegistry.ts) on top of the raw Fabric-JSON scene format —
// canvas.toObject()/loadFromJSON() have no native per-object hook, so this is a post-process
// merge, not a reimplementation of fabric's own serialization (FUTURE_IMPLEMENTATION.md Chunk
// 5.2). This is the transitional Fabric compatibility layer (Stage 5); the fully
// renderer-neutral canonical format is Stage 6.
//
// Known limitation, stated not hidden: matching json.objects[i] to renderer.getNodes()[i] by
// array index only works for TOP-LEVEL nodes — fabric groups nest their children inside the
// group's own object entry, not flattened into the top-level array. Per-type hooks fire for
// top-level objects only; revisit only if a concrete plugin needs group-nested overrides.

export function serializeWithTypeOverrides(
  renderer: Pick<RendererApi<FabricObject>, "exportSceneJSON" | "getNodes">,
  registry: ObjectTypeRegistry<FabricObject>,
  extraProps?: string[],
): Record<string, unknown> {
  const base = renderer.exportSceneJSON(extraProps);
  const rawObjects = base.objects;
  if (!Array.isArray(rawObjects)) return base;

  const live = renderer.getNodes();
  const merged = rawObjects.map((raw, index) => {
    const node = live[index];
    if (!node || typeof raw !== "object" || raw === null) return raw;
    const definition = registry.get(resolveObjectTypeId(node));
    return definition?.serialize ? { ...raw, ...definition.serialize(node) } : raw;
  });
  return { ...base, objects: merged };
}

// Applies per-object-type deserialize() overrides to nodes already live on the renderer — call
// this AFTER the raw import has already populated the scene (e.g. via
// engine.importFile("json", rawJson), which runs whatever "json" importer is registered). This
// function never performs the import itself, so a custom "json" importer a plugin registers
// still runs untouched.
export async function applyDeserializeOverrides(
  renderer: Pick<RendererApi<FabricObject>, "getNodes">,
  registry: ObjectTypeRegistry<FabricObject>,
  rawJson: unknown,
): Promise<void> {
  const rawObjects = (rawJson as { objects?: unknown[] } | undefined)?.objects;
  if (!Array.isArray(rawObjects)) return;

  const live = renderer.getNodes();
  for (let index = 0; index < live.length; index += 1) {
    const raw = rawObjects[index];
    const node = live[index];
    if (!raw || typeof raw !== "object" || !node) continue;
    const definition = registry.get(resolveObjectTypeId(node));
    if (definition?.deserialize) {
      await definition.deserialize(raw as Record<string, unknown>, { object: node });
    }
  }
}
