export interface LifecycleApi {
  setBackgroundColor(color: string): void;
  destroy(): void;
  isDestroyed(): boolean;
}
