import type { SceneNode } from "../scene/sceneNode";
import type { RendererApi } from "../engine/rendererApi";

// The strongest evidence the core is actually renderer-agnostic isn't "the interface compiles"
// — it's a second, independent implementation with zero Fabric dependency, that the rest of the
// stack runs against unmodified (FUTURE_IMPLEMENTATION.md Stage 9). Test-only: not part of the
// public API surface (not exported from index.ts).

// A trivial in-memory node — deliberately NOT a FabricObject, proving SceneNode's structural
// interface (Chunk 1.1) is genuinely sufficient. Zero fabric import in this file, by design.
export class MockNode implements SceneNode {
  private data = new Map<string, unknown>();

  get(key: string): unknown {
    return this.data.get(key);
  }

  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }

  // Not part of SceneNode — a MockNode-only convenience so MockRendererApi.exportSceneJSON()
  // can produce a real, inspectable snapshot of a node's data (mirroring what a Fabric
  // object's own toObject() would do), for serializeWithTypeOverrides/canonical-sync tests to
  // operate on.
  toPlainObject(): Record<string, unknown> {
    return Object.fromEntries(this.data.entries());
  }
}

// A complete, zero-DOM, zero-Fabric implementation of RendererApi<MockNode>, backed entirely by
// plain arrays/maps (Chunk 9.2).
export class MockRendererApi implements RendererApi<MockNode> {
  readonly kind = "mock";

  private nodes: MockNode[] = [];
  private activeNodes: MockNode[] = [];
  private zoom = 1;
  private panPosition = { x: 0, y: 0 };
  private backgroundColor = "#ffffff";
  private destroyed = false;

  // SceneApi
  addNode(node: MockNode): void {
    this.nodes.push(node);
  }

  removeNode(node: MockNode): void {
    this.nodes = this.nodes.filter((candidate) => candidate !== node);
  }

  getNodes(): MockNode[] {
    return this.nodes;
  }

  requestRender(): void {
    // No-op — there is nothing to paint in an in-memory mock.
  }

  // SelectionApi
  setActiveNode(node: MockNode): void {
    this.activeNodes = [node];
  }

  getActiveNodes(): MockNode[] {
    return this.activeNodes;
  }

  clearSelection(): void {
    this.activeNodes = [];
  }

  // ViewportApi
  getZoom(): number {
    return this.zoom;
  }

  setZoom(value: number): void {
    this.zoom = value;
  }

  zoomBy(delta: number): void {
    this.zoom += delta;
  }

  pan(deltaX: number, deltaY: number): void {
    this.panPosition = { x: this.panPosition.x + deltaX, y: this.panPosition.y + deltaY };
  }

  panTo(x: number, y: number): void {
    this.panPosition = { x, y };
  }

  getPan(): { x: number; y: number } {
    return this.panPosition;
  }

  resetViewport(): void {
    this.zoom = 1;
    this.panPosition = { x: 0, y: 0 };
  }

  setDimensions(_width: number, _height: number): void {
    // No element to resize in an in-memory mock.
  }

  // SerializationApi
  exportSceneJSON(): Record<string, unknown> {
    return {
      objects: this.nodes.map((node) => node.toPlainObject()),
      background: this.backgroundColor,
    };
  }

  async importSceneJSON(json: unknown): Promise<void> {
    const rawObjects = (json as { objects?: Record<string, unknown>[] } | undefined)?.objects ?? [];
    this.nodes = rawObjects.map((raw) => {
      const node = new MockNode();
      for (const [key, value] of Object.entries(raw)) {
        node.set(key, value);
      }
      return node;
    });
  }

  // LifecycleApi
  setBackgroundColor(color: string): void {
    this.backgroundColor = color;
  }

  destroy(): void {
    this.destroyed = true;
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }
}
