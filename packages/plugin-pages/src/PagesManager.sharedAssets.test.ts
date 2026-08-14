import { describe, expect, it } from "vitest";
import { InMemoryAssetStore } from "@rifrocket/fabricjs-design-tool";
import type { AssetStore } from "@rifrocket/fabricjs-design-tool";
import { PagesManager } from "./PagesManager";
import type { EngineFactory } from "./PagesManager";
import { createFakeEngine, fakeCanvasElementFactory, fakeOffscreenCanvasFactory } from "./testUtils";

// Chunk 10.2 (FUTURE_IMPLEMENTATION.md Stage 10) — the plugin-pages-specific version of Chunk
// 4.4's shared-AssetStore proof. PagesManagerOptions.engineOptions is captured once in the
// constructor and spread into EVERY page's lazily-created engine (PagesManager.ts's
// getOrCreateEngine: `this.engineFactory(canvasEl, { ...this.engineOptions, width, height,
// backgroundColor })`), so a single AssetStore passed via engineOptions.assets is already, with
// zero PagesManager wiring changes, the same instance every page's CanvasEngine receives as its
// own `assets` field (CanvasEngine's constructor: `this.assets = options.assets ?? new
// InMemoryAssetStore()`, Chunk 4.3) — this chunk is a validation-only proof of that, not a new
// feature. createFakeEngine() (testUtils.ts) doesn't otherwise model `assets` at all, so this
// file's engine factory reproduces that one line of real CanvasEngine behavior locally rather
// than editing the shared fixture every other plugin-pages test also uses.
function createAssetsAwareEngineFactory(): EngineFactory {
  return (_canvasEl, options) => {
    const engine = createFakeEngine();
    Object.assign(engine, { assets: options.assets ?? new InMemoryAssetStore() });
    return engine;
  };
}

describe("PagesManager — shared AssetStore across pages (Chunk 10.2)", () => {
  it("resolves an asset registered on page 1 from page 3's engine, created later via lazy engine creation", async () => {
    const sharedAssets: AssetStore = new InMemoryAssetStore();
    const manager = new PagesManager(
      {
        maxPages: 5,
        canvasElementFactory: fakeCanvasElementFactory,
        thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
        engineOptions: { assets: sharedAssets },
      },
      createAssetsAwareEngineFactory(),
    );

    const page1 = manager.addPage();
    const page2 = manager.addPage();
    const page3 = manager.addPage();

    const page1Engine = await manager.setActivePage(page1.id);
    const record = page1Engine.assets.register({ kind: "image", url: "https://example.com/logo.png" });

    // Pages 2/3's engines don't exist yet — lazy creation, same as today's default behavior,
    // unaffected by the shared AssetStore.
    expect(manager.getEngine(page2.id)).toBeUndefined();
    expect(manager.getEngine(page3.id)).toBeUndefined();

    const page3Engine = await manager.setActivePage(page3.id);
    expect(page3Engine.assets).toBe(page1Engine.assets); // the same shared instance, not a copy
    await expect(page3Engine.assets.resolveUrl(record.id)).resolves.toBe("https://example.com/logo.png");
  });

  it("defaults to a fresh, unshared AssetStore per page when engineOptions.assets isn't set — today's behavior is unaffected", async () => {
    const manager = new PagesManager(
      {
        maxPages: 5,
        canvasElementFactory: fakeCanvasElementFactory,
        thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
      },
      createAssetsAwareEngineFactory(),
    );

    const page1 = manager.addPage();
    const page2 = manager.addPage();

    const page1Engine = await manager.setActivePage(page1.id);
    const page2Engine = await manager.setActivePage(page2.id);

    expect(page1Engine.assets).not.toBe(page2Engine.assets);
  });
});
