// Generic keyed registry used for anything with one entry per id (tools, exporters, importers).
export class Registry<T> {
  private readonly entries = new Map<string, T>();

  register(id: string, entry: T): void {
    if (this.entries.has(id)) {
      throw new Error(`"${id}" is already registered`);
    }
    this.entries.set(id, entry);
  }

  unregister(id: string): void {
    this.entries.delete(id);
  }

  // Atomic unregister+register, for callers that want "install or overwrite" without a
  // duplicate-id throw (e.g. a plugin whose install() runs more than once) or a separate
  // unregister() call first.
  replace(id: string, entry: T): void {
    this.entries.set(id, entry);
  }

  get(id: string): T | undefined {
    return this.entries.get(id);
  }

  has(id: string): boolean {
    return this.entries.has(id);
  }

  list(): string[] {
    return Array.from(this.entries.keys());
  }
}
