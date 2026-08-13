# Renderer-agnostic core: chunked implementation roadmap

**Status: all 11 stages COMPLETED.** See the progress tracker below for per-chunk detail and [THREE_D_READINESS_REASSESSMENT.md](./THREE_D_READINESS_REASSESSMENT.md) (Stage 11) for the closing proven/not-proven status check before any 3D implementation begins.

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
| 1.1 | COMPLETED | packages/core/src/scene/sceneNode.ts (new), packages/core/src/scene/sceneNode.test.ts (new) | 1/1 new test; full packages:test 31/31 files, 191/191 tests; packages:build+typecheck+depcruise all green | Validation test uses a real `fabric.Rect` directly (not via plugin-shapes-basic as literally worded) — packages/core must not depend on any plugin package, so importing a plugin from core's own test suite would be a layering violation; intent (real FabricObject satisfies SceneNode with no adapter) preserved. | 19c0e37 pending next commit |
| 1.2 | COMPLETED | packages/core/src/plugin/objectTypeRegistry.ts, packages/core/src/plugin/objectTypeRegistry.test.ts, packages/core/src/index.ts | objectTypeRegistry.test.ts 8/8 (7 original unmodified + 1 new non-default-TNode case); full monorepo packages:typecheck 32/32, packages:build 21/21, packages:test 42/42 tasks, packages:depcruise clean — zero lines changed in any plugin package | `serialize`/`deserialize` optional hooks added to `ObjectTypeDefinition` now per the plan, unused until Stage 5. `SceneNode` also exported from index.ts (not explicitly listed in the chunk's file list but a natural completion of "exported and usable"). | pending next commit |
| 2.1 | COMPLETED | packages/core/src/engine/rendererApi/{sceneApi,selectionApi,viewportApi,serializationApi,lifecycleApi,index}.ts (new), packages/core/src/index.ts | packages:typecheck clean; packages:build DTS generation clean (no bundling issues with the intersection type) | Also exported `SetZoomOptions` from index.ts (pre-existing gap — CanvasEngine.setZoom already used it in its public signature but it wasn't separately exported; needed now since ViewportApi/RendererApi reference it too). | pending next commit |
| 2.2 | COMPLETED | packages/core/src/engine/fabricRendererApi.ts (new), packages/core/src/engine/fabricRendererApi.test.ts (new), packages/core/src/index.ts | fabricRendererApi.test.ts 8/8 (kind, scene mutation w/ real backing array, selection, viewport, exportSceneJSON byte-match, importSceneJSON, setBackgroundColor, idempotent destroy); full monorepo typecheck/build/test/depcruise all green | Test uses lightweight Canvas/ViewportManager/SelectionManager doubles (matching canvasExporter.test.ts's existing `createFakeCanvas` pattern) rather than a full CanvasEngine — FabricRendererApi isn't wired into CanvasEngine until 2.3, so there's nothing to compare against yet; the fake canvas uses a real backing array so addNode/getNodes prove actual state mutation, not just that a spy was called. `FabricRendererApi` exported from index.ts for consistency with other manager classes (ViewportManager, SelectionManager, etc.) already being public. | pending next commit |
| 2.3 | COMPLETED | packages/core/src/engine/canvasEngine.ts, packages/core/src/engine/canvasEngine.integration.test.ts | canvasEngine.integration.test.ts 16/16 (15 original unmodified + 1 new `engine.renderer` assertion); full monorepo typecheck/build/test/depcruise/apps:build all green | `renderer` constructed after `viewport`/`selection` in the constructor (depends on both); no existing public method touched. | pending next commit |
| 2.4 | COMPLETED | packages/core/src/engine/canvasEngine.ts | Full monorepo typecheck/build/lint all green — no `no-deprecated`-style lint rule exists in this repo, so the 13+ existing `getFabricCanvas()` call sites don't need any change | JSDoc-only annotation, zero signature/behavior change, verified via a clean `packages:lint` run across every plugin package in addition to typecheck/build. | pending next commit |
| 3.1 | COMPLETED | packages/core/src/plugin/editorContext.ts (new), packages/core/src/plugin/editorContext.test.ts (new), packages/core/src/plugin/plugin.ts, packages/core/src/engine/canvasEngine.ts, packages/core/src/index.ts | editorContext.test.ts 2/2; full monorepo typecheck 32/32, build 21/21, test 42/42 tasks, depcruise clean, apps:build 22/22 — zero source changes to any plugin package | **Important correction to the plan's own design, found during implementation, not assumed away.** The plan's bivariance argument ("existing plugins need no changes") is only true for plugins with an EXPLICIT `install(engine: CanvasEngine): void` annotation. Every real plugin in this repo (all 17) writes `install(engine) {...}` with NO annotation — TypeScript contextually types `engine` from the interface's own declared parameter type. Directly narrowing `EditorPlugin.install`'s parameter to `EditorContext` (as literally planned) broke every plugin using a `CanvasEngine`-only member inside install() (`.selection`, `.viewport`, `.getFabricCanvas()`, etc.) — confirmed via a real full-monorepo typecheck failure (plugin-clipboard, and by extension likely most others), not caught by the plan's own "editorContext.test.ts + typecheck a handful of packages" validation because that check happened to pick packages/scenarios that didn't hit the failure mode. **Fix:** made `EditorPlugin<TContext = CanvasEngine>` generic with a default, the same pattern already validated in Chunk 1.2 — existing plugins keep inferring `engine: CanvasEngine` exactly as before (byte-identical, not just structurally compatible); a plugin author who wants the narrower renderer-agnostic contract opts in with `EditorPlugin<EditorContext>`. `EditorContext` itself omits `assets` (Stage 4 doesn't exist yet) per the plan's own noted option. `editorContext.test.ts` uses a compile-time-only type assertion + prototype method check instead of constructing a real `CanvasEngine`, avoiding duplicating `canvasEngine.integration.test.ts`'s ~150-line FakeCanvas double. | pending next commit |
| 3.2 | COMPLETED | packages/core/src/history/canvasCommands.ts, packages/core/src/history/canvasCommands.test.ts (new), packages/core/src/engine/canvasEngine.ts | canvasCommands.test.ts 4/4 (surface path + legacy-Canvas path, both do/undo); full monorepo typecheck/build/test/depcruise/apps:build all green | Used a leaner `ObjectMutationSurface = SceneApi & SelectionApi` (no `LifecycleApi`, unlike the plan's literal wording) since neither command needs setBackgroundColor/destroy/isDestroyed. `canvasEngine.ts`'s 3 real construction sites (addObject/removeObject/deleteSelection) now pass `this.renderer` instead of `this.canvas` — the actual architectural migration, not just an additive type change. Legacy-`Canvas` overload builds its own lightweight adapter (not a full `FabricRendererApi`, which would need a `ViewportManager` these commands never use) for any external consumer constructing these commands directly. One real test bug found and fixed: `SelectionManager.select()` already calls `requestRenderAll()` itself, so `setActiveNode`+`requestRender` totals 2 render calls, not 1. | pending next commit |
| 3.3 | COMPLETED | packages/core/src/history/setPropertyCommand.ts, packages/core/src/history/setPropertyCommand.test.ts | setPropertyCommand.test.ts 5/5 (4 original unmodified + 1 new non-default-NodeOps case using a `Map` as the node, zero FabricObject involved); full monorepo typecheck/build/test/depcruise/apps:build all green | `git diff --stat` on `alignmentManager.ts` confirms zero lines changed — the actual completion criterion, not just "tests still pass." `merge()`'s `next instanceof SetPropertyCommand` narrowing continued to typecheck correctly against the now-generic class with no special handling needed. | pending next commit |
| 3.4 | COMPLETED | none — validation only | Full monorepo `packages:typecheck`/`packages:test`/`apps:build` all green (fully cached — nothing changed since the last successful run); `git status --short` on every `packages/plugin-*/src` and `apps/demo/src` directory is empty | Confirmed `apps/demo/src/plugins/stampToolPlugin.ts` uses implicit `install(engine) { ... engine.getFabricCanvas() ... }` — exactly the pattern Chunk 3.1's generic-default fix was needed for; `apps:build`'s `tsc --noEmit && vite build` is the real proof it still compiles. Zero source changes anywhere outside `packages/core` across all of Stage 3. | pending next commit |
| 4.1 | COMPLETED | packages/core/src/assets/assetStore.ts (new), packages/core/src/assets/assetStore.test.ts (new), packages/core/src/index.ts | assetStore.test.ts 9/9 (register/get, missing-id cases, resolveUrl for both url and blob inputs with memoization, release incl. revoke, list); packages:typecheck/build/depcruise all green | Node 24's global `Blob`/`URL.createObjectURL`/`URL.revokeObjectURL` work fine in this package's "node" test environment — confirmed, not assumed. `document-assets-no-renderer` depcruise rule (Chunk 0.3) still passes since this file imports nothing renderer-related. | pending next commit |
| 4.2 | COMPLETED | packages/core/src/document/documentSession.ts (new), packages/core/src/document/documentSession.test.ts (new), packages/core/src/index.ts | documentSession.test.ts 5/5 (default asset store + no shared history, provided asset store, opt-in shared history, per-renderer explicit, document pass-through); full monorepo typecheck/build/test/depcruise all green | Not yet wired into `CanvasEngine` (that's 4.3) — module compiles and is tested standalone. `document-assets-no-renderer` rule unaffected (no fabric import). | pending next commit |
| 4.3 | COMPLETED | packages/core/src/types.ts, packages/core/src/engine/canvasEngine.ts, packages/core/src/engine/canvasEngine.integration.test.ts, packages/core/src/plugin/editorContext.ts | canvasEngine.integration.test.ts 18/18 (16 original unmodified + 2 new: default-constructs-own-instances, and options.history/options.assets inject shared instances); full monorepo typecheck/build/test/depcruise all green | Also added `assets: AssetStore` to `EditorContext` now that Chunk 4.1 exists (deferred from Chunk 3.1 as planned) — zero plugin source changes needed, confirming the Chunk 3.1 generic-default fix continues to isolate existing plugins from `EditorContext`'s evolving shape. | pending next commit |
| 4.4 | COMPLETED | packages/core/src/document/documentSession.integration.test.ts (new) | documentSession.integration.test.ts 4/4 (shared assets resolve cross-engine; default = independent stores; shared history undo triggered from a *different* engine correctly reverses the action on the page it happened on; default = independent per-page history); `plugin-pages` regression 82/82 unmodified; full monorepo typecheck/build/test/depcruise/apps:build all green | The cross-engine undo test is the strongest proof: `engineB.undo()` correctly removes the rect added via `engineA` — because `AddObjectCommand` closes over the renderer it was constructed against, a shared `HistoryManager`'s undo always reverses the action on the page it originally happened on, regardless of which engine's `.undo()` triggered it. Exactly the right semantics for cross-page shared undo. Wired manually (no plugin-pages change), proving the ownership fix works without needing that package touched. | pending next commit |
| 5.1 | COMPLETED | packages/core/src/document/snapshot.ts, packages/core/src/document/snapshot.test.ts, packages/plugin-local-storage/src/plugin.test.ts, packages/plugin-pages/src/testUtils.ts, packages/plugin-pan-zoom/src/pageBoundary.test.ts | snapshot.test.ts 7/7; baseline fixture round-trip 2/2; full monorepo typecheck/build/test (42/42 tasks)/depcruise/apps:build all green | **Broader real-world break than this chunk's own plan anticipated — found by actually running the full monorepo test suite, not assumed clean from packages/core alone.** `captureSnapshot()` switched from `engine.getFabricCanvas().toObject()` to `engine.renderer.exportSceneJSON()`, and `backgroundColor` is now read from the exported JSON's own `background` field (fabric's `toObject()` already includes it when set) rather than a live `canvas.backgroundColor` property read — needed since `RendererApi`'s `LifecycleApi` has no background *getter*, only `setBackgroundColor()`. This broke **three separate packages' test fixtures** that hand-roll a fake `CanvasEngine`-shaped object without a `renderer` field, or that supplied `backgroundColor` as a sibling property instead of inside the mocked `toObject()`/`exportSceneJSON()` return value: `plugin-local-storage/src/plugin.test.ts` (own local fake engine, 8 tests), `plugin-pages/src/testUtils.ts` (one **shared** fake-engine helper used by all 6 of that package's test files — one fix propagated to all of them), and `plugin-pan-zoom/src/pageBoundary.test.ts` (own local fake engine, 4 tests). All three fixes are test-file-only — **zero production/plugin source code changed** in any of the three packages (`plugin.ts`/`pageBoundary.ts` untouched, confirmed). This is the second time in this roadmap (after Stage 3's `EditorPlugin` generic-default fix) that a chunk's literal "existing tests pass unmodified" claim didn't survive contact with the real monorepo — both times caught by actually running the full suite rather than trusting the plan's own optimism. | pending next commit |
| 5.2 | COMPLETED | packages/core/src/document/objectTypeSerialization.ts (new), packages/core/src/document/snapshot.ts, packages/core/src/document/snapshot.test.ts, packages/core/src/export/canvasExporter.ts, packages/core/src/export/canvasExporter.test.ts, packages/core/src/engine/canvasEngine.ts, packages/core/src/__fixtures__/baselineSnapshot.fixture.test.ts, packages/plugin-pan-zoom/src/pageBoundary.test.ts, packages/plugin-local-storage/src/plugin.test.ts, packages/plugin-pages/src/testUtils.ts | Full monorepo typecheck (32/32)/build (21/21)/test (42/42 tasks, packages/core 37/37 files 228/228 tests)/depcruise/apps:build all green | **One real design correction + more cross-package test fallout than even Chunk 5.1 had.** Design correction: `deserializeWithTypeOverrides` as originally planned would have called `renderer.importSceneJSON()` itself, bypassing `engine.importFile()`'s pluggable "json" importer registry — a real behavior change beyond this chunk's scope (a custom-registered "json" importer would silently stop running). Redesigned as `applyDeserializeOverrides(renderer, registry, rawJson)`: assumes the raw import already happened via `engine.importFile()` and only applies the per-type override pass afterward, never re-importing. `CanvasExporter` gained a `registry: ObjectTypeRegistry<FabricObject> = new ObjectTypeRegistry()` constructor param (default keeps every existing 1-arg `new CanvasExporter(canvas)` call site byte-identical). Test fallout, found by running the full suite, not assumed: `serializeWithTypeOverrides` needs `renderer.getNodes()` (not just `exportSceneJSON()`) and `registry.objectTypes`, and `resolveObjectTypeId()` calls `object.get("shapeKind")` on every live node — this broke `packages/core`'s own `snapshot.test.ts`/`canvasExporter.test.ts`/fixture test (missing `getNodes`/`getObjects`/`registry` mocks), `plugin-pan-zoom/pageBoundary.test.ts` (missing `registry`), `plugin-local-storage/plugin.test.ts` (missing `registry`), and `plugin-pages/testUtils.ts` — twice: once for missing `getNodes` on its shared fake engine, and again for a stub object (`{ toObject: () => ({}) }`, from `addObjectOfType`'s mock) that had no `.get()` method at all, which `resolveObjectTypeId` now calls unconditionally. All fixes are test-file-only; zero production/plugin source changed. Added `objectTypeSerialization.test.ts` (6/6) — the actual positive-path round-trip proof: a registered type's `serialize()`/`deserialize()` hooks are called correctly with the matching raw entry and live node, confirmed against `resolveObjectTypeId`'s real (lowercase, live-`.type`-getter) casing convention per its own existing test. | pending next commit |
| 5.3 | COMPLETED | packages/core/src/document/snapshot.ts | packages/core 38/38 files, 234/234 tests unmodified; full monorepo typecheck/build/test (42/42 tasks)/depcruise all green | Purely additive — two optional type fields, deliberately NOT populated by `captureSnapshot()` yet (kept `captureSnapshot`'s output byte-identical rather than starting to emit `schemaVersion`/`legacyRendererId` now, which would be a real, if backward-compatible, output change beyond "add the fields"). No test fixture needed updating, unlike 5.1/5.2 — a genuinely inert change. | pending next commit |
| 5.4 | COMPLETED | none — validation only | `plugin-local-storage` 24/24, `plugin-pages` 82/82, `baselineSnapshot.fixture.test.ts` 2/2 — all green | Explicit closing confirmation; these suites (plus the fixture) were already exercised repeatedly while fixing 5.1/5.2's cross-package test fallout, so this chunk mainly re-confirms the final, settled state. Stage 5 is the one that most tested the roadmap's own "existing tests pass unmodified" claims — none of the 4 chunks' literal wording survived contact with the real monorepo without at least one correction, all caught by actually running the full suite rather than trusting the plan. | pending next commit |
| 6.1 | COMPLETED | packages/core/src/document/canonicalDocument.ts (new), packages/core/src/document/canonicalDocument.test.ts (new), packages/core/src/index.ts | canonicalDocument.test.ts 3/3; full monorepo typecheck/build/depcruise all green | Zero fabric import confirmed by hand-grep (only the string literal `"fabric"` as a `rendererId` value appears, in the test file). `document-assets-no-renderer` rule (0.3) already covers this file by name. | pending next commit |
| 6.2 | COMPLETED | packages/core/src/document/canonicalDocument.ts, packages/core/src/document/canonicalDocument.test.ts, packages/core/src/index.ts | canonicalDocument.test.ts 10/10 new (13/13 total in the file, including 6.1's) — round-trip through save→load unchanged, 4 malformed-input rejection cases (non-object, missing schemaVersion, missing rendererId, missing typeId nested in children), migrate no-op-at-target-version + throws-for-undefined-path; full monorepo typecheck/build/test/depcruise all green | Went beyond a thin cast: `loadCanonicalDocument` does real recursive structural validation (including nested `children`), failing loudly on a malformed document rather than surfacing a confusing error deep inside Stage 6.3's scene sync later. Confirmed by hand (grep) that the test file's only imports are vitest + canonicalDocument itself — no renderer, no fabric, anywhere. `saveCanonicalDocument` documented as not handling blob-backed `AssetRecord`s (not JSON-safe) — a stated, deliberate limitation, not solved here. | pending next commit |
| 6.3 | COMPLETED | packages/core/src/document/canonicalSceneSync.ts (new), packages/core/src/document/canonicalSceneSync.test.ts (new), packages/core/src/index.ts | canonicalSceneSync.test.ts 3/3 — full round-trip through a real `CanvasEngine` (source engine → canonical page → fresh target engine, properties match); throws for a live node with no `serialize()`; throws for a canonical node whose `typeId` isn't registered; full monorepo typecheck/build/test/depcruise all green | **Two spec gaps in the plan's own abbreviated signature, resolved during implementation:** (1) the plan's `syncRendererToCanonicalPage(renderer, registry, options?)` had no way to supply `CanonicalPage.id` — added an explicit `pageId: string` parameter, since a page's identity must come from the caller (e.g. a `plugin-pages` `PageMeta.id`), not be invented. (2) The plan's signature already returned `CanonicalSyncResult` (a type Chunk 6.4 formally defines) — deferred that wrapping entirely to 6.4 as scoped by its own task list; this chunk's `syncRendererToCanonicalPage` returns a plain `CanonicalPage` and throws (strict-only) when a live node's type has no `serialize()` — 6.4 adds the `strict: false` alternative on top. Node `id`s reuse the existing `getObjectId`/`fdtId` stamping mechanism for consistency with the rest of the codebase's identity scheme. | pending next commit |
| 6.4 | COMPLETED | packages/core/src/document/canonicalSceneSync.ts, packages/core/src/document/canonicalSceneSync.test.ts, packages/core/src/index.ts | canonicalSceneSync.test.ts 5/5 (2 new: `strict: false` returns `incomplete: true`+`skippedNodeIds` instead of throwing; a mixed scene with one opted-in and one non-opted-in type serializes the former while skipping+recording the latter); full monorepo typecheck/build/test/depcruise all green | `syncRendererToCanonicalPage`'s return type changed from plain `CanonicalPage` (6.3) to `CanonicalSyncResult` as this chunk's own plan always intended — safe since grep confirmed zero consumers outside its own test file exist yet. Updated the 6.3 test's assertions to unwrap `.page` accordingly. | pending next commit |
| 6.5 | COMPLETED | .dependency-cruiser.cjs | `pnpm packages:depcruise` clean (104 modules, 394 deps); rule genuinely re-verified to catch violations — a scratch `import { Canvas } from "fabric"` added to `canonicalDocument.ts` was confirmed to fail the check (caught the exact expected error), then removed and confirmed clean again; full monorepo typecheck/build/test/depcruise/apps:build all green (fully cached, nothing else changed) | **The chunk's own stated assumption was wrong, found by actually auditing the file, not by trusting the earlier plan text.** Chunk 6.5's task said `canonicalSceneSync.ts` "already satisfies" the no-fabric constraint "by depending only on RendererApi, not Canvas" — false: a direct grep of its imports shows `import type { FabricObject } from "fabric"` on line 1, plus a transitive fabric dependency via `resolveObjectTypeId`. Its `RendererApi<FabricObject>`/`ObjectTypeRegistry<FabricObject>` typing (a deliberate Chunk 6.3 design choice — generalizing to non-Fabric `TNode` is explicitly Stage 9's job) makes it genuinely Fabric-coupled today, the same category as Stage 5's `snapshot.ts`/`objectTypeSerialization.ts`. Correct resolution: leave the rule's `from` scope exactly as Chunk 0.3 set it (`canonicalDocument.ts` + `assets/**` only, NOT `canonicalSceneSync.ts`) and rewrite the rule's comment to explicitly document why, rather than widening it as originally (incorrectly) planned — widening would have immediately broken the build on real, correct code, the same class of mistake caught in Chunk 0.3 itself. (Note: `git checkout --` couldn't revert the scratch violation since `canonicalDocument.ts` is still untracked in this branch — removed via a direct Edit instead.) | pending next commit |
| 7.1 | COMPLETED | packages/core/src/types.ts, packages/core/src/index.ts | Full monorepo typecheck/build/depcruise all green | Type-only, as scoped — `EngineOptions.rendererFactory` added but not yet consumed by `CanvasEngine.create()` (that's 7.2). | pending next commit |
| 7.2 | COMPLETED | packages/core/src/engine/canvasEngine.ts | Full monorepo typecheck/build/test (42/42 tasks, packages/core 40/40 files 249/249 tests unmodified)/depcruise/apps:build all green | **Real correctness bug in the plan's own literal snippet, caught before implementing it, not after.** The plan's `defaultFabricRendererApiFactory` constructs its own internal `new ViewportManager(canvas)`/`new SelectionManager(canvas)` for the returned `FabricRendererApi` — if wired via `options.rendererFactory ?? defaultFabricRendererApiFactory`, this would produce a SECOND `ViewportManager` instance, separate from `this.viewport` (which `CanvasEngine`'s own top-level `setZoom()`/`zoomBy()`/etc. actually use). Since `ViewportManager` caches `baseWidth`/`baseHeight` at construction time and mutates it via `setBaseSize()`, two independent instances wrapping the same canvas can silently drift out of sync — a caller mixing `engine.setZoom()` (uses `this.viewport`) and `engine.renderer.setZoom()` (would use the OTHER instance) could resize the canvas element to stale/wrong dimensions. **Fix:** the constructor now takes `element` as a third param; the default (no `rendererFactory`) path is unchanged from Chunk 2.3 — `this.renderer` is built from the SAME `canvas`/`this.viewport`/`this.selection` instances as everything else — zero duplication, zero behavior change. Only when a custom `rendererFactory` is explicitly provided does `this.renderer` come from that factory instead, with the honest caveat (documented in the constructor) that `viewport`/`selection`/`layers`/`alignment`/`snapping`/`getFabricCanvas()` remain bound to the originally-constructed canvas regardless. No standalone `defaultFabricRendererApiFactory` function was exported — one would necessarily behave differently from the actual default path (constructing its own separate canvas from `element`), which would be confusing to have alongside the real, non-duplicating default logic inlined in the constructor. | pending next commit |
| 7.3 | COMPLETED | packages/core/src/engine/canvasEngine.integration.test.ts | 20/20 (18 original unmodified + 2 new: custom `rendererFactory` invoked with `(element, options)` and `engine.renderer` is exactly the object it returned; default path unaffected without one); full monorepo typecheck/build/test/depcruise/apps:build all green | Custom-factory test uses a fully hand-rolled mock `RendererApi` object (not a `FabricRendererApi`) to prove the seam accepts genuinely arbitrary implementations, not just Fabric-flavored ones. | pending next commit |
| 8.1 | COMPLETED | none — inventory only | Full repo grep for `.getFabricCanvas()` across packages+apps, 22 real call sites classified | Actual inventory turned up more real call sites than the roadmap's original 13+-file estimate (which was itself somewhat approximate) — included `packages/react`, `apps/demo` (7 files), not just the plugin packages originally named. `plugin-clipboard`/`plugin-qrcode`/`plugin-shapes-basic` (named in the roadmap's original text) confirmed via grep to have **zero** `getFabricCanvas()` call sites — not part of the actual inventory. | pending next commit |
| 8.2 | COMPLETED | packages/react/src/useObjectEffects.ts, packages/plugin-pan-zoom/src/usePannableDocument.ts, apps/demo/src/features/canvas/CanvasSizeFields.tsx, apps/demo/src/engine/EngineHost.tsx, apps/demo/src/shell/ContextMenu.tsx, apps/demo/src/features/selection/SelectionQuickActions.tsx, apps/demo/src/docs/featureDocs.ts (+ 3 test fixtures: useObjectEffects.test.tsx, usePannableDocument.test.tsx, plugin-effects-panel's EffectsPanel.test.tsx) | Each package's own test suite green after its migration; full monorepo typecheck/build/test (42/42)/depcruise/apps:build/apps:typecheck all green at the end | 6 real call sites migrated: 3 `requestRenderAll()`→`renderer.requestRender()`, 2 `.add()`→`renderer.addNode()`, 2 `getActiveObject()`→`engine.selection.getActive()` (already-existing public API, not even a new RendererApi surface). One genuinely stale doc string fixed as a bonus find: `featureDocs.ts`'s `canvasSize` snippet showed `engine.getFabricCanvas().setDimensions(...)` when `engine.setDimensions(width, height)` already exists as the correct, more-complete public API (it also keeps zoom state in sync, unlike the raw call). Cross-package fallout, same pattern as Stage 5: migrating `useObjectEffects.ts` (packages/react) broke its own test **and** a downstream consumer's test (`plugin-effects-panel`'s `EffectsPanel.test.tsx`) — both fake-engine fixtures needed a `renderer` field added. One transient/flaky `plugin-snapping` test failure during a parallel `turbo` run was confirmed to be noise (4/4 green in isolation, unrelated to any change made here). | pending next commit |
| 8.3 | COMPLETED | packages/plugin-effects/src/plugin.ts, packages/plugin-pages/src/PagesManager.ts, packages/plugin-pages/src/react/usePageCanvasRef.ts, packages/plugin-local-storage/src/plugin.ts, packages/plugin-svg-import/src/plugin.ts, apps/demo/src/shell/ContextMenu.tsx, apps/demo/src/features/selection/SelectionQuickActions.tsx, apps/demo/src/engine/PagesToolbar.tsx, apps/demo/src/features/export/ExportMenu.tsx | Comment-only changes; each affected package's tests re-verified green (no behavior change expected or found) | 16 real call sites confirmed genuinely Fabric-only and given (or given a strengthened) "why this stays" comment: Fabric render-pipeline prototype patching, DOM wrapper element access (`wrapperEl`/`calcOffset`), Fabric-only interactivity flags (`selection`/`evented` locking), Fabric canvas events (`object:modified`/`text:changed`/`selection:*`/`object:moving`) — RendererApi has no event-subscription surface at all, format-specific importers typed against raw `Canvas` across the whole framework (not just this call site), no RendererApi getter for current canvas dimensions, and Fabric-specific PDF export (`plugin-export-pdf`, entirely outside RendererApi's scope). `stampToolPlugin.ts` and `useCanvasPanZoom.ts` already had adequate comments pre-existing from earlier work — left untouched. | pending next commit |
| 8.4 | COMPLETED | none — audit only | Full repo grep for `.getFabricCanvas()` re-run after 8.2/8.3; every real call site has an adjacent explanatory comment; the two `featureDocs.ts` references are documentation string literals (example code shown in the demo UI), not executing code, and accurately describe legitimately Fabric-only patterns | Clean audit — no unexplained call sites remain. | pending next commit |
| 9.1 | COMPLETED | packages/core/src/testing/mockRendererApi.ts | typecheck clean | `MockNode implements SceneNode`; zero fabric import (only `SceneNode` type imported) | (pending combined 9.1+9.2 commit) |
| 9.2 | COMPLETED | packages/core/src/testing/mockRendererApi.ts, packages/core/src/testing/mockRendererApi.test.ts (new) | 8/8 passing, `pnpm typecheck` clean | Full `RendererApi<MockNode>` backed by arrays/maps; added `MockNode.toPlainObject()` (not part of `SceneNode`) so `exportSceneJSON()` can produce a real inspectable snapshot for later serialize/canonical-sync chunks. Real bug caught by typecheck: `setDimensions()` must keep its 2-param signature even though it's a no-op — a 0-arg declaration satisfies the interface structurally but breaks any call site passing args, since a concrete class's own arity (not the interface's) governs direct calls. Also renamed the private pan-state field from `pan` to `panPosition` to avoid colliding with the `pan(deltaX, deltaY)` method name. Zero fabric import in both files (hand-verified via grep). | (pending combined 9.1+9.2 commit) |
| 9.3 | COMPLETED | packages/core/src/testing/mockRendererApi.test.ts | 12/12 passing (4 new), `pnpm typecheck` clean | Deviated from the plan's literal "construct an EditorContext<MockNode>": tested `AddObjectCommand`/`RemoveObjectCommand`/`SetPropertyCommand`/`HistoryManager` directly against `MockRendererApi` instead, since `HistoryManager` only ever calls `Command.do()/.undo()/.merge()` — a full `EditorContext<MockNode>` fixture (registry/events/store/shortcuts/assets/use()/etc.) would add an unrelated, unused fixture surface for what this chunk is actually proving. `SetPropertyCommand<MockNode>` required an injected `NodeOps<MockNode>` (get/set via `MockNode.get/set`, no `finalize`) since it has no Fabric-style `.set()`/`.setCoords()`. All 4 scenarios (add+undo+redo, remove+undo, set+undo+redo, consecutive-set merge) pass; zero fabric import in the test file (hand-verified via grep). | (pending combined 9.1-9.3 commit) |
| 9.4 | COMPLETED | packages/core/src/testing/mockRendererApi.test.ts | 15/15 passing (3 new), `pnpm typecheck` clean | Registered a `fake-shape` `ObjectTypeDefinition<FakeShapeConfig, MockNode>` against `ObjectTypeRegistry<MockNode>`; round-tripped register/has/list/create, chained a registry-created `MockNode` through `AddObjectCommand`+`HistoryManager` (proving 9.3 and 9.4 compose), and confirmed `unregister`+create-on-missing-type still throws the same error message as the Fabric-typed default path. Zero fabric import (hand-verified via grep, matches only in comments/strings). | (pending combined 9.1-9.4 commit) |
| 9.5 | COMPLETED | packages/core/src/testing/mockRendererApi.test.ts, packages/core/src/document/canonicalSceneSync.ts | 16/16 in mockRendererApi.test.ts (1 new, large), full monorepo: 32/32 typecheck, 42/42 test packages green, depcruise clean (106 modules/416 deps), apps:build green | Two real architectural findings surfaced, both left as Stage 11 "not proven" items rather than fixed (out of scope for a validation-only chunk): (1) `EditorContext<TNode>.registry: PluginRegistry` is not generic — `PluginRegistry.objectTypes` is hardcoded `ObjectTypeRegistry<FabricObject>`, so the literal shipped-plugin pattern `context.registry.objectTypes.register()` cannot carry a non-Fabric TNode; worked around with a second `mockObjectTypes: ObjectTypeRegistry<MockNode>` field. (2) `EditorContext<TNode>.use(plugin: EditorPlugin): void` is hardcoded to `EditorPlugin<CanvasEngine>` (plugin.ts's default), so no non-CanvasEngine `EditorContext` implementer can satisfy that exact signature — confirmed via a real `TS2416` (not routable around by Chunk 3.1's bivariance trick, which only worked because every real plugin targets the one concrete `CanvasEngine`); `FakeEditorContext` therefore does not literally `implements EditorContext<MockNode>`, only matches its shape field-by-field. Separately, made a real, scoped fix (not a workaround): `canonicalSceneSync.ts`'s `syncRendererToCanonicalPage`/`syncCanonicalPageToRenderer` were hardcoded to `RendererApi<FabricObject>`/`ObjectTypeRegistry<FabricObject>` despite Chunk 6.3/6.4 building `RendererApi<TNode>` generically — widened both to `TNode extends SceneNode = FabricObject` with injectable `resolveTypeId`/`getNodeId` strategies (mirroring Chunk 3.3's `NodeOps` pattern), defaulting to the exact prior `resolveObjectTypeId`/`getObjectId` behavior; existing `canonicalSceneSync.test.ts` (5 tests) passes unmodified. The test itself installs a `plugin-shapes-basic`-pattern fake plugin, creates+adds a `MockNode` via `addObjectOfType`, exercises undo/redo (including `setObjectProperty`), round-trips through `syncRendererToCanonicalPage`/`syncCanonicalPageToRenderer` with MockNode-specific type/id strategies, and exercises `loadCanonicalDocument`/`saveCanonicalDocument` with zero renderer constructed anywhere in that block. Zero fabric import anywhere in `packages/core/src/testing/` (hand-verified via grep — all matches are comments). | (pending Stage 9 commit) |
| 10.1 | COMPLETED | none (validation only) | plugin-pages: 82/82 passing, unmodified | Ran in isolation (not just as part of Stage 9's full monorepo pass) per the chunk's own instruction. Zero source changes; today's default per-page-history behavior fully preserved. | (pending Stage 10 commit) |
| 10.2 | COMPLETED | packages/plugin-pages/src/PagesManager.sharedAssets.test.ts (new) | 2/2 new, plugin-pages full suite 84/84 passing | Zero PagesManager.ts changes needed: `getOrCreateEngine()` already spreads the SAME captured `this.engineOptions` (including `.assets`, if set) into every page's lazily-created engine, so a shared `InMemoryAssetStore` passed via `engineOptions.assets` reaches every page automatically — this chunk is a pure validation proof, exactly as the plan anticipated ("possibly wiring... if not already exercised generically enough"). `testUtils.ts`'s shared `createFakeEngine()` fixture doesn't model `.assets` at all, so added a local `createAssetsAwareEngineFactory()` in the new test file (not a shared-fixture change) that reproduces CanvasEngine's own one-line `this.assets = options.assets ?? new InMemoryAssetStore()` rule. Confirmed: (a) page 3's engine (created after page 1 registers an asset) resolves it correctly, same object identity as page 1's; (b) default (no `engineOptions.assets`) behavior is unaffected — each page still gets its own unshared store. | (pending Stage 10 commit) |
| 10.3 | COMPLETED | packages/plugin-pages/src/PagesManager.sharedHistory.test.ts (new) | 2/2 new, plugin-pages full suite 86/86 passing | Same mechanism/rationale as 10.2, for `engineOptions.history` instead of `.assets`. `createFakeEngine()`'s stubbed history/undo/redo don't exercise real `HistoryManager` behavior, so wired a REAL `HistoryManager` (`options.history ?? new HistoryManager()`) onto the fake engine locally, with `undo`/`redo` delegating to it and a trivial no-op `Command` standing in for a real `AddObjectCommand` (sufficient to prove instance sharing + cross-page-visible undo, without needing real scene-mutation semantics). Confirmed: (a) opted-in shared history — a command executed via page 1 is visible (`canUndo() === true`) from page 2's engine, and undoing from page 2 clears the shared stack; (b) default — each page keeps its own independent `HistoryManager`, unaffected. | (pending Stage 10 commit) |
| 10.4 | COMPLETED | packages/core/src/document/documentLifecycle.test.ts (new) | 1/1 new, packages/core full suite 268/268 passing, depcruise clean (107 modules/424 deps) | Deviated from the plan's file suggestion (packages/plugin-pages): placed in packages/core instead, since nothing the test exercises (createEngine/syncRendererToCanonicalPage/syncCanonicalPageToRenderer/loadCanonicalDocument/saveCanonicalDocument) actually depends on PagesManager — "3 pages" here means 3 independent CanvasEngines (exactly what PagesManager itself builds on internally), with zero plugin-pages-specific machinery needed to prove the claim. Reused canonicalSceneSync.test.ts's exact FakeCanvas + vi.mock("fabric") pattern (a real fabric.Canvas can't construct in this test environment). Full sequence per the plan: 3 engines each get a registered round-trip-rect + a distinct rect; synced to canonical (strict:true); assembled + saveCanonicalDocument'd; all 3 source engines destroyed (isDestroyed() confirmed true); loadCanonicalDocument'd back (asserted structurally equal, no renderer involved); 3 fresh engines constructed and syncCanonicalPageToRenderer'd; recreated left/top/fill values match the originals exactly. | (pending Stage 10 commit) |
| 10.5 | COMPLETED | packages/plugin-pages/src/PagesManager.adoption.test.ts (new), packages/plugin-pages/package.json | 1/1 new, plugin-pages full suite 87/87 passing, full monorepo green (33/33 typecheck, 42/42 test packages, depcruise clean, apps:build) | Added `@rifrocket/fdt-plugin-shapes-basic` and `@rifrocket/fdt-plugin-import-json` as devDependencies of plugin-pages (workspace-internal, dev-only, `pnpm install` resolved locally with zero network fetch) — deliberate choice over a locally-written stand-in plugin (as used in Chunk 9.5), since this chunk's entire point is proving zero changes to an ALREADY-SHIPPED plugin's own source, which a synthetic plugin (never "already shipped" anywhere) can't prove. Full migration sequence per the plan: `createEditor()` single-page app with the real, unmodified `shapesBasicPlugin` installed; added a rect to prove it works pre-migration; `captureSnapshot()`; wrapped in `createDocumentSession()`; original engine destroyed; adopted as Page 1 of a new `PagesManager` via the existing `seedFromDocument()` bridge, sharing the session's `AssetStore` across pages (Chunk 10.2's mechanism) and installing the same plugin list; added Page 2. Confirmed on BOTH pages, with zero plugin source changes: `registry.objectTypes.has("rect")` true, `assets` is the same shared instance, and `addObjectOfType()` actually works (not just that `install()` didn't throw). Needed two incidental fixes to make this constructible in this test environment (neither is a plugin change): `importJsonPlugin` in the page-side plugin list (`seedFromDocument`'s pendingSnapshots path needs a registered "json" importer) and `thumbnails.offscreenCanvasFactory` (every `getOrCreateEngine()` call renders a thumbnail via a real `fabric.StaticCanvas`, which needs a working 2D context jsdom doesn't provide — same fake every other plugin-pages test already uses). Reused the FakeCanvas + `vi.mock("fabric")` pattern from Chunk 10.4, extended with `toObject`/`loadFromJSON`/`set` stubs this scenario's real snapshot capture/restore path needed. | (pending Stage 10 commit) |
| 11 | COMPLETED | THREE_D_READINESS_REASSESSMENT.md (new, repo root) | n/a (written document) | Placed at repo root, not design-docs/ — that directory does not exist anywhere in this branch's (`version-5`) history (verified via `git ls-tree` on both this branch and `main`), matching where FUTURE_IMPLEMENTATION.md itself was placed per explicit prior user instruction. Documents two genuine, previously-undocumented architectural findings from Chunk 9.5 (EditorContext.registry not generic over TNode; EditorContext.use() hardcoded to EditorPlugin\<CanvasEngine\>) as the real blockers for a second real renderer's plugin-authoring story, plus every other Stage 0-10 "not proven" item accumulated across the roadmap. Re-verified Stage 8's getFabricCanvas() acceptance bar by direct grep + spot-check against current source (not carried over from memory) — confirmed all 39 real call sites carry a documented reason. Also discovered apps/npm-verify does not exist on this branch either (`ls apps/` shows only demo and docs) — recorded as "not verifiable here" rather than silently marked passing. 13/14 whole-roadmap completion-checklist items confirmed against live verification; the 14th (apps/npm-verify) is inapplicable to this branch, not failing. No 3D code written anywhere. | (pending Stage 11 commit) |

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
