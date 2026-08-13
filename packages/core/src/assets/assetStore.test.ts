import { describe, expect, it } from "vitest";
import { InMemoryAssetStore } from "./assetStore";

describe("InMemoryAssetStore", () => {
  it("register()/get() round-trip a url-backed asset", () => {
    const store = new InMemoryAssetStore();
    const record = store.register({ kind: "image", url: "https://example.com/a.png", mimeType: "image/png" });

    expect(record.id).toMatch(/^asset_/);
    expect(store.get(record.id)).toEqual(record);
  });

  it("get() returns undefined for an unregistered id", () => {
    const store = new InMemoryAssetStore();
    expect(store.get("missing")).toBeUndefined();
  });

  it("resolveUrl() returns the url as-is for a url-backed asset", async () => {
    const store = new InMemoryAssetStore();
    const record = store.register({ kind: "image", url: "https://example.com/a.png" });

    await expect(store.resolveUrl(record.id)).resolves.toBe("https://example.com/a.png");
  });

  it("resolveUrl() memoizes URL.createObjectURL() for a blob-backed asset", async () => {
    const store = new InMemoryAssetStore();
    const blob = new Blob(["hello"], { type: "text/plain" });
    const record = store.register({ kind: "text", blob });

    const first = await store.resolveUrl(record.id);
    const second = await store.resolveUrl(record.id);

    expect(first).toMatch(/^blob:/);
    expect(second).toBe(first);
  });

  it("resolveUrl() throws for an unregistered id", async () => {
    const store = new InMemoryAssetStore();
    await expect(store.resolveUrl("missing")).rejects.toThrow('No asset registered for "missing"');
  });

  it("resolveUrl() throws for an asset with neither url nor blob", async () => {
    const store = new InMemoryAssetStore();
    const record = store.register({ kind: "empty" });
    await expect(store.resolveUrl(record.id)).rejects.toThrow('Asset "' + record.id + '" has neither a url nor a blob to resolve');
  });

  it("release() removes the record and revokes any object URL it created", async () => {
    const store = new InMemoryAssetStore();
    const blob = new Blob(["hello"]);
    const record = store.register({ kind: "text", blob });
    await store.resolveUrl(record.id);

    store.release(record.id);

    expect(store.get(record.id)).toBeUndefined();
  });

  it("release() is a safe no-op for an unregistered id", () => {
    const store = new InMemoryAssetStore();
    expect(() => store.release("missing")).not.toThrow();
  });

  it("list() returns every registered record", () => {
    const store = new InMemoryAssetStore();
    const a = store.register({ kind: "image", url: "a" });
    const b = store.register({ kind: "image", url: "b" });

    expect(store.list()).toEqual([a, b]);
  });
});
