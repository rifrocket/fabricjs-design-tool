import { Canvas } from "fabric";
import type { FabricObject } from "fabric";
import { Store } from "../store/store";
import { EventBus } from "../events/eventBus";
import { HistoryManager } from "../history/historyManager";
import { AddObjectCommand, RemoveObjectCommand } from "../history/canvasCommands";
import { SetPropertyCommand } from "../history/setPropertyCommand";
import { CompositeCommand } from "../history/command";
import { ViewportManager } from "./viewportManager";
import type { SetZoomOptions } from "./viewportManager";
import { AsyncLock } from "./asyncLock";
import { SelectionManager } from "./selectionManager";
import { LayerManager } from "./layerManager";
import { AlignmentManager } from "./alignmentManager";
import { SnapEngine } from "./snapEngine";
import { FabricRendererApi } from "./fabricRendererApi";
import type { RendererApi } from "./rendererApi";
import type { EditorContext } from "../plugin/editorContext";
import { InMemoryAssetStore } from "../assets/assetStore";
import type { AssetStore } from "../assets/assetStore";
import { getObjectId } from "./objectId";
import { PluginRegistry } from "../plugin/pluginRegistry";
import type { ObjectTypeId } from "../plugin/objectTypeRegistry";
import { KeyboardShortcutManager } from "../plugin/keyboardShortcuts";
import { CanvasExporter } from "../export/canvasExporter";
import type { ExportFormat } from "../export/canvasExporter";
import type { EditorPlugin } from "../plugin/plugin";
import type { EngineOptions, EngineState } from "../types";

const DEFAULT_EXPORT_FORMATS: ExportFormat[] = ["png", "jpeg", "svg", "json"];

const INITIAL_STATE: EngineState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  objectIds: [],
  selectedObjectIds: [],
  canUndo: false,
  canRedo: false,
  propertyVersion: 0,
};

// Owns one Fabric canvas and composes the narrow, independently testable services
// (viewport, selection, layers, history) around a single reactive store.
export class CanvasEngine implements EditorContext<FabricObject> {
  readonly viewport: ViewportManager;
  readonly selection: SelectionManager;
  readonly layers: LayerManager;
  readonly alignment: AlignmentManager;
  readonly snapping: SnapEngine;
  readonly history: HistoryManager;
  readonly events: EventBus;
  readonly store: Store<EngineState>;
  readonly registry: PluginRegistry;
  readonly shortcuts: KeyboardShortcutManager;
  // Renderer-agnostic seam (FUTURE_IMPLEMENTATION.md Stage 2) — everything above this field
  // stays Fabric-typed for now (see the "Explicitly out of scope" section of that plan), but
  // consumers/plugins that only need scene/selection/viewport/serialization/lifecycle
  // operations can depend on this instead of getFabricCanvas().
  readonly renderer: RendererApi<FabricObject>;
  // Injectable ownership (FUTURE_IMPLEMENTATION.md Chunk 4.3) — defaults to a private,
  // per-engine store unless a DocumentSession supplies a shared one via EngineOptions.assets.
  readonly assets: AssetStore;

  private readonly installedPlugins = new Map<string, EditorPlugin>();
  private readonly importLock = new AsyncLock();
  private destroyed = false;

  private constructor(
    private readonly canvas: Canvas,
    options: EngineOptions,
  ) {
    this.viewport = new ViewportManager(canvas);
    this.selection = new SelectionManager(canvas);
    this.layers = new LayerManager(canvas, () => this.syncObjects());
    this.history = options.history ?? new HistoryManager();
    this.alignment = new AlignmentManager(canvas, this.history);
    this.snapping = new SnapEngine(canvas, options.snapping);
    this.events = new EventBus();
    this.store = new Store(INITIAL_STATE);
    this.registry = new PluginRegistry();
    this.shortcuts = new KeyboardShortcutManager();
    this.renderer = new FabricRendererApi(canvas, this.viewport, this.selection);
    this.assets = options.assets ?? new InMemoryAssetStore();
    this.registerDefaultExporters();
    this.bindCanvasEvents();
  }

  static create(element: string | HTMLCanvasElement, options: EngineOptions = {}): CanvasEngine {
    const canvas = new Canvas(element, {
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor,
    });
    return new CanvasEngine(canvas, options);
  }

  private registerDefaultExporters(): void {
    const exporter = new CanvasExporter(this.canvas, this.registry.objectTypes);
    for (const format of DEFAULT_EXPORT_FORMATS) {
      this.registry.exporters.register(format, () => exporter.export(format));
    }
  }

  // Exports through the same registry a plugin would extend with a custom format.
  export(format: string): unknown {
    const exporter = this.registry.exporters.get(format);
    if (!exporter) {
      throw new Error(`No exporter registered for "${format}"`);
    }
    return exporter(this.canvas);
  }

  // Imports through the same registry a plugin extends with a custom format (e.g.
  // registerImporter("json", ...)), then resyncs reactive state for importers that fully
  // replace canvas contents rather than incrementally adding to it — canvas.loadFromJSON()
  // doesn't go through the add/remove command path, so nothing else notices the swap otherwise.
  // Importers that only call canvas.add() (e.g. SVG import) already self-sync via
  // bindCanvasEvents() and don't need this facade — call the registered importer directly instead.
  importFile(format: string, input: unknown): Promise<void> {
    // Guards against a second import starting before the first finishes — two overlapping
    // loadFromJSON()-style calls could otherwise interleave and leave the canvas in a mixed
    // state. Queued rather than rejected so callers don't need to coordinate calls themselves.
    return this.importLock.run(async () => {
      const importer = this.registry.importers.get(format);
      if (!importer) {
        throw new Error(`No importer registered for "${format}"`);
      }
      await importer(this.canvas, input);
      this.history.clear();
      this.syncObjects();
      this.selection.clear();
      this.syncSelection([]);
      this.syncHistory();
    });
  }

  private bindCanvasEvents(): void {
    this.canvas.on("object:added", () => this.syncObjects());
    this.canvas.on("object:removed", () => this.syncObjects());
    this.canvas.on("selection:created", (e) => this.syncSelection(e.selected ?? []));
    this.canvas.on("selection:updated", (e) => this.syncSelection(e.selected ?? []));
    this.canvas.on("selection:cleared", () => this.syncSelection([]));
  }

  private syncObjects(): void {
    const objectIds = this.canvas.getObjects().map(getObjectId);
    this.store.setState({ objectIds });
    this.events.emit("objects:changed", objectIds);
  }

  private syncSelection(objects: FabricObject[]): void {
    const selectedObjectIds = objects.map(getObjectId);
    this.store.setState({ selectedObjectIds });
    this.events.emit("selection:changed", selectedObjectIds);
  }

  private syncHistory(): void {
    this.store.setState({ canUndo: this.history.canUndo(), canRedo: this.history.canRedo() });
  }

  use(plugin: EditorPlugin): void {
    if (this.installedPlugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already installed`);
    }
    try {
      plugin.install(this);
    } catch (error) {
      // Registry throws (e.g. "X" is already registered) don't otherwise say which plugin's
      // install() triggered them — useAll() installs several plugins in one call, so without
      // this a consumer has to bisect their plugin list by hand to find the culprit.
      const reason = error instanceof Error ? error.message : String(error);
      const wrapped = new Error(`Plugin "${plugin.name}" failed to install: ${reason}`);
      (wrapped as Error & { cause?: unknown }).cause = error;
      throw wrapped;
    }
    this.installedPlugins.set(plugin.name, plugin);
  }

  // Installs multiple plugins at once, ordering them so each plugin's dependsOn entries are
  // installed first — replaces "get the array order right by hand" with a declared, validated
  // order. Plugins already installed satisfy dependencies without needing to appear in this
  // call's list.
  useAll(plugins: EditorPlugin[]): void {
    const byName = new Map(plugins.map((plugin) => [plugin.name, plugin]));
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const ordered: EditorPlugin[] = [];

    const visit = (plugin: EditorPlugin): void => {
      if (visited.has(plugin.name)) return;
      if (visiting.has(plugin.name)) {
        throw new Error(`Plugin "${plugin.name}" has a circular dependency`);
      }
      visiting.add(plugin.name);
      for (const dependencyName of plugin.dependsOn ?? []) {
        if (this.installedPlugins.has(dependencyName)) continue;
        const dependency = byName.get(dependencyName);
        if (!dependency) {
          throw new Error(`Plugin "${plugin.name}" depends on "${dependencyName}", which is not installed`);
        }
        visit(dependency);
      }
      visiting.delete(plugin.name);
      visited.add(plugin.name);
      ordered.push(plugin);
    };

    plugins.forEach(visit);
    ordered.forEach((plugin) => this.use(plugin));
  }

  unuse(pluginName: string): void {
    const plugin = this.installedPlugins.get(pluginName);
    if (!plugin) return;
    plugin.uninstall?.(this);
    this.installedPlugins.delete(pluginName);
  }

  hasPlugin(pluginName: string): boolean {
    return this.installedPlugins.has(pluginName);
  }

  // Creates an object from a registered type without adding it to the canvas or history.
  createObject(typeId: ObjectTypeId, config: unknown): Promise<FabricObject> {
    return this.registry.objectTypes.create(typeId, config);
  }

  // Creates an object from a registered type and adds it through the history-tracked path.
  async addObjectOfType(typeId: ObjectTypeId, config: unknown): Promise<FabricObject> {
    const object = await this.createObject(typeId, config);
    this.addObject(object);
    return object;
  }

  addObject(object: FabricObject): void {
    this.history.execute(new AddObjectCommand(this.renderer, object));
    this.syncHistory();
  }

  removeObject(object: FabricObject): void {
    this.history.execute(new RemoveObjectCommand(this.renderer, object));
    this.syncHistory();
  }

  // Removes every currently-selected object as a single undo step.
  deleteSelection(): void {
    const objects = this.selection.getActiveObjects();
    if (objects.length === 0) return;
    const commands = objects.map((object) => new RemoveObjectCommand(this.renderer, object));
    this.history.execute(new CompositeCommand(commands, "delete"));
    this.selection.clear();
    this.syncHistory();
  }

  setObjectProperty(object: FabricObject, key: string, value: unknown): void {
    this.history.execute(SetPropertyCommand.capture(object, key, value));
    this.canvas.requestRenderAll();
    this.syncHistory();
    // Property edits change the object but not selectedObjectIds/objectIds — nothing else in
    // EngineState reflects them, so UI subscribed only to selection (e.g. PropertiesPanel)
    // would otherwise never re-render after this call.
    this.store.setState((state) => ({ propertyVersion: state.propertyVersion + 1 }));
  }

  undo(): void {
    this.history.undo();
    this.canvas.requestRenderAll();
    this.syncHistory();
    // Undo/redo mutate an object's properties without changing selectedObjectIds — the same gap
    // setObjectProperty's own propertyVersion bump exists to close, so any property-driven UI
    // (PropertiesPanel, EffectsSection, ...) reflects the reverted value instead of the one it
    // last rendered.
    this.store.setState((state) => ({ propertyVersion: state.propertyVersion + 1 }));
  }

  redo(): void {
    this.history.redo();
    this.canvas.requestRenderAll();
    this.syncHistory();
    this.store.setState((state) => ({ propertyVersion: state.propertyVersion + 1 }));
  }

  setZoom(value: number, options?: SetZoomOptions): void {
    this.viewport.setZoom(value, options);
    this.store.setState({ zoom: this.viewport.getZoom() });
  }

  zoomBy(delta: number, options?: SetZoomOptions): void {
    this.viewport.zoomBy(delta, options);
    this.store.setState({ zoom: this.viewport.getZoom() });
  }

  // Resets zoom to 100% and pan to the origin — the CanvasEngine-facade counterpart to
  // viewport.reset(), so callers that need the store kept in sync don't reach into the raw
  // manager directly.
  reset(): void {
    this.viewport.reset();
    const pan = this.viewport.getPan();
    this.store.setState({ zoom: this.viewport.getZoom(), panX: pan.x, panY: pan.y });
  }

  // Updates the canvas element's 100%-zoom size, e.g. in response to a resized <Editor>.
  setDimensions(width: number, height: number): void {
    this.viewport.setBaseSize(width, height);
  }

  setBackgroundColor(color: string): void {
    this.canvas.set("backgroundColor", color);
    this.canvas.requestRenderAll();
  }

  pan(deltaX: number, deltaY: number): void {
    this.viewport.pan(deltaX, deltaY);
    const { x, y } = this.viewport.getPan();
    this.store.setState({ panX: x, panY: y });
  }

  panTo(x: number, y: number): void {
    this.viewport.panTo(x, y);
    const pan = this.viewport.getPan();
    this.store.setState({ panX: pan.x, panY: pan.y });
  }

  // Escape hatch for consumers that need direct Fabric access; unstable by design.
  /** @deprecated Escape hatch for pre-RendererApi plugins. Prefer `engine.renderer` /
   *  `EditorContext.renderer`, which work against any renderer, not just Fabric.
   *  Scheduled for removal no earlier than the release after existing plugins migrate
   *  (FUTURE_IMPLEMENTATION.md Stage 8). */
  getFabricCanvas(): Canvas {
    return this.canvas;
  }

  // Idempotent: guards against a second dispose() call, e.g. React 19 StrictMode's dev-only
  // double-invoke of effects racing async setup code that resumes after teardown. Callers
  // should check isDestroyed() after any await before touching this engine again.
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.snapping.destroy();
    this.canvas.dispose();
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }
}

export function createEngine(element: string | HTMLCanvasElement, options?: EngineOptions): CanvasEngine {
  return CanvasEngine.create(element, options);
}
