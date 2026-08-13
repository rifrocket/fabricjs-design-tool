import type { FabricObject } from "fabric";
import type { SceneNode } from "../scene/sceneNode";
import type { RendererApi } from "../engine/rendererApi";
import type { HistoryManager } from "../history/historyManager";
import type { EventBus } from "../events/eventBus";
import type { Store } from "../store/store";
import type { PluginRegistry } from "./pluginRegistry";
import type { KeyboardShortcutManager } from "./keyboardShortcuts";
import type { ObjectTypeId } from "./objectTypeRegistry";
import type { EditorPlugin } from "./plugin";
import type { EngineState } from "../types";
import type { AssetStore } from "../assets/assetStore";

// The plugin-facing façade — everything CanvasEngine exposes minus getFabricCanvas(). This is
// an application-facing façade, not an ownership boundary: it does not itself OWN document
// lifecycle — DocumentSession (Stage 4) owns document-scoped state (document data, assets,
// optionally history); EditorContext/CanvasEngine just hold references to what a given renderer
// instance was constructed with (FUTURE_IMPLEMENTATION.md Chunk 3.1).
export interface EditorContext<TNode extends SceneNode = FabricObject> {
  readonly renderer: RendererApi<TNode>;
  readonly history: HistoryManager;
  readonly registry: PluginRegistry;
  readonly events: EventBus;
  readonly store: Store<EngineState>;
  readonly shortcuts: KeyboardShortcutManager;
  readonly assets: AssetStore;

  use(plugin: EditorPlugin): void;
  useAll(plugins: EditorPlugin[]): void;
  unuse(pluginName: string): void;
  hasPlugin(pluginName: string): boolean;

  createObject(typeId: ObjectTypeId, config: unknown): Promise<TNode>;
  addObjectOfType(typeId: ObjectTypeId, config: unknown): Promise<TNode>;
  addObject(object: TNode): void;
  removeObject(object: TNode): void;
  deleteSelection(): void;
  setObjectProperty(object: TNode, key: string, value: unknown): void;

  undo(): void;
  redo(): void;
}
