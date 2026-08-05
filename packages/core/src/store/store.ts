export type StoreListener<T> = (state: T) => void;
export type StatePatch<T> = Partial<T> | ((state: T) => Partial<T>);

// Generic observable state container, framework-agnostic.
export class Store<T extends object> {
  private state: T;
  private readonly listeners = new Set<StoreListener<T>>();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(patch: StatePatch<T>): void {
    const partial = typeof patch === "function" ? patch(this.state) : patch;
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: StoreListener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
