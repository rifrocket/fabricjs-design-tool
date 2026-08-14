import type { FabricObject } from "fabric";
import { ObjectTypeRegistry } from "./objectTypeRegistry";
import type { ObjectTypeDefinition, ObjectTypeId, PropertyFieldDefinition } from "./objectTypeRegistry";
import { ToolRegistry } from "./toolRegistry";
import type { ToolDefinition } from "./toolRegistry";
import { PanelRegistry } from "./panelRegistry";
import type { PanelDefinition } from "./panelRegistry";
import { EffectRegistry } from "./effectRegistry";
import type { EffectDefinition } from "../effects/types";
import { Registry } from "./registry";
import type { Exporter, Importer } from "./transfer";
import type { SceneNode } from "../scene/sceneNode";

// Facade exposed as `engine.registry`: one place for a plugin to reach every extension point.
//
// Generic over TNode (default FabricObject), threaded only into `objectTypes` — the same
// default-type-parameter pattern as ObjectTypeRegistry<TNode> itself (FUTURE_IMPLEMENTATION.md
// Chunk 1.2), so every existing call site (`registry.objectTypes.register(...)`, no type
// argument) means exactly what it means today. `tools`/`panels`/`effects` are left untouched —
// none of their definitions reference a node type at all. `exporters`/`importers` are also left
// untouched: `Exporter`/`Importer` (./transfer.ts) are typed against Fabric's `Canvas` directly,
// a separate, deeper problem (a renderer-neutral export/import contract) that this stage does not
// attempt — see THREE_D_READINESS_REASSESSMENT.md.
export class PluginRegistry<TNode extends SceneNode = FabricObject> {
  readonly objectTypes = new ObjectTypeRegistry<TNode>();
  readonly tools = new ToolRegistry();
  readonly panels = new PanelRegistry();
  readonly effects = new EffectRegistry();
  readonly exporters = new Registry<Exporter>();
  readonly importers = new Registry<Importer>();

  registerObjectType<TConfig>(typeId: ObjectTypeId, definition: ObjectTypeDefinition<TConfig, TNode>): void {
    this.objectTypes.register(typeId, definition);
  }

  replaceObjectType<TConfig>(typeId: ObjectTypeId, definition: ObjectTypeDefinition<TConfig, TNode>): void {
    this.objectTypes.replace(typeId, definition);
  }

  registerPropertyFields(typeId: ObjectTypeId, fields: PropertyFieldDefinition[]): void {
    this.objectTypes.registerPropertyFields(typeId, fields);
  }

  registerTool(toolId: string, definition: ToolDefinition): void {
    this.tools.register(toolId, definition);
  }

  replaceTool(toolId: string, definition: ToolDefinition): void {
    this.tools.replace(toolId, definition);
  }

  registerPanel(slot: string, definition: PanelDefinition): () => void {
    return this.panels.register(slot, definition);
  }

  replacePanel(slot: string, definition: PanelDefinition): () => void {
    return this.panels.replace(slot, definition);
  }

  registerEffect<TProps extends object>(definition: EffectDefinition<TProps>): void {
    this.effects.register(definition);
  }

  replaceEffect<TProps extends object>(definition: EffectDefinition<TProps>): void {
    this.effects.replace(definition);
  }

  registerExporter(format: string, exporter: Exporter): void {
    this.exporters.register(format, exporter);
  }

  registerImporter(format: string, importer: Importer): void {
    this.importers.register(format, importer);
  }
}
