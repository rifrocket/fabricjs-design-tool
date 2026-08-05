export type EventHandler<T = unknown> = (payload: T) => void;
export type Middleware = (event: string, payload: unknown, next: () => void) => void;

// Generic pub-sub with middleware support, used by CanvasEngine for lifecycle/mutation hooks.
export class EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();
  private readonly middleware: Middleware[] = [];

  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    const set = this.handlers.get(event) ?? new Set<EventHandler>();
    set.add(handler as EventHandler);
    this.handlers.set(event, set);
    return () => this.off(event, handler as EventHandler);
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  use(middleware: Middleware): () => void {
    this.middleware.push(middleware);
    return () => {
      const index = this.middleware.indexOf(middleware);
      if (index !== -1) this.middleware.splice(index, 1);
    };
  }

  emit<T = unknown>(event: string, payload: T): void {
    const dispatch = () => {
      this.handlers.get(event)?.forEach((handler) => handler(payload));
    };
    this.runMiddleware(event, payload, 0, dispatch);
  }

  private runMiddleware(event: string, payload: unknown, index: number, done: () => void): void {
    const current = this.middleware[index];
    if (!current) {
      done();
      return;
    }
    current(event, payload, () => this.runMiddleware(event, payload, index + 1, done));
  }
}
