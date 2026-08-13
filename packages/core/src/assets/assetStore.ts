// Minimal asset abstraction (FUTURE_IMPLEMENTATION.md Chunk 4.1) — nothing exists today to
// migrate, so this is purely additive. Deliberately small: register/get/resolveUrl/release/list
// only, no dedup, no quotas, no eviction, no persistence integration, no remote asset
// management. Kept renderer-free (see the document-assets-no-renderer dependency-cruiser rule)
// so a document referencing assets stays loadable/processable without any renderer present.
export interface AssetRecord {
  id: string;
  kind: string;
  mimeType?: string;
  url?: string;
  blob?: Blob;
}

export interface AssetStore {
  register(input: { kind: string; url?: string; blob?: Blob; mimeType?: string }): AssetRecord;
  get(id: string): AssetRecord | undefined;
  // `url` as-is, or a memoized `URL.createObjectURL(blob)` for a blob-backed record.
  resolveUrl(id: string): Promise<string>;
  release(id: string): void;
  list(): AssetRecord[];
}

let idCounter = 0;

export class InMemoryAssetStore implements AssetStore {
  private readonly records = new Map<string, AssetRecord>();
  private readonly objectUrls = new Map<string, string>();

  register(input: { kind: string; url?: string; blob?: Blob; mimeType?: string }): AssetRecord {
    idCounter += 1;
    const record: AssetRecord = {
      id: `asset_${idCounter}`,
      kind: input.kind,
      mimeType: input.mimeType,
      url: input.url,
      blob: input.blob,
    };
    this.records.set(record.id, record);
    return record;
  }

  get(id: string): AssetRecord | undefined {
    return this.records.get(id);
  }

  async resolveUrl(id: string): Promise<string> {
    const record = this.records.get(id);
    if (!record) {
      throw new Error(`No asset registered for "${id}"`);
    }
    if (record.url) return record.url;
    if (record.blob) {
      const existing = this.objectUrls.get(id);
      if (existing) return existing;
      const objectUrl = URL.createObjectURL(record.blob);
      this.objectUrls.set(id, objectUrl);
      return objectUrl;
    }
    throw new Error(`Asset "${id}" has neither a url nor a blob to resolve`);
  }

  release(id: string): void {
    const objectUrl = this.objectUrls.get(id);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      this.objectUrls.delete(id);
    }
    this.records.delete(id);
  }

  list(): AssetRecord[] {
    return Array.from(this.records.values());
  }
}
