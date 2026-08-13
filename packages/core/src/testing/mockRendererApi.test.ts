import { describe, expect, it } from "vitest";
import { MockNode, MockRendererApi } from "./mockRendererApi";
import { AddObjectCommand, RemoveObjectCommand } from "../history/canvasCommands";
import { SetPropertyCommand, type NodeOps } from "../history/setPropertyCommand";
import { CompositeCommand } from "../history/command";
import { HistoryManager } from "../history/historyManager";
import { ObjectTypeRegistry, type ObjectTypeDefinition } from "../plugin/objectTypeRegistry";
import { PluginRegistry } from "../plugin/pluginRegistry";
import type { EditorPlugin } from "../plugin/plugin";
import { KeyboardShortcutManager } from "../plugin/keyboardShortcuts";
import { EventBus } from "../events/eventBus";
import { Store } from "../store/store";
import { InMemoryAssetStore, type AssetStore } from "../assets/assetStore";
import type { EngineState } from "../types";
import {
  loadCanonicalDocument,
  saveCanonicalDocument,
  type CanonicalDocument,
} from "../document/canonicalDocument";
import { syncCanonicalPageToRenderer, syncRendererToCanonicalPage } from "../document/canonicalSceneSync";

describe("MockNode", () => {
  it("satisfies SceneNode via get/set", () => {
    const node = new MockNode();
    node.set("left", 10);
    expect(node.get("left")).toBe(10);
    expect(node.get("missing")).toBeUndefined();
  });

  it("exposes its data as a plain object via toPlainObject", () => {
    const node = new MockNode();
    node.set("left", 10);
    node.set("top", 20);
    expect(node.toPlainObject()).toEqual({ left: 10, top: 20 });
  });
});

describe("MockRendererApi", () => {
  it("reports kind 'mock'", () => {
    const renderer = new MockRendererApi();
    expect(renderer.kind).toBe("mock");
  });

  it("supports the full SceneApi surface", () => {
    const renderer = new MockRendererApi();
    const node = new MockNode();

    renderer.addNode(node);
    expect(renderer.getNodes()).toEqual([node]);

    renderer.requestRender(); // no-op, must not throw

    renderer.removeNode(node);
    expect(renderer.getNodes()).toEqual([]);
  });

  it("supports the full SelectionApi surface", () => {
    const renderer = new MockRendererApi();
    const node = new MockNode();
    renderer.addNode(node);

    renderer.setActiveNode(node);
    expect(renderer.getActiveNodes()).toEqual([node]);

    renderer.clearSelection();
    expect(renderer.getActiveNodes()).toEqual([]);
  });

  it("supports the full ViewportApi surface", () => {
    const renderer = new MockRendererApi();

    expect(renderer.getZoom()).toBe(1);
    renderer.setZoom(2);
    expect(renderer.getZoom()).toBe(2);
    renderer.zoomBy(0.5);
    expect(renderer.getZoom()).toBe(2.5);

    expect(renderer.getPan()).toEqual({ x: 0, y: 0 });
    renderer.pan(5, 10);
    expect(renderer.getPan()).toEqual({ x: 5, y: 10 });
    renderer.panTo(1, 1);
    expect(renderer.getPan()).toEqual({ x: 1, y: 1 });

    renderer.setDimensions(800, 600); // no-op, must not throw

    renderer.resetViewport();
    expect(renderer.getZoom()).toBe(1);
    expect(renderer.getPan()).toEqual({ x: 0, y: 0 });
  });

  it("supports the full SerializationApi surface", async () => {
    const renderer = new MockRendererApi();
    const node = new MockNode();
    node.set("left", 10);
    renderer.addNode(node);
    renderer.setBackgroundColor("#123456");

    const json = renderer.exportSceneJSON();
    expect(json).toEqual({ objects: [{ left: 10 }], background: "#123456" });

    const other = new MockRendererApi();
    await other.importSceneJSON(json);
    expect(other.getNodes()).toHaveLength(1);
    expect(other.getNodes()[0]?.get("left")).toBe(10);
  });

  it("supports the full LifecycleApi surface", () => {
    const renderer = new MockRendererApi();

    renderer.setBackgroundColor("#000000"); // no-op observable via exportSceneJSON, exercised above

    expect(renderer.isDestroyed()).toBe(false);
    renderer.destroy();
    expect(renderer.isDestroyed()).toBe(true);
  });
});

// Chunk 9.3 — proves Commands and History work against a fully non-Fabric renderer, not just
// Fabric. Deliberately exercises AddObjectCommand/RemoveObjectCommand/SetPropertyCommand and
// HistoryManager directly (rather than assembling a full EditorContext<MockNode> fixture, which
// would need working stubs for registry/events/store/shortcuts/assets/use()/etc. unrelated to
// what this chunk is actually proving) — HistoryManager only ever calls Command.do()/.undo()/
// .merge(), so this is the real, minimal surface under test.
describe("Commands + HistoryManager against MockRendererApi", () => {
  const mockNodeOps: NodeOps<MockNode> = {
    get: (node, key) => node.get(key),
    set: (node, key, value) => node.set(key, value),
  };

  it("AddObjectCommand adds, selects, and renders; undo removes", () => {
    const renderer = new MockRendererApi();
    const node = new MockNode();
    const history = new HistoryManager();

    history.execute(new AddObjectCommand(renderer, node));
    expect(renderer.getNodes()).toEqual([node]);
    expect(renderer.getActiveNodes()).toEqual([node]);

    history.undo();
    expect(renderer.getNodes()).toEqual([]);

    history.redo();
    expect(renderer.getNodes()).toEqual([node]);
  });

  it("RemoveObjectCommand removes; undo re-adds", () => {
    const renderer = new MockRendererApi();
    const node = new MockNode();
    renderer.addNode(node);
    const history = new HistoryManager();

    history.execute(new RemoveObjectCommand(renderer, node));
    expect(renderer.getNodes()).toEqual([]);

    history.undo();
    expect(renderer.getNodes()).toEqual([node]);
  });

  it("SetPropertyCommand sets a property against a MockNode via injected NodeOps; undo restores, redo reapplies", () => {
    const node = new MockNode();
    node.set("left", 10);
    const history = new HistoryManager();

    history.execute(SetPropertyCommand.capture(node, "left", 20, mockNodeOps));
    expect(node.get("left")).toBe(20);

    history.undo();
    expect(node.get("left")).toBe(10);

    history.redo();
    expect(node.get("left")).toBe(20);
  });

  it("merges consecutive SetPropertyCommands on the same target/key into one undo step", () => {
    const node = new MockNode();
    node.set("left", 0);
    const history = new HistoryManager();

    history.execute(SetPropertyCommand.capture(node, "left", 1, mockNodeOps));
    history.execute(SetPropertyCommand.capture(node, "left", 2, mockNodeOps));
    history.execute(SetPropertyCommand.capture(node, "left", 3, mockNodeOps));
    expect(node.get("left")).toBe(3);

    history.undo();
    expect(node.get("left")).toBe(0); // one merged undo step back to the original value
    expect(history.canUndo()).toBe(false);
  });
});

// Chunk 9.4 — proves ObjectTypeRegistry works with a fully non-Fabric node type, not just
// FabricObject (the registry's default TNode).
describe("ObjectTypeRegistry<MockNode>", () => {
  interface FakeShapeConfig {
    left: number;
    top: number;
  }

  const fakeShapeType: ObjectTypeDefinition<FakeShapeConfig, MockNode> = {
    create: (config) => {
      const node = new MockNode();
      node.set("left", config.left);
      node.set("top", config.top);
      return node;
    },
  };

  it("registers, creates, and round-trips a non-Fabric object type", async () => {
    const registry = new ObjectTypeRegistry<MockNode>();
    registry.register("fake-shape", fakeShapeType);

    expect(registry.has("fake-shape")).toBe(true);
    expect(registry.list()).toEqual(["fake-shape"]);

    const node = await registry.create("fake-shape", { left: 5, top: 7 });
    expect(node).toBeInstanceOf(MockNode);
    expect(node.get("left")).toBe(5);
    expect(node.get("top")).toBe(7);
  });

  it("adds a registry-created MockNode to a MockRendererApi and drives it through history", async () => {
    const registry = new ObjectTypeRegistry<MockNode>();
    registry.register("fake-shape", fakeShapeType);
    const renderer = new MockRendererApi();
    const history = new HistoryManager();

    const node = await registry.create("fake-shape", { left: 1, top: 2 });
    history.execute(new AddObjectCommand(renderer, node));
    expect(renderer.getNodes()).toEqual([node]);

    history.undo();
    expect(renderer.getNodes()).toEqual([]);
  });

  it("throws creating an unregistered type id, and unregister removes a type", async () => {
    const registry = new ObjectTypeRegistry<MockNode>();
    registry.register("fake-shape", fakeShapeType);

    registry.unregister("fake-shape");
    expect(registry.has("fake-shape")).toBe(false);
    await expect(registry.create("fake-shape", { left: 0, top: 0 })).rejects.toThrow(
      'No object type registered for "fake-shape"',
    );
  });
});

// Chunk 9.5 — the strongest test in Stage 9: an actual real-plugin authoring pattern
// (plugin-shapes-basic's install(context) { registerBasicShapes(context.registry.objectTypes) })
// ported to run against a fully non-Fabric renderer.
//
// Two real findings made while writing this test, both left as Stage 11 "not proven" items
// rather than fixed here (fixing either is a bigger, cross-cutting EditorContext/EditorPlugin
// design change, out of scope for a Stage 9 validation-only chunk):
//
// 1. EditorContext<TNode>.registry is a plain PluginRegistry (editorContext.ts), and
//    PluginRegistry.objectTypes is hardcoded to ObjectTypeRegistry<FabricObject>
//    (pluginRegistry.ts) — NOT generic over TNode. The literal pattern every shipped plugin uses
//    today, `context.registry.objectTypes.register()`, only ever type-checks against
//    FabricObject. Worked around below via a second, distinctly-named
//    `mockObjectTypes: ObjectTypeRegistry<MockNode>` field.
//
// 2. EditorContext<TNode>.use(plugin: EditorPlugin): void — EditorPlugin's own default type
//    parameter (`EditorPlugin<TContext = CanvasEngine>`, plugin.ts) means this signature is
//    hardcoded to accept only CanvasEngine-shaped plugins, regardless of TNode. A class typing
//    `use` against `EditorPlugin<FakeEditorContext>` instead fails `implements EditorContext<
//    MockNode>` outright (TS2416: EditorPlugin<CanvasEngine> and EditorPlugin<FakeEditorContext>
//    are mutually non-assignable, since FakeEditorContext and CanvasEngine share no structural
//    overlap) — unlike Chunk 3.1's bivariance finding, there is no compatible direction here to
//    exploit, because that finding only worked for the one real CanvasEngine class installing
//    plugins written against itself. So FakeEditorContext below does NOT literally
//    `implements EditorContext<MockNode>` — every field/method it needs to prove Chunk 9.5's
//    claims (renderer, history, registry, events, store, shortcuts, assets, createObject,
//    addObjectOfType, addObject, removeObject, deleteSelection, setObjectProperty, undo, redo)
//    is still built exactly to that interface's shape; only the plugin-installation members
//    (use/useAll/unuse/hasPlugin) use FakeEditorContext's own self-consistent signatures instead.
class FakeEditorContext {
  readonly renderer = new MockRendererApi();
  readonly history = new HistoryManager();
  readonly registry = new PluginRegistry();
  readonly events = new EventBus();
  readonly store = new Store<EngineState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    objectIds: [],
    selectedObjectIds: [],
    canUndo: false,
    canRedo: false,
    propertyVersion: 0,
  });
  readonly shortcuts = new KeyboardShortcutManager();
  readonly assets: AssetStore = new InMemoryAssetStore();
  readonly mockObjectTypes = new ObjectTypeRegistry<MockNode>();

  private readonly mockNodeOps: NodeOps<MockNode> = {
    get: (node, key) => node.get(key),
    set: (node, key, value) => node.set(key, value),
  };
  private readonly installedPlugins = new Map<string, EditorPlugin<FakeEditorContext>>();

  // Self-consistent signature (see the class-level comment above for why this can't also
  // literally satisfy EditorContext<MockNode>.use(plugin: EditorPlugin): void).
  use(plugin: EditorPlugin<FakeEditorContext>): void {
    plugin.install(this);
    this.installedPlugins.set(plugin.name, plugin);
  }

  useAll(plugins: EditorPlugin<FakeEditorContext>[]): void {
    plugins.forEach((plugin) => this.use(plugin));
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

  createObject(typeId: string, config: unknown): Promise<MockNode> {
    return this.mockObjectTypes.create(typeId, config);
  }

  async addObjectOfType(typeId: string, config: unknown): Promise<MockNode> {
    const node = await this.createObject(typeId, config);
    this.addObject(node);
    return node;
  }

  addObject(node: MockNode): void {
    this.history.execute(new AddObjectCommand(this.renderer, node));
  }

  removeObject(node: MockNode): void {
    this.history.execute(new RemoveObjectCommand(this.renderer, node));
  }

  deleteSelection(): void {
    const nodes = this.renderer.getActiveNodes();
    if (nodes.length === 0) return;
    const commands = nodes.map((node) => new RemoveObjectCommand(this.renderer, node));
    this.history.execute(new CompositeCommand(commands, "delete"));
    this.renderer.clearSelection();
  }

  setObjectProperty(node: MockNode, key: string, value: unknown): void {
    this.history.execute(SetPropertyCommand.capture(node, key, value, this.mockNodeOps));
  }

  undo(): void {
    this.history.undo();
  }

  redo(): void {
    this.history.redo();
  }
}

interface MockShapeConfig {
  left?: number;
  top?: number;
}

// The MockNode-flavored analogue of plugin-shapes-basic's registerBasicShapes(registry) —
// same shape (a plain function taking a registry and calling .register() on it), proving that
// half of the real pattern is genuinely renderer-agnostic already.
function registerMockShapes(registry: ObjectTypeRegistry<MockNode>): void {
  registry.register<MockShapeConfig>("mock-rect", {
    create: (config = {}) => {
      const node = new MockNode();
      node.set("typeId", "mock-rect");
      node.set("left", config.left ?? 0);
      node.set("top", config.top ?? 0);
      return node;
    },
    serialize: (node) => ({ left: node.get("left"), top: node.get("top") }),
    deserialize: (data, ctx) => {
      ctx.object.set("left", data.left);
      ctx.object.set("top", data.top);
    },
  });
}

const mockShapesPlugin: EditorPlugin<FakeEditorContext> = {
  name: "mock-shapes",
  install(context) {
    registerMockShapes(context.mockObjectTypes);
  },
};

// resolveObjectTypeId/getObjectId (canonicalSceneSync.ts's defaults) are inherently Fabric-
// specific — see canonicalSceneSync.ts's own comment on SyncRendererToCanonicalPageOptions.
// MockNode strategies, supplied explicitly, same shape a real non-Fabric renderer plugin would need.
function resolveMockTypeId(node: MockNode): string {
  return node.get("typeId") as string;
}

let mockNodeIdCounter = 0;
const mockNodeIds = new WeakMap<MockNode, string>();
function getMockNodeId(node: MockNode): string {
  const existing = mockNodeIds.get(node);
  if (existing) return existing;
  const id = `mock_${(mockNodeIdCounter += 1)}`;
  mockNodeIds.set(node, id);
  return id;
}

describe("Chunk 9.5 — real plugin pattern, end to end, zero Fabric", () => {
  it("installs a real plugin-authoring-pattern plugin, creates+adds via addObjectOfType, undoes/redoes, and round-trips through canonical sync + renderer-free load/save", async () => {
    const context = new FakeEditorContext();

    context.use(mockShapesPlugin);
    expect(context.hasPlugin("mock-shapes")).toBe(true);
    expect(context.mockObjectTypes.has("mock-rect")).toBe(true);

    const node = await context.addObjectOfType("mock-rect", { left: 10, top: 20 });
    expect(context.renderer.getNodes()).toEqual([node]);
    expect(context.renderer.getActiveNodes()).toEqual([node]);

    context.undo();
    expect(context.renderer.getNodes()).toEqual([]);
    context.redo();
    expect(context.renderer.getNodes()).toEqual([node]);

    context.setObjectProperty(node, "left", 99);
    expect(node.get("left")).toBe(99);
    context.undo();
    expect(node.get("left")).toBe(10);
    context.redo();
    expect(node.get("left")).toBe(99);

    // The renderer-touching half: read the live scene into canonical form.
    const syncResult = syncRendererToCanonicalPage(context.renderer, context.mockObjectTypes, "page_1", {
      resolveTypeId: resolveMockTypeId,
      getNodeId: getMockNodeId,
    });
    expect(syncResult.incomplete).toBe(false);
    expect(syncResult.skippedNodeIds).toEqual([]);
    expect(syncResult.page).toEqual({
      id: "page_1",
      rendererId: "mock",
      nodes: [{ id: getMockNodeId(node), typeId: "mock-rect", properties: { left: 99, top: 20 } }],
    });

    // The renderer-free half: no renderer, mock or otherwise, is constructed in this block.
    const canonicalDoc: CanonicalDocument = { schemaVersion: 1, pages: [syncResult.page], assets: [] };
    const saved = saveCanonicalDocument(canonicalDoc);
    const loaded = loadCanonicalDocument(saved);
    expect(loaded).toEqual(canonicalDoc);

    // Back to a live (different) renderer: syncCanonicalPageToRenderer recreates the scene.
    const targetContext = new FakeEditorContext();
    registerMockShapes(targetContext.mockObjectTypes);
    await syncCanonicalPageToRenderer(targetContext.renderer, targetContext.mockObjectTypes, loaded.pages[0]);

    const recreated = targetContext.renderer.getNodes();
    expect(recreated).toHaveLength(1);
    expect(recreated[0].get("left")).toBe(99);
    expect(recreated[0].get("top")).toBe(20);
  });
});
