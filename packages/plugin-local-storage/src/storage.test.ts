import { describe, expect, it, vi } from "vitest";
import type { DocumentSnapshotData } from "@rifrocket/fabricjs-design-tool";
import { DEFAULT_STORAGE_KEY, clearSavedDesign, loadDesignFromStorage, saveDesignToStorage } from "./storage";
import type { StorageLike, StoredDesign } from "./storage";

function createFakeStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => map.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      map.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      map.delete(key);
    }),
  };
}

const snapshot: DocumentSnapshotData = { json: { objects: [] }, backgroundColor: "#fff" };

interface PageMeta {
  width: number;
  height: number;
}

describe("saveDesignToStorage / loadDesignFromStorage", () => {
  it("round-trips a design (snapshot + meta) through the injected storage under the default key", () => {
    const storage = createFakeStorage();
    const design: StoredDesign<PageMeta> = { snapshot, meta: { width: 800, height: 600 } };

    saveDesignToStorage(design, DEFAULT_STORAGE_KEY, storage);

    expect(storage.setItem).toHaveBeenCalledWith(DEFAULT_STORAGE_KEY, JSON.stringify(design));
    expect(loadDesignFromStorage<PageMeta>(DEFAULT_STORAGE_KEY, storage)).toEqual(design);
  });

  it("round-trips a design with no meta as meta: null", () => {
    const storage = createFakeStorage();

    saveDesignToStorage({ snapshot, meta: null }, DEFAULT_STORAGE_KEY, storage);

    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toEqual({ snapshot, meta: null });
  });

  it("uses a caller-supplied key instead of the default", () => {
    const storage = createFakeStorage();
    const design: StoredDesign = { snapshot, meta: null };

    saveDesignToStorage(design, "custom-key", storage);

    expect(loadDesignFromStorage("custom-key", storage)).toEqual(design);
    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toBeNull();
  });

  it("returns null when nothing has been saved", () => {
    const storage = createFakeStorage();

    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toBeNull();
  });

  it("returns null instead of throwing when the stored value isn't valid JSON", () => {
    const storage = createFakeStorage();
    storage.setItem(DEFAULT_STORAGE_KEY, "not json");

    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toBeNull();
  });

  it("returns null for valid JSON that isn't a { snapshot, ... } object", () => {
    const storage = createFakeStorage();
    storage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify({ objects: [] }));

    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toBeNull();
  });

  it("swallows a setItem failure (e.g. quota exceeded) instead of throwing", () => {
    const storage = createFakeStorage();
    vi.mocked(storage.setItem).mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => saveDesignToStorage({ snapshot, meta: null }, DEFAULT_STORAGE_KEY, storage)).not.toThrow();
  });

  it("is a no-op when no storage is available (e.g. SSR)", () => {
    expect(() => saveDesignToStorage({ snapshot, meta: null }, DEFAULT_STORAGE_KEY, null)).not.toThrow();
    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, null)).toBeNull();
  });
});

describe("clearSavedDesign", () => {
  it("removes the saved design under the default key", () => {
    const storage = createFakeStorage();
    saveDesignToStorage({ snapshot, meta: null }, DEFAULT_STORAGE_KEY, storage);

    clearSavedDesign(DEFAULT_STORAGE_KEY, storage);

    expect(storage.removeItem).toHaveBeenCalledWith(DEFAULT_STORAGE_KEY);
    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toBeNull();
  });

  it("removes only the caller-supplied key, leaving others untouched", () => {
    const storage = createFakeStorage();
    saveDesignToStorage({ snapshot, meta: null }, "keep-me", storage);
    saveDesignToStorage({ snapshot, meta: null }, "clear-me", storage);

    clearSavedDesign("clear-me", storage);

    expect(loadDesignFromStorage("clear-me", storage)).toBeNull();
    expect(loadDesignFromStorage("keep-me", storage)).toEqual({ snapshot, meta: null });
  });

  it("is a no-op when no storage is available", () => {
    expect(() => clearSavedDesign(DEFAULT_STORAGE_KEY, null)).not.toThrow();
  });
});
