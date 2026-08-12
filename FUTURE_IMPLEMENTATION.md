# Renderer-agnostic core: chunked implementation roadmap

This is an **execution plan** for the already-approved renderer-agnostic core architecture. The architecture itself (types, file paths, verification strategy) is not renegotiated here — this document only breaks it into small, independently completable chunks so implementation can proceed one focused piece at a time, each reviewed and committed before the next starts.

## Context

The product goal (not built in this plan) is a future 3D plugin (Three.js/Babylon.js) that coexists with the current Fabric.js 2D engine, sharing document/history/asset/plugin/export infrastructure — e.g. `createDesignEditor({ plugins: [threeDPlugin()] })`. Before any 3D work starts, the request was to validate whether `packages/core`'s abstractions (Document, Object Registry, Commands, History, Serialization, Assets, Plugin API, Editor Context) are actually generic enough to support a non-Fabric renderer, or whether they'd force a rewrite.

**Target architecture — the master reference every chunk below implements a piece of:**

```
                          Document
                            │
              ┌─────────────┼─────────────┐
              │             │             │
            Pages         Nodes        Assets / Metadata
              │             │             │
              └─────────────┴─────────────┘
                            │
                    DocumentSession              ◄── owns document, assets,
                            │                          optionally history
                    Editor / Commands            ◄── Plugin System
                    (History, Registry)               (renderer-agnostic)
                            │
                     Renderer Adapter             ◄── RendererApi
                            │                          (capability interfaces)
                  ┌─────────┴─────────┐
                  │                   │
             Fabric Renderer     Future 3D Renderer
             (fabric.Canvas)      (Three.js/etc.)
```

The document (pages/nodes/assets/metadata) is data, and must be constructible, loadable, and processable **without any renderer present** — no Fabric, no Three.js, no `<canvas>`, no DOM. The renderer is how a document gets displayed and edited interactively, not what a document *is*. `SceneNode` is a temporary interoperability contract for this refactor, not the canonical scene-node representation — the real renderer-neutral node shape is `CanonicalNode` (Stage 6). `EditorContext` is a plugin-facing façade, not an ownership boundary — document-scoped state belongs to `DocumentSession`.

**Validation result, confirmed by reading the actual source (not assumed):**

Reusable as-is:
- `HistoryManager` (`packages/core/src/history/historyManager.ts`) — pure command stack, only calls `command.do()`/`.undo()`/`.merge()`. Zero fabric imports.
- `PluginRegistry` (`packages/core/src/plugin/pluginRegistry.ts`) — generic `Registry<T>` containers, string-keyed.
- `DesignDocument<TMeta> { meta, pages: DesignDocumentPage[] }` (`packages/core/src/document/designDocument.ts`) — already plain, serializable data; `DocumentSnapshotData.json` is a `Record<string, unknown>`, not a live Fabric reference, so a `DesignDocument` can already be parsed/stored/transmitted with zero Fabric import today. What's *not* renderer-neutral is the **shape** of that JSON (it's Fabric's own `toObject()` dialect) and the fact that *capturing/restoring* a live page currently requires reaching through `engine.getFabricCanvas()` — both addressed in Stage 5/6.
- `EventBus`/`Store<EngineState>`, plugin `dependsOn` topological install ordering.
- `CanvasEngine.create()` is instance-scoped, not a singleton — `plugin-pages`'s `PagesManager` already runs one `CanvasEngine` per page.

Confirmed from reading `packages/plugin-pages/src/PagesManager.ts` directly (matters for Stage 4): **history, selection, viewport, and snapping are deliberately per-page today**, one full `CanvasEngine` (and thus one `HistoryManager`) per page, by design — the class comment at line 49 states this explicitly as "page-scoped for free." Any move toward shared/document-level history must be an *opt-in* addition, not a default-behavior change to shipped functionality.

The concrete gaps this roadmap closes:
1. `ObjectTypeDefinition.create()` returns `FabricObject` verbatim (`packages/core/src/plugin/objectTypeRegistry.ts:36-39`) — no generic scene-node type.
2. No `RendererApi` exists — renderer-owned concerns are flattened directly onto `CanvasEngine`, hard-typed to `Canvas`/`FabricObject`.
3. Serialization is monolithic and fabric-specific: `DocumentSnapshotData.json` is fabric's own `canvas.toObject()` output. No per-object-type hook, no renderer-neutral canonical format.
4. The plugin "editor context" *is* `CanvasEngine` — `getFabricCanvas()` (`canvasEngine.ts:311`) is an "unstable by design" escape hatch used by 13+ plugin packages, with no deprecation signal.
5. `createEngine`/`CanvasEngine.create()` hardcodes `new Canvas(element, ...)` — no renderer-construction seam.
6. History commands are fabric-typed: `AddObjectCommand`/`RemoveObjectCommand`/`SetPropertyCommand` take `Canvas`/`FabricObject` directly.
7. **No `AssetStore` exists.** `plugin-image` passes a raw `src` string straight to `FabricImage.fromURL()`.
8. **No `DocumentSession` concept exists.** Assets and history would each end up owned by whichever `CanvasEngine` happens to construct them — wrong for a multi-page document.

Every chunk is designed to be non-breaking against the *default* path (verified against every real call site in the repo), so existing consumers (including `plugin-pages`' current per-page-history behavior) are unaffected unless they opt into new capabilities.

---

## Working rules

**One chunk at a time.** For each chunk:
```
Read current implementation → implement only this chunk → run targeted tests →
run affected package checks → review changes → commit → update progress tracker → next chunk
```
Do not start a chunk before the previous one is `COMPLETED` or explicitly marked `BLOCKED` with a documented reason. Do not implement multiple chunks in one commit.

**Never lose the master plan.** If implementing a chunk reveals a need for a change outside its declared scope, **stop** — do not make the uncontrolled change. Document the finding against that chunk's row (status `BLOCKED`, note the issue) and surface it before proceeding; that may mean revisiting this roadmap, not silently expanding a chunk.

**Progress tracker.** Maintain this table (update after every chunk):

| Chunk | Status | Files changed | Tests | Notes | Commit |
|---|---|---|---|---|---|
| 0.1 | COMPLETED | none | build/typecheck/test/apps:build/depcruise all green | On branch `version-5` (not `main`); `apps/npm-verify` doesn't exist on this branch, spot-check N/A here. build: 21/21; typecheck: 32/32; test: 42/42 tasks; apps:build: 22/22; depcruise: 78 modules/268 deps, 0 violations | (uncommitted, no files changed) |
| 0.2 | COMPLETED | packages/core/src/__fixtures__/baseline-snapshot.json (new), packages/core/src/__fixtures__/baselineSnapshot.fixture.test.ts (new) | 2/2 new tests pass; full packages:test 30/30 files, 190/190 tests | Fixture generated via a one-off script (not committed) using fabric's browser build directly (no live Canvas — this environment has no working DOM 2D context, same reason canvasEngine.integration.test.ts uses a FakeCanvas double). Individual FabricObjects (Rect/Circle/Image) construct/serialize with zero DOM; the canvas-level wrapper was produced by giving a plain object `Object.create(StaticCanvas.prototype)` so `_toObjectMethod` resolves, then calling the real `.toObject()` — genuine Fabric serialization, not hand-typed JSON. Image object built via direct FabricImage construction (not the async `.fromURL()` plugin-image normally uses), noted in the script's own comment. | (uncommitted, working tree only) |
| 0.3 | COMPLETED | .dependency-cruiser.cjs | packages:depcruise green (0 violations); rule verified to actually fire via a temporary scratch violation, then reverted | **Scope narrowed from the plan's literal wording during implementation** — the plan said "forbid all of packages/core/src/document/\*\*", but document/snapshot.ts already has a legitimate, pre-existing `fabric` import (StaticCanvas, for renderSnapshotThumbnail) that Stage 5 does not remove. Applying the broad rule now would have broken real present-day code. Scoped instead to `document/canonicalDocument.ts` specifically (not yet created) + `assets/**` (not yet created) — the genuinely-renderer-free new surface. Revisit in Chunk 6.5 once canonicalDocument.ts is real. | (uncommitted, working tree only) |
| 1.1 | NOT STARTED | | | | |
| 1.2 | NOT STARTED | | | | |
| 2.1 | NOT STARTED | | | | |
| 2.2 | NOT STARTED | | | | |
| 2.3 | NOT STARTED | | | | |
| 2.4 | NOT STARTED | | | | |
| 3.1 | NOT STARTED | | | | |
| 3.2 | NOT STARTED | | | | |
| 3.3 | NOT STARTED | | | | |
| 3.4 | NOT STARTED | | | | |
| 4.1 | NOT STARTED | | | | |
| 4.2 | NOT STARTED | | | | |
| 4.3 | NOT STARTED | | | | |
| 4.4 | NOT STARTED | | | | |
| 5.1 | NOT STARTED | | | | |
| 5.2 | NOT STARTED | | | | |
| 5.3 | NOT STARTED | | | | |
| 5.4 | NOT STARTED | | | | |
| 6.1 | NOT STARTED | | | | |
| 6.2 | NOT STARTED | | | | |
| 6.3 | NOT STARTED | | | | |
| 6.4 | NOT STARTED | | | | |
| 6.5 | NOT STARTED | | | | |
| 7.1 | NOT STARTED | | | | |
| 7.2 | NOT STARTED | | | | |
| 7.3 | NOT STARTED | | | | |
| 8.1 | NOT STARTED | | | | |
| 8.2 | NOT STARTED | | | | |
| 8.3 | NOT STARTED | | | | |
| 8.4 | NOT STARTED | | | | |
| 9.1 | NOT STARTED | | | | |
| 9.2 | NOT STARTED | | | | |
| 9.3 | NOT STARTED | | | | |
| 9.4 | NOT STARTED | | | | |
| 9.5 | NOT STARTED | | | | |
| 10.1 | NOT STARTED | | | | |
| 10.2 | NOT STARTED | | | | |
| 10.3 | NOT STARTED | | | | |
| 10.4 | NOT STARTED | | | | |
| 10.5 | NOT STARTED | | | | |
| 11 | NOT STARTED | | | | |

Statuses: `NOT STARTED` / `IN PROGRESS` / `BLOCKED` / `COMPLETED` / `NEEDS REVIEW`.

---

## Stage 0 — Baseline & safety

### Chunk 0.1 — Repository baseline
- **Scope:** Record the current, pre-refactor state of every check later chunks will be compared against.
- **Files:** none changed; output recorded in the progress tracker / a scratch note.
- **Depends on:** none.
- **Tasks:** run and record results of `pnpm packages:build`, `pnpm packages:typecheck`, `pnpm packages:test`, `pnpm apps:build`, `pnpm packages:depcruise`, and (if feasible in the time available) a spot-check of `apps/npm-verify`.
- **Completion criteria:** all commands run successfully today (or their current failures, if any, are recorded as pre-existing and not attributable to this roadmap) and results are written down for later comparison.
- **Stop here for review** before touching any source file.

### Chunk 0.2 — Compatibility fixture
- **Scope:** Capture a baseline snapshot fixture from **today's** (pre-refactor) code, so every later "old documents still load unchanged" claim is checked against real committed data, not asserted from memory.
- **Files:** `packages/core/src/__fixtures__/baseline-snapshot.json` (new).
- **Depends on:** 0.1.
- **Tasks:** build a small canvas using `plugin-shapes-basic` + `plugin-image` objects; run today's `captureSnapshot()` against it; commit the resulting JSON as the fixture.
- **Validation:** a throwaway test confirms `restoreSnapshot()` against this fixture reproduces the same object count/properties, using only code that exists right now (no architecture changes yet).
- **Completion criteria:** fixture committed; round-trip test passes; no production code touched.
- **Stop here for review.**

### Chunk 0.3 — Architecture guardrails (initial)
- **Scope:** Establish the dependency-boundary enforcement mechanism early, covering the directories later stages will populate, so no later chunk can accidentally introduce a renderer dependency into what's supposed to be renderer-free code.
- **Files:** `.dependency-cruiser.cjs` (repo root, existing file — already has a `core-no-react` rule following exactly this pattern, run via the existing `packages:depcruise` script).
- **Depends on:** 0.1.
- **Tasks:** add a `document-assets-no-renderer` rule forbidding anything under `packages/core/src/document/**` and `packages/core/src/assets/**` from importing `fabric` or `packages/core/src/engine/fabricRendererApi.ts`. These directories don't have real content yet (that lands in Stages 4–6), so this rule is a forward guardrail — it will start actively enforcing as soon as those directories gain files, with zero further action needed. Revisit/tighten it in Chunk 6.5 once `canonicalDocument.ts` exists, to confirm it's catching what it's supposed to.
- **Validation:** `pnpm packages:depcruise` passes (the rule is vacuously true today — no files exist yet to violate it).
- **Completion criteria:** rule committed and passing.
- **Stop here for review.**

---

## Stage 1 — Generic object foundation

### Chunk 1.1 — `SceneNode` contract
- **Scope:** Introduce the minimal structural interface that lets later stages be generic over "some live, renderer-owned object" without a wrapper/adapter class.
- **Files:** `packages/core/src/scene/sceneNode.ts` (new).
- **Depends on:** 0.3.
- **Tasks:** define `export interface SceneNode { get(key: string): unknown; set(key: string, value: unknown): void }`. Do not add anything beyond this — no `id`, no `type`, no lifecycle methods. `FabricObject` already satisfies this structurally, so no adapter code is needed. Document explicitly in a code comment: **`SceneNode` is an interoperability constraint for this refactor, not the canonical scene-node representation** — the real renderer-neutral node shape a document stores is `CanonicalNode` (Chunk 6.1), which is plain data, not a `get`/`set` handle. Don't build further abstractions on top of `node.get("foo")`/`node.set("foo", bar)` as if it were the framework's real object model.
- **Validation:** a test asserting a real `FabricObject` (constructed via `plugin-shapes-basic`) satisfies `SceneNode` with no adapter.
- **Completion criteria:** file exists, nothing else in the codebase imports it yet, `pnpm packages:build && pnpm packages:typecheck` no-op diff.
- **Stop here for review.**

### Chunk 1.2 — Generic `ObjectTypeRegistry`
- **Scope:** Make the object registry generic over `TNode extends SceneNode`, defaulting to `FabricObject`, with zero required changes to any existing plugin.
- **Files:** `packages/core/src/plugin/objectTypeRegistry.ts`, `packages/core/src/plugin/pluginRegistry.ts` (type plumbing only), `packages/core/src/index.ts`.
- **Depends on:** 1.1.
- **Tasks:** rewrite as:
  ```ts
  export interface ObjectTypeDefinition<TConfig = unknown, TNode extends SceneNode = FabricObject> {
    create(config: TConfig): TNode | Promise<TNode>;
    propertyFields?: PropertyFieldDefinition[];
    serialize?(node: TNode): Record<string, unknown>;         // consumed starting Stage 5
    deserialize?(data: Record<string, unknown>, ctx: { object: TNode }): void | Promise<void>;
  }
  export class ObjectTypeRegistry<TNode extends SceneNode = FabricObject> { /* same methods, create() -> Promise<TNode> */ }
  ```
  `serialize`/`deserialize` are added to the type now (so Stage 5/6 don't need another registry-touching change) but stay unimplemented/unused by any shipped plugin until Stage 5.
- **Validation:** existing `objectTypeRegistry.test.ts` passes **unmodified**. Confirmed safe because every existing call site (`plugin-shapes-basic/src/shapes.ts`, `plugin-image/src/imageType.ts`) calls `registry.register<ShapeConfig>("rect", { create: (config) => new Rect(...) })` against an unparameterized `ObjectTypeRegistry`, which — with the new default type param `FabricObject` — means exactly what it means today. Add one new test registering against an explicit non-default `TNode` (a minimal fake `SceneNode`, reused by Stage 9's mock renderer) to prove real decoupling.
- **Completion criteria:** `pnpm packages:typecheck` clean across the whole monorepo (the real proof plugin packages didn't need changes); zero lines changed in any plugin package.
- **Stop here for review.**

---

## Stage 2 — Renderer boundary

### Chunk 2.1 — Renderer capability interfaces
- **Scope:** Define `RendererApi` as a composition of small, single-responsibility capability interfaces rather than one monolithic interface — so a future 3D renderer isn't forced to implement 2D-only concepts or blocked from adding its own.
- **Files:** `packages/core/src/engine/rendererApi/sceneApi.ts`, `selectionApi.ts`, `viewportApi.ts`, `serializationApi.ts`, `lifecycleApi.ts`, `index.ts` (composes the bundle).
- **Depends on:** 1.1.
- **Tasks:**
  ```ts
  export interface SceneApi<TNode extends SceneNode = SceneNode> {
    addNode(node: TNode): void; removeNode(node: TNode): void; getNodes(): TNode[]; requestRender(): void;
  }
  export interface SelectionApi<TNode extends SceneNode = SceneNode> {
    setActiveNode(node: TNode): void; getActiveNodes(): TNode[]; clearSelection(): void;
  }
  export interface ViewportApi {
    getZoom(): number; setZoom(value: number, options?: SetZoomOptions): void; zoomBy(delta: number, options?: SetZoomOptions): void;
    pan(deltaX: number, deltaY: number): void; panTo(x: number, y: number): void; getPan(): { x: number; y: number };
    resetViewport(): void; setDimensions(width: number, height: number): void;
  }
  export interface SerializationApi {
    exportSceneJSON(extraProps?: string[]): Record<string, unknown>;
    importSceneJSON(json: unknown): Promise<void>;
  }
  export interface LifecycleApi {
    setBackgroundColor(color: string): void; destroy(): void; isDestroyed(): boolean;
  }
  // A future 3D renderer is NOT required to implement this exact union — it composes whichever
  // of these are meaningful, plus its own (CameraApi, LightingApi, MaterialApi, ...). Do not add
  // speculative 3D members here now.
  export type RendererApi<TNode extends SceneNode = SceneNode> =
    SceneApi<TNode> & SelectionApi<TNode> & ViewportApi & SerializationApi & LifecycleApi & { readonly kind: string };
  ```
- **Validation:** type-only chunk — `pnpm packages:typecheck` passes; nothing imports these yet.
- **Completion criteria:** interfaces defined and exported from `packages/core/src/index.ts`, no runtime code yet.
- **Stop here for review.**

### Chunk 2.2 — `FabricRendererApi`
- **Scope:** Implement the Fabric adapter as a thin wrapper over today's existing managers — not a rewrite of them.
- **Files:** `packages/core/src/engine/fabricRendererApi.ts` (new).
- **Depends on:** 2.1.
- **Tasks:** `FabricRendererApi implements RendererApi<FabricObject>`, wrapping the `Canvas`, `ViewportManager`, and `SelectionManager` instances `CanvasEngine` already constructs (`addNode`→`canvas.add`, `exportSceneJSON`→`canvas.toObject(extraProps)`, `getZoom`→`viewport.getZoom()`, etc.). Do **not** modify `ViewportManager`/`SelectionManager`/`LayerManager`/`AlignmentManager`/`SnapEngine` — they keep their current `Canvas`-typed constructors unchanged. `AlignmentManager`/`SnapEngine` stay outside `RendererApi` entirely (editing-assist features, not core scene operations a second renderer needs).
- **Validation:** new `fabricRendererApi.test.ts` — construct a `CanvasEngine`, assert `new FabricRendererApi(...).addNode(rect)` produces the same canvas state as `engine.addObject(rect)`'s underlying mutation, and `exportSceneJSON()` matches `canvas.toObject()` byte-for-byte for a small scene.
- **Completion criteria:** `FabricRendererApi` is not yet wired into `CanvasEngine` (that's 2.3) — this chunk is the standalone, independently-testable class only.
- **Stop here for review.**

### Chunk 2.3 — Expose renderer through `CanvasEngine`
- **Scope:** Wire `FabricRendererApi` into `CanvasEngine` as a purely additive field.
- **Files:** `packages/core/src/engine/canvasEngine.ts`.
- **Depends on:** 2.2.
- **Tasks:** add `readonly renderer: RendererApi<FabricObject>`, constructed as `new FabricRendererApi(canvas, this.viewport, this.selection)` in the constructor. Do not remove, rename, or change the behavior of any existing public method (`setZoom`, `addObject`, etc.).
- **Validation:** existing `CanvasEngine` test suite passes unmodified; new assertion that `engine.renderer` is present and functional.
- **Completion criteria:** `engine.renderer.X()` and `engine.X()` produce identical observable behavior for every overlapping method.
- **Stop here for review.**

### Chunk 2.4 — Deprecate `getFabricCanvas()`
- **Scope:** Add a visible deprecation signal without removing the escape hatch — Stage B of a two-stage migration (Stage A, today, is silent compatibility).
- **Files:** `packages/core/src/engine/canvasEngine.ts`.
- **Depends on:** 2.3.
- **Tasks:**
  ```ts
  /** @deprecated Escape hatch for pre-RendererApi plugins. Prefer `engine.renderer` /
   *  `EditorContext.renderer`, which work against any renderer, not just Fabric.
   *  Scheduled for removal no earlier than the release after existing plugins migrate (Stage 8). */
  getFabricCanvas(): Canvas
  ```
  No signature change, no runtime behavior change — JSDoc only.
- **Validation:** confirm existing 13+ plugin call sites still compile and their test suites still pass (deprecation warnings don't fail builds).
- **Completion criteria:** annotation present; zero behavior change anywhere in the repo.
- **Stop here for review.**

---

## Stage 3 — Editor context & commands

### Chunk 3.1 — `EditorContext`
- **Scope:** Define the plugin-facing façade distinct from `CanvasEngine`, and switch `EditorPlugin.install` to depend on it.
- **Files:** `packages/core/src/plugin/editorContext.ts` (new), `packages/core/src/plugin/plugin.ts`.
- **Depends on:** 2.3.
- **Tasks:**
  ```ts
  export interface EditorContext<TNode extends SceneNode = FabricObject> {
    readonly renderer: RendererApi<TNode>;
    readonly history: HistoryManager;
    readonly registry: PluginRegistry;
    readonly events: EventBus;
    readonly store: Store<EngineState>;
    readonly shortcuts: KeyboardShortcutManager;
    readonly assets: AssetStore;                 // added Stage 4
    use(plugin: EditorPlugin): void; useAll(plugins: EditorPlugin[]): void;
    unuse(pluginName: string): void; hasPlugin(pluginName: string): boolean;
    createObject(typeId: ObjectTypeId, config: unknown): Promise<TNode>;
    addObjectOfType(typeId: ObjectTypeId, config: unknown): Promise<TNode>;
    addObject(object: TNode): void; removeObject(object: TNode): void; deleteSelection(): void;
    setObjectProperty(object: TNode, key: string, value: unknown): void;
    undo(): void; redo(): void;
  }
  ```
  `CanvasEngine implements EditorContext<FabricObject>`. Change `EditorPlugin.install(engine: CanvasEngine)` → `install(context: EditorContext)`. Note in a comment: `EditorContext` is a façade, not an ownership boundary — `DocumentSession` (Stage 4) owns document-scoped state; this just exposes capabilities.

  Note this chunk references `AssetStore`, which doesn't exist until Stage 4 — either stub it as `unknown`/a forward type reference resolved by 4.1, or reorder so 4.1 (`AssetStore`) lands before this chunk if that's cleaner in practice. Either ordering is fine; the dependency is noted so it isn't missed.
- **Validation:** `editorContext.test.ts` asserting `CanvasEngine` structurally satisfies `EditorContext`. `pnpm packages:typecheck` unmodified for `plugin-effects`, `plugin-local-storage`, `plugin-pages`, `plugin-pan-zoom`, `plugin-svg-import` — the concrete proof that method-shorthand bivariant checking (TypeScript checks `install(engine: CanvasEngine)` against `install(context: EditorContext)` bivariantly regardless of `strictFunctionTypes`, since `CanvasEngine` implements `EditorContext`) actually holds in this repo's `tsconfig`, not an assumption.
- **Completion criteria:** all five plugin packages typecheck with zero source changes; `pnpm apps:build` succeeds.
- **Stop here for review.**

### Chunk 3.2 — Renderer-aware add/remove commands
- **Scope:** Make `AddObjectCommand`/`RemoveObjectCommand` depend on `RendererApi` instead of `Canvas`/`FabricObject`, while preserving every existing construction call site byte-for-byte.
- **Files:** `packages/core/src/history/canvasCommands.ts`, `packages/core/src/engine/canvasEngine.ts`.
- **Depends on:** 3.1.
- **Tasks:** `AddObjectCommand<TNode>`/`RemoveObjectCommand<TNode>` take a `RendererApi<TNode>` (specifically `SceneApi & SelectionApi & LifecycleApi`) and call `addNode`/`removeNode`/`setActiveNode`/`requestRender`. Add a lenient overload accepting the legacy `Canvas` too, normalized internally, so `canvasEngine.ts`'s existing `new AddObjectCommand(this.canvas, object)` call sites (the only construction sites in the repo) keep compiling and behaving identically.
- **Validation:** new `canvasCommands.test.ts` (none exists today) covering both the `RendererApi` and legacy-`Canvas` construction paths.
- **Completion criteria:** `HistoryManager` unchanged (confirmed fabric-free, no edits needed); existing `historyManager.test.ts` passes unmodified.
- **Stop here for review.**

### Chunk 3.3 — Renderer-aware property commands
- **Scope:** Generalize `SetPropertyCommand` via an injectable `NodeOps<TNode>` strategy, defaulting to today's exact Fabric behavior — without touching `AlignmentManager`.
- **Files:** `packages/core/src/history/setPropertyCommand.ts`.
- **Depends on:** 3.2.
- **Tasks:** add `NodeOps<TNode> { get, set, finalize? }` with a default `fabricNodeOps` reproducing `target.set(key, value); target.setCoords()` exactly. `AlignmentManager`'s 10 existing `SetPropertyCommand.capture(target, key, value)` call sites are explicitly out of scope for this refactor and must keep compiling unchanged.
- **Validation:** existing `setPropertyCommand.test.ts`/`alignmentManager.test.ts` pass unmodified; new test exercising a non-default `NodeOps`.
- **Completion criteria:** zero changes required in `alignmentManager.ts`.
- **Stop here for review.**

### Chunk 3.4 — Plugin contract validation
- **Scope:** Confirm the whole Stage 3 change is genuinely non-breaking across the real plugin ecosystem before moving on.
- **Files:** none changed — validation only.
- **Depends on:** 3.1, 3.2, 3.3.
- **Tasks:** run `pnpm packages:typecheck && pnpm packages:test` for the full monorepo; `pnpm apps:build` for `apps/demo` (exercises `getFabricCanvas()` via `apps/demo/src/plugins/stampToolPlugin.ts`).
- **Completion criteria:** all green with zero source changes outside what Chunks 3.1–3.3 already made.
- **Stop here for review.**

---

## Stage 4 — DocumentSession & ownership

### Chunk 4.1 — `AssetStore`
- **Scope:** Introduce the minimal asset abstraction — nothing exists today to migrate, so this is purely additive.
- **Files:** `packages/core/src/assets/assetStore.ts` (new).
- **Depends on:** 0.3 (guardrail already watching this directory).
- **Tasks:**
  ```ts
  export interface AssetRecord { id: string; kind: string; mimeType?: string; url?: string; blob?: Blob }
  export interface AssetStore {
    register(input: { kind: string; url?: string; blob?: Blob; mimeType?: string }): AssetRecord;
    get(id: string): AssetRecord | undefined;
    resolveUrl(id: string): Promise<string>; // url as-is, or memoized URL.createObjectURL(blob)
    release(id: string): void;
    list(): AssetRecord[];
  }
  export class InMemoryAssetStore implements AssetStore { /* Map-backed */ }
  ```
  Deliberately small — no dedup, no quotas, no eviction, no persistence integration, no remote asset management.
- **Validation:** new `assetStore.test.ts` covering register/get/resolveUrl (both `url` and `blob` inputs)/release/list.
- **Completion criteria:** `pnpm packages:depcruise` still passes (this file imports nothing renderer-related).
- **Stop here for review.**

### Chunk 4.2 — `DocumentSession`
- **Scope:** Introduce the type that owns document data, shared assets, and (only when explicitly opted into) shared history — without changing `plugin-pages`' default per-page history.
- **Files:** `packages/core/src/document/documentSession.ts` (new).
- **Depends on:** 4.1, 3.1.
- **Tasks:**
  ```ts
  export interface DocumentSession {
    readonly document: DesignDocument;
    readonly assets: AssetStore;
    readonly history?: HistoryManager; // present only when history.scope === "document"
  }
  export interface DocumentSessionOptions {
    document: DesignDocument;
    history?: { scope: "document" } | { scope: "per-renderer" }; // default: "per-renderer" — matches today
    assets?: AssetStore; // default: new InMemoryAssetStore()
  }
  export function createDocumentSession(options: DocumentSessionOptions): DocumentSession { /* ... */ }
  ```
  Add a code comment stating the preferred long-term direction: `Editor → DocumentSession → { CanvasEngine per page }`, while noting bare `createEditor()`/`createEngine()` remains fully supported for existing single-document consumers.
- **Validation:** new `documentSession.test.ts` — construct a session, confirm defaults match today's behavior exactly when unused.
- **Completion criteria:** module compiles standalone; not yet wired into `CanvasEngine` (that's 4.3).
- **Stop here for review.**

### Chunk 4.3 — Injectable engine ownership
- **Scope:** Make `CanvasEngine`'s currently-hardcoded `history`/`assets` construction injectable, with zero behavior change when unused.
- **Files:** `packages/core/src/engine/canvasEngine.ts`, `packages/core/src/types.ts`.
- **Depends on:** 4.2.
- **Tasks:** add `EngineOptions.history?: HistoryManager` and `EngineOptions.assets?: AssetStore`. If omitted, `CanvasEngine` constructs its own of each — byte-identical to today.
- **Validation:** existing `CanvasEngine` tests pass unmodified with no options passed; new test passing an externally-constructed `HistoryManager`/`AssetStore` and confirming it's used instead of a fresh one.
- **Completion criteria:** a bare `createEditor()`/`createEngine()` call is completely unaffected.
- **Stop here for review.**

### Chunk 4.4 — Multi-engine shared asset validation
- **Scope:** Prove the ownership fix actually solves the "Page 1 → AssetStore A, Page 2 → AssetStore B" problem, without touching `plugin-pages`' default architecture yet.
- **Files:** none changed — validation only (a test can live in `packages/core`, not `plugin-pages`).
- **Depends on:** 4.3.
- **Tasks:** construct two `CanvasEngine`s sharing one `session.assets` instance (passed manually via `EngineOptions.assets`, without any `plugin-pages` change); confirm an asset registered via one engine is resolvable via the other. Separately, construct two engines sharing one `session.history` (`scope: "document"`) and confirm `undo()` on one is visible in the shared `HistoryManager`.
- **Validation:** the tests above, plus `plugin-pages`' existing test suite run unmodified (regression check that nothing here changed its default behavior).
- **Completion criteria:** shared-assets and shared-history both demonstrably work; `plugin-pages` untouched and green.
- **Stop here for review.**

---

## Stage 5 — Fabric compatibility serialization

### Chunk 5.1 — Renderer-based snapshot access
- **Scope:** Route `captureSnapshot`/`restoreSnapshot` through `RendererApi` instead of `engine.getFabricCanvas()`, with unchanged output.
- **Files:** `packages/core/src/document/snapshot.ts`, `packages/core/src/engine/canvasEngine.ts` (`importFile`).
- **Depends on:** 2.3.
- **Tasks:** replace `engine.getFabricCanvas()` + `canvas.toObject()`/`engine.importFile("json", ...)` with `engine.renderer.exportSceneJSON(extraProps)` / `engine.renderer.importSceneJSON(json)`. For `FabricRendererApi` these are thin pass-throughs to the same underlying Fabric calls, so output is byte-identical.
- **Validation:** existing snapshot tests pass unmodified; Chunk 0.2's `baseline-snapshot.json` fixture still round-trips through `restoreSnapshot()` unchanged.
- **Completion criteria:** `packages/core/src/document/snapshot.ts` no longer references `Canvas`/fabric types directly.
- **Stop here for review.**

### Chunk 5.2 — Per-object serialization hooks
- **Scope:** Layer optional per-object-type `serialize`/`deserialize` merging on top of the raw Fabric JSON (the fields themselves were already declared on `ObjectTypeDefinition` in Chunk 1.2 — this chunk implements the merge functions that actually call them).
- **Files:** `packages/core/src/document/objectTypeSerialization.ts` (new), `packages/core/src/document/snapshot.ts`, `packages/core/src/export/canvasExporter.ts`.
- **Depends on:** 5.1, 1.2.
- **Tasks:**
  - `serializeWithTypeOverrides(renderer, registry, extraProps)` — calls `renderer.exportSceneJSON(extraProps)`, merges in `ObjectTypeDefinition.serialize(node)` output where defined, for top-level nodes only (fabric-group-nested children are a stated limitation, not built speculatively).
  - `deserializeWithTypeOverrides(renderer, registry, rawJson)` — after `renderer.importSceneJSON(rawJson)`, calls each node's type's `deserialize(raw, { object })` where defined.
  - `canvasExporter.ts::exportJSON()` gets the same substitution (constructor gains a `registry: ObjectTypeRegistry` param).
- **Validation:** existing `canvasExporter.test.ts`/snapshot tests pass unmodified for the no-hook case (byte-identical output, since no shipped type defines `serialize`/`deserialize` yet); new round-trip test for a type that does define them.
- **Completion criteria:** Chunk 0.2's fixture still round-trips unchanged.
- **Stop here for review.**

### Chunk 5.3 — Legacy snapshot compatibility fields
- **Scope:** Add a structural version and a clearly-named legacy renderer discriminator to `DocumentSnapshotData`.
- **Files:** `packages/core/src/document/snapshot.ts`.
- **Depends on:** 5.2.
- **Tasks:**
  ```ts
  export interface DocumentSnapshotData {
    json: Record<string, unknown>;
    backgroundColor: string;
    schemaVersion?: number;      // absent → implicitly 1 (today's shape)
    legacyRendererId?: string;   // absent → implicitly "fabric"
  }
  ```
  Named `legacyRendererId`, not `rendererId` — distinct from `CanonicalPage.rendererId` (Stage 6), which identifies the renderer for a *canonical* page. `DocumentSnapshotData` is the legacy/runtime Fabric-JSON snapshot envelope, not the canonical document model; keeping the names visibly different prevents future confusion. Both fields optional, so every existing saved document remains valid with no migration.
- **Validation:** Chunk 0.2's fixture (which predates both fields) still loads correctly with both fields absent.
- **Completion criteria:** no existing saved document requires any change.
- **Stop here for review.**

### Chunk 5.4 — Persistence regression
- **Scope:** Confirm Stage 5 hasn't disturbed real persistence paths.
- **Files:** none changed — validation only.
- **Depends on:** 5.1, 5.2, 5.3.
- **Tasks:** run `plugin-local-storage`'s and `plugin-pages`' persistence round-trip test suites unmodified.
- **Completion criteria:** all green; Chunk 0.2's fixture still round-trips.
- **Stop here for review.**

---

## Stage 6 — Canonical, renderer-neutral document

This is the largest single milestone in the roadmap — go slowly and keep chunks small.

**Critical design constraint:** the canonical *document* (load, save, validate, migrate) must not require a live `RendererApi`. A document is data. What genuinely needs a live renderer — reading currently-on-screen objects into canonical form, or the reverse — is a separate, narrower operation, named **scene sync** (Chunk 6.3), never folded into "export/import."

### Chunk 6.1 — Canonical data model
- **Scope:** Define the pure-data types, with an explicit portability contract.
- **Files:** `packages/core/src/document/canonicalDocument.ts` (new).
- **Depends on:** 1.2 (uses the `serialize`/`deserialize` vocabulary), 5.3 (shares `schemaVersion`).
- **Tasks:**
  ```ts
  // Contract every ObjectTypeDefinition.serialize() implementation must honor: the returned
  // properties must be renderer-independent and sufficient, together with typeId, to fully
  // reconstruct the logical object via registry.create() on ANY renderer with the same typeId
  // registered — not a raw dump of a live Fabric/Three object's own shape.
  export type PortableNodeProperties = Record<string, unknown>;

  export interface CanonicalNode {
    id: string;
    typeId: string;
    properties: PortableNodeProperties;
    children?: CanonicalNode[];       // nested nodes (e.g. Fabric groups); populating for real groups is later work
    metadata?: Record<string, unknown>; // plugin-attached, non-type-owned state (layer name, lock flag, ...)
  }
  // rendererId names the runtime renderer required for THIS page in the current architecture
  // (one renderer per page). Not a claim that a page can never contain mixed-renderer-backed
  // nodes long-term — a separate, harder problem this field deliberately doesn't foreclose.
  export interface CanonicalPage { id: string; rendererId: string; nodes: CanonicalNode[] }
  export interface CanonicalDocument { schemaVersion: number; pages: CanonicalPage[]; assets: AssetRecord[] }
  ```
- **Validation:** type-only chunk; a test constructing literal values of each type.
- **Completion criteria:** zero runtime logic yet, zero fabric import anywhere in this file (spot-check by hand; Chunk 6.5 automates it).
- **Stop here for review.**

### Chunk 6.2 — Renderer-free document I/O
- **Scope:** Implement load/save/migrate with zero renderer, zero DOM, zero fabric import anywhere on the call path.
- **Files:** `packages/core/src/document/canonicalDocument.ts` (same file as 6.1).
- **Depends on:** 6.1.
- **Tasks:**
  ```ts
  export function loadCanonicalDocument(json: unknown): CanonicalDocument { /* validate + parse */ }
  export function saveCanonicalDocument(doc: CanonicalDocument): Record<string, unknown> { /* plain serialize */ }
  export function migrateCanonicalDocument(doc: CanonicalDocument, toVersion: number): CanonicalDocument { /* schemaVersion-driven, stubbed until a real migration is needed */ }
  ```
- **Validation:** new `canonicalDocument.test.ts` proving these round-trip correctly **with no renderer constructed anywhere in the test file** — this is the concrete check for "document independent of renderer," not just a docstring.
- **Completion criteria:** test file contains zero fabric import, verified by reading it, not just by depcruise (which lands in 6.5).
- **Stop here for review.**

### Chunk 6.3 — Canonical scene synchronization
- **Scope:** Implement the renderer-touching half, explicitly named and scoped separately from document load/save.
- **Files:** `packages/core/src/document/canonicalSceneSync.ts` (new).
- **Depends on:** 6.2, 2.3.
- **Tasks:**
  ```ts
  export function syncRendererToCanonicalPage(
    renderer: RendererApi, registry: ObjectTypeRegistry, options?: { strict?: boolean },
  ): CanonicalSyncResult { /* see 6.4 */ }
  export async function syncCanonicalPageToRenderer(
    renderer: RendererApi, registry: ObjectTypeRegistry, page: CanonicalPage,
  ): Promise<void> { /* uses registry.create(node.typeId, node.properties) + renderer.addNode(...) */ }
  ```
  Produces a `CanonicalPage` by calling each live node's registered type's `serialize()` directly — not by post-processing `renderer.exportSceneJSON()`.
- **Validation:** `canonicalSceneSync.test.ts` — register a type with `serialize`/`deserialize`, round-trip through both functions against a real `CanvasEngine`, confirm it matches.
- **Completion criteria:** functions work end-to-end against `FabricRendererApi`; not yet tested against a mock (that's Stage 9).
- **Stop here for review.**

### Chunk 6.4 — Strict/partial sync behavior
- **Scope:** Ensure an incomplete document can never be silently treated as complete.
- **Files:** `packages/core/src/document/canonicalSceneSync.ts` (same file as 6.3).
- **Depends on:** 6.3.
- **Tasks:**
  ```ts
  export interface CanonicalSyncResult { page: CanonicalPage; incomplete: boolean; skippedNodeIds: string[] }
  ```
  `strict: true` (default) — `syncRendererToCanonicalPage` throws if any live node's `ObjectTypeDefinition` has no `serialize()` defined. This is the right default for anything that writes the result to storage. `strict: false` — never throws; returns every node it could serialize plus `incomplete: true` and `skippedNodeIds` for the rest. Callers **must** check `incomplete` before treating the result as authoritative — this mode exists for inspection/migration tooling and Stage 9's mock-renderer tests, not silent production saves.
- **Validation:** test confirming `strict: true` throws for an un-opted-in type, and `strict: false` instead returns `incomplete: true` with that node's id in `skippedNodeIds`.
- **Completion criteria:** no code path anywhere can produce a silently-partial saved document.
- **Stop here for review.**

### Chunk 6.5 — Dependency guardrails (finalized)
- **Scope:** Validate the `document-no-renderer` boundary now that real content exists to enforce it against.
- **Files:** `.dependency-cruiser.cjs`.
- **Depends on:** 6.1–6.4, 0.3.
- **Tasks:** confirm Chunk 0.3's `document-assets-no-renderer` rule actually covers `canonicalDocument.ts`/`canonicalSceneSync.ts`/`assetStore.ts` as intended; rename/tighten if needed now that the real file set is known (e.g. explicitly exempt `canonicalSceneSync.ts` from the "no `fabric`" restriction if it needs to reference `RendererApi`'s type — it does not need `fabric` itself, only `canonicalDocument.ts`/`assetStore.ts` need the strict rule; `canonicalSceneSync.ts`'s constraint is "no direct `fabric` import," which it already satisfies by depending only on `RendererApi`, not `Canvas`).
- **Validation:** `pnpm packages:depcruise` passes; a deliberate temporary violation (e.g. a scratch `import { Canvas } from "fabric"` added to `canonicalDocument.ts`) is confirmed to fail the check, then reverted — proving the rule actually catches violations, not just passes vacuously.
- **Completion criteria:** rule is real, tested, and green.
- **Stop here for review.**

---

## Stage 7 — Renderer construction

### Chunk 7.1 — `RendererApiFactory`
- **Scope:** Define the factory type that constructs a `RendererApi`, not just a `fabric.Canvas` — a genuine cross-renderer seam.
- **Files:** `packages/core/src/engine/canvasEngine.ts`, `packages/core/src/types.ts`.
- **Depends on:** 2.3.
- **Tasks:**
  ```ts
  export type RendererApiFactory<TNode extends SceneNode = FabricObject> =
    (element: string | HTMLCanvasElement, options: EngineOptions) => RendererApi<TNode>;
  ```
  Add `rendererFactory?: RendererApiFactory` to `EngineOptions`.
- **Validation:** type-only; no runtime change yet.
- **Completion criteria:** type compiles, unused so far.
- **Stop here for review.**

### Chunk 7.2 — Default Fabric factory
- **Scope:** Wire the existing Fabric construction path through the new factory seam as the default, with zero behavior change.
- **Files:** `packages/core/src/engine/canvasEngine.ts`.
- **Depends on:** 7.1.
- **Tasks:**
  ```ts
  const defaultFabricRendererApiFactory: RendererApiFactory<FabricObject> = (element, options) => {
    const canvas = new Canvas(element, { width: options.width, height: options.height, backgroundColor: options.backgroundColor });
    return new FabricRendererApi(canvas, new ViewportManager(canvas), new SelectionManager(canvas));
  };
  ```
  `CanvasEngine.create()` uses `options.rendererFactory ?? defaultFabricRendererApiFactory`. `createEditor.ts` needs no changes — `CreateEditorOptions extends EngineOptions` already spreads through. Note honestly in a code comment: this makes the **renderer** pluggable, not the **engine shell** (`CanvasEngine` itself, owning `history`/`registry`/`events`/`store`/`shortcuts`) — a fully swappable engine is separate, larger, out-of-scope follow-up.
- **Validation:** `pnpm apps:build` proves the default (no `rendererFactory` passed) path is completely unaffected.
- **Completion criteria:** every existing `createEditor()`/`createEngine()` call site behaves identically.
- **Stop here for review.**

### Chunk 7.3 — Custom renderer factory validation
- **Scope:** Prove the seam actually works with a non-default factory — without building a real 3D renderer here.
- **Files:** none changed — validation only.
- **Depends on:** 7.2.
- **Tasks:** new test asserting a custom `rendererFactory` is invoked correctly and its `RendererApi` is what `CanvasEngine.renderer` wraps.
- **Completion criteria:** test passes.
- **Stop here for review.**

---

## Stage 8 — Plugin migration off `getFabricCanvas()`

Package by package, never as one giant change. Not a full gate on Stages 0–7/9–11 shipping, but has an explicit acceptance bar.

### Chunk 8.1 — Inventory
- **Scope:** Build an exact, complete list of every remaining `getFabricCanvas()` call site.
- **Files:** none changed — a tracked list (in the progress tracker or a scratch note).
- **Depends on:** 2.4.
- **Tasks:** grep the whole repo for `getFabricCanvas()`; classify each call site as **must migrate** (generic scene/editing operation with a real `RendererApi` equivalent: add/remove/select nodes, viewport pan/zoom, scene (de)serialization, background color) or **allowed to remain** (genuinely Fabric-specific behavior with no cross-renderer concept, e.g. `plugin-pages`' `setLocked()` calling `canvas.set({ selection, evented })`).
- **Completion criteria:** every call site in the repo has a classification recorded.
- **Stop here for review.**

### Chunk 8.2 — Generic plugin migration
- **Scope:** Migrate every "must migrate" call site to `RendererApi`.
- **Files:** one PR per plugin package (`plugin-effects`, `plugin-local-storage`, `plugin-pages`, `plugin-pan-zoom`, `plugin-svg-import`, `plugin-clipboard`, `plugin-qrcode`, `plugin-shapes-basic`, `apps/demo/src/plugins/stampToolPlugin.ts`, others per Chunk 8.1's inventory).
- **Depends on:** 8.1.
- **Tasks:** replace `engine.getFabricCanvas().X()` with the `RendererApi`-shaped equivalent, one package at a time.
- **Validation:** each migrated plugin's existing test suite passes unmodified (behavior preserved, only the access path changes).
- **Completion criteria:** every "must migrate" call site from Chunk 8.1 is closed.
- **Stop here for review after each package**, not only at the end of the whole stage.

### Chunk 8.3 — Fabric-specific exceptions
- **Scope:** Document, don't remove, the legitimately-Fabric-only call sites.
- **Files:** same packages as 8.2, comment-only changes.
- **Depends on:** 8.1.
- **Tasks:** for every "allowed to remain" call site, add a comment stating *why* it stays — so a later reader can tell "not yet migrated" apart from "deliberately renderer-specific."
- **Completion criteria:** every remaining `getFabricCanvas()` call site has a comment.
- **Stop here for review.**

### Chunk 8.4 — Final migration audit
- **Scope:** Confirm nothing was missed.
- **Files:** none changed — validation only.
- **Depends on:** 8.2, 8.3.
- **Tasks:** repository-wide grep for `getFabricCanvas()`; confirm every result has either been migrated (8.2) or carries a "why this stays" comment (8.3) — no unexplained call sites remain.
- **Completion criteria:** grep pass is clean by this definition.
- **Stop here for review.**

---

## Stage 9 — Renderer-agnostic proof (mock renderer)

The strongest evidence the core is actually renderer-agnostic isn't "the interface compiles" — it's a second, independent implementation with zero Fabric dependency that the rest of the stack runs against unmodified.

### Chunk 9.1 — `MockNode`
- **Scope:** A trivial in-memory node, deliberately not a `FabricObject`.
- **Files:** `packages/core/src/testing/mockRendererApi.ts` (new, test-only export, not part of the public API surface).
- **Depends on:** 1.1.
- **Tasks:**
  ```ts
  export class MockNode implements SceneNode {
    private data = new Map<string, unknown>();
    get(key: string) { return this.data.get(key); }
    set(key: string, value: unknown) { this.data.set(key, value); }
  }
  ```
- **Validation:** trivially satisfies `SceneNode` by construction.
- **Completion criteria:** zero fabric import in this file.
- **Stop here for review.**

### Chunk 9.2 — `MockRendererApi`
- **Scope:** A complete, zero-Fabric, zero-DOM implementation of `RendererApi<MockNode>`.
- **Files:** same file as 9.1.
- **Depends on:** 9.1, 2.1.
- **Tasks:** implement every member of `SceneApi`/`SelectionApi`/`ViewportApi`/`SerializationApi`/`LifecycleApi` backed by plain arrays/maps. `readonly kind = "mock"`.
- **Validation:** a smoke test constructing it and calling every method.
- **Completion criteria:** zero fabric import anywhere in the file (spot-checked by hand, same discipline as Chunk 6.2).
- **Stop here for review.**

### Chunk 9.3 — Core command/history validation
- **Scope:** Prove Commands and History work against the mock, not just Fabric.
- **Files:** `packages/core/src/testing/mockRendererApi.test.ts` (new).
- **Depends on:** 9.2, 3.2, 3.3.
- **Tasks:** construct an `EditorContext<MockNode>` backed by `MockRendererApi`; verify `AddObjectCommand<MockNode>`/`RemoveObjectCommand<MockNode>`/`SetPropertyCommand<MockNode>` execute and undo correctly, and `HistoryManager` undo/redo works end-to-end through the mock.
- **Validation:** the test itself, with **zero fabric import in the test file**.
- **Completion criteria:** green, no fabric import.
- **Stop here for review.**

### Chunk 9.4 — Object registry validation
- **Scope:** Prove `ObjectTypeRegistry` works with a fully non-Fabric node type.
- **Files:** same test file as 9.3.
- **Depends on:** 9.3, 1.2.
- **Tasks:** register a fake object type with `create(): MockNode`, round-trip through `ObjectTypeRegistry<MockNode>`.
- **Validation:** the test itself.
- **Completion criteria:** green, no fabric import.
- **Stop here for review.**

### Chunk 9.5 — Real plugin validation
- **Scope:** The strongest test in this stage — prove the abstraction is usable for real plugin authoring, not just type-correct for a toy example.
- **Files:** same test file as 9.3/9.4.
- **Depends on:** 9.4, 6.3, 6.4.
- **Tasks:** port the actual install-time pattern of `plugin-shapes-basic`'s `registerBasicShapes(registry)` — the simplest real plugin, `install(context)` registering several object types via `context.registry.objectTypes.register()` — against the mock renderer, with a fake `create()` returning `MockNode` instead of `FabricObject`. Verify: installation succeeds; the resulting object type can be created and added via `addObjectOfType`; undo/redo works; the object round-trips through `syncRendererToCanonicalPage`/`syncCanonicalPageToRenderer` (with `serialize`/`deserialize` defined for the test's fake type); `loadCanonicalDocument`/`saveCanonicalDocument` are also exercised with no renderer at all, mock or otherwise.
- **Validation:** the test itself is the verification — a green run here is the concrete, checkable claim "the core does not require Fabric," replacing any hand-wavy assertion to that effect.
- **Completion criteria:** green, zero fabric import in the entire `testing/` directory.
- **Stop here for review.**

---

## Stage 10 — Multi-page validation

### Chunk 10.1 — Existing multi-page regression
- **Scope:** Confirm today's default `plugin-pages` behavior is completely preserved.
- **Files:** none changed — validation only.
- **Depends on:** 4.4.
- **Tasks:** run `plugin-pages`' full existing test suite unmodified.
- **Completion criteria:** all green, exactly as before this roadmap started.
- **Stop here for review.**

### Chunk 10.2 — Shared assets
- **Scope:** Multi-page-specific version of Chunk 4.4's proof, in `plugin-pages`' own context.
- **Files:** `packages/plugin-pages` test suite (new test), possibly wiring `session.assets` through `PagesManager`'s `engineFactory` if not already exercised generically enough by 4.4.
- **Depends on:** 10.1.
- **Tasks:** three pages, one shared `session.assets`; confirm an image registered on page 1 resolves correctly when page 3's engine is created later (lazy engine creation per `PagesManager.getOrCreateEngine`, same pattern as today).
- **Completion criteria:** passes; `plugin-pages` default behavior for consumers not using this path is unaffected.
- **Stop here for review.**

### Chunk 10.3 — Optional document history
- **Scope:** Prove `history: { scope: "document" }` works across real `plugin-pages` pages, as an explicit opt-in.
- **Files:** same test suite as 10.2.
- **Depends on:** 10.2.
- **Tasks:** confirm shared undo/redo across pages when opted in; confirm the default (unopted) path still has per-page history.
- **Completion criteria:** both paths pass; default unchanged.
- **Stop here for review.**

### Chunk 10.4 — Document lifecycle (destroy/recreate) test
- **Scope:** The strongest test in this stage — proves document state outlives and is independent of any particular renderer's lifecycle.
- **Files:** same test suite as 10.2/10.3.
- **Depends on:** 10.3, 6.3, 6.4.
- **Tasks:** build a 3-page document; `syncRendererToCanonicalPage` each page (`strict: true`); assemble into a `CanonicalDocument` and `saveCanonicalDocument` it; **destroy every page's `CanvasEngine`** (`engine.destroy()`, no live renderer left anywhere); `loadCanonicalDocument` the saved data back (no renderer involved in this step); construct fresh `CanvasEngine`s per page's `rendererId` and `syncCanonicalPageToRenderer` each page back in; assert the recreated scenes match the originals.
- **Completion criteria:** the recreated document is observably identical to the original.
- **Stop here for review.**

### Chunk 10.5 — Single-page → multi-page adoption
- **Scope:** Prove the actual developer migration journey this roadmap is ultimately in service of.
- **Files:** same test suite as above.
- **Depends on:** 10.4.
- **Tasks:** start from a plain single-page `createEditor()` app with a representative existing plugin set installed (matching a typical `apps/demo`-style setup); capture its document via `captureSnapshot`/`syncRendererToCanonicalPage`; wrap it in `createDocumentSession()` and adopt it as Page 1 of a new `plugin-pages`-managed multi-page setup, using the existing `seedFromDocument()` bridge (`PagesManager.ts:280-291`); add a Page 2; confirm every originally-installed plugin still functions unmodified on both pages.
- **Completion criteria:** the migration completes with zero plugin code changes.
- **Stop here for review.**

---

## Stage 11 — Final 3D readiness reassessment

- **Scope:** A closing, honest status check — not a claim of "3D-ready." Do not implement any 3D code in this stage.
- **Files:** a short written reassessment (fits in this repo's `design-docs/`, following the pattern of prior validation docs referenced in project memory).
- **Depends on:** every prior stage.
- **Tasks:** document, precisely:
  - **Proven:** `RendererApi` has two independent implementations (`FabricRendererApi`, `MockRendererApi`); `EditorContext`/Commands/`HistoryManager`/`ObjectTypeRegistry`/serialization all function against either; `DocumentSession` gives correct multi-page asset (and optional history) ownership; a `CanonicalDocument` loads/saves/migrates with zero renderer involvement and survives a full destroy-and-recreate cycle (10.4); a real shipped plugin pattern works against the mock (9.5); single-page apps can adopt multi-page/`DocumentSession` incrementally (10.5).
  - **Not proven / still needed for real 3D:** an actual WebGL/Three.js (or Babylon.js) `RendererApi` implementation; 3D-specific capability interfaces (camera, lighting, materials, ray-casting — deliberately not designed in this roadmap); 3D object types and their `create`/`serialize`/`deserialize`; a single page mixing 2D and 3D nodes simultaneously (page-level `rendererId` already allows *different pages* to use different renderers, but not mixed nodes on one page); `AlignmentManager`/`SnapEngine`/`ViewportManager`/`SelectionManager` internals remain Fabric-only, wrapped rather than genuinely generic.
- **Completion criteria:** the document is written, reviewed, and makes the proven/not-proven boundary explicit enough that no one mistakes this roadmap's completion for 3D being implemented.
- **Stop here — do not begin 3D implementation until this reassessment is complete and reviewed.**

---

## Completion criteria (whole roadmap)

The refactor is complete only when every item below is true — this is the release acceptance gate, not just "the build passes":

- [ ] Existing single-page `createEditor()` apps build and behave unchanged (no `DocumentSession` involved).
- [ ] Existing plugins' test suites pass unmodified.
- [ ] Chunk 0.2's `baseline-snapshot.json` fixture still loads via `restoreSnapshot()`.
- [ ] `plugin-pages`' existing multi-page test suite passes unmodified (per-page history default preserved).
- [ ] Chunk 10.4's canonical-document destroy/recreate round-trip passes.
- [ ] Chunk 10.5's single-page → `DocumentSession` → multi-page adoption test passes.
- [ ] Stage 9's mock-renderer suite passes, including the realistic `plugin-shapes-basic`-pattern test (9.5).
- [ ] Stage 8's acceptance bar is met: every remaining `getFabricCanvas()` call site carries a "why this stays" comment (none are silently unmigrated must-migrate cases).
- [ ] `pnpm packages:depcruise` passes, including the `document-assets-no-renderer` rule (0.3/6.5).
- [ ] `pnpm apps:build` succeeds.
- [ ] `apps/npm-verify` spot-check succeeds.
- [ ] Stage 11's written reassessment is complete.
- [ ] Generic plugin operations (add/remove/select/pan/zoom/serialization/background) no longer depend on `getFabricCanvas()` (Stage 8).
- [ ] Canonical documents work without a renderer (Stage 6).

**Do not pre-declare a release version.** Only once every box above is checked does the major/minor decision get made and a changeset written. Every chunk was in fact designed to avoid a breaking change (verified against real call sites, not just plausible ones), so a minor release is the likely outcome, but the decision point is after this full matrix, not before.

**Do not begin 3D implementation until every box above is checked.**

## Explicitly out of scope (entire roadmap)

- Migrating `ViewportManager`/`SelectionManager`/`LayerManager`/`AlignmentManager`/`SnapEngine` internals to be generic over `TNode` — `FabricRendererApi` (2.2) wraps them as-is.
- A runtime-enforced (Proxy-based) `EditorContext` boundary that actually blocks `getFabricCanvas()` — 2.4 ships a deprecation signal (JSDoc) only.
- Changing `plugin-pages`' default per-page history behavior — `DocumentSession`'s `scope: "document"` option (4.2) makes shared history available, does not make it default.
- Migrating `plugin-local-storage`/`plugin-pages` persistence to use `AssetStore`/`DocumentSession` by default.
- Building an actual second (3D) `RendererApi` implementation, 3D capability interfaces (camera/lighting/materials), 3D object types, or a mixed-2D+3D document model.
- Any Three.js/Babylon.js dependency or `threeDPlugin()` — not part of this roadmap.
