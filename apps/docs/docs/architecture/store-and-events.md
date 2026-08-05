---
sidebar_position: 3
title: Store & Events
---

# Store & Events

`CanvasEngine` exposes two separate reactivity mechanisms, and it's worth knowing why there are two rather than one.

## `Store<T>` — observable state

```ts
export class Store<T extends object> {
  getState(): T;
  setState(patch: Partial<T> | ((state: T) => Partial<T>)): void;
  subscribe(listener: (state: T) => void): () => void;
}
```

`engine.store` holds `EngineState` — zoom, pan, the current object/selection id lists, undo/redo availability, and a `propertyVersion` counter. It's a plain, framework-agnostic class: `getState()` for a synchronous read, `setState()` for a shallow-merge update, `subscribe()` for change notifications. `@rifrocket/fdt-react` binds to it with `useSyncExternalStore` via `useEditorState(selector)`, so a component that only reads `state.zoom` doesn't re-render when `state.selectedObjectIds` changes.

### Why `propertyVersion`?

Editing an object's property (`engine.setObjectProperty(obj, "fill", "#f00")`) changes the object itself, but not `objectIds`/`selectedObjectIds` — nothing else in `EngineState` reflects it. Without a signal, a `PropertiesPanel` subscribed only to selection would never re-render after a property edit. `propertyVersion` is a counter that bumps on every property mutation (including undo/redo, since those also change property values) purely so property-driven UI has something to subscribe to.

```ts
engine.store.subscribe((state) => {
  console.log("zoom is now", state.zoom, "propertyVersion", state.propertyVersion);
});
```

## `EventBus` — pub-sub with middleware

```ts
export class EventBus {
  on<T>(event: string, handler: (payload: T) => void): () => void;
  off(event: string, handler: EventHandler): void;
  use(middleware: (event: string, payload: unknown, next: () => void) => void): () => void;
  emit<T>(event: string, payload: T): void;
}
```

`engine.events` is a generic string-keyed pub-sub. `CanvasEngine` emits two events internally today: `"objects:changed"` (payload: the new object id list) and `"selection:changed"` (payload: the new selected id list) — both fire whenever the underlying Fabric canvas' own `object:added`/`object:removed`/`selection:*` events fire.

```ts
const unsubscribe = engine.events.on("objects:changed", (objectIds) => {
  console.log("canvas now has", objectIds.length, "objects");
});
```

### Middleware

`engine.events.use(middleware)` registers a function that runs before every `emit()`, in registration order, and must call `next()` to let the event continue to its handlers (or not call it, to short-circuit):

```ts
engine.events.use((event, payload, next) => {
  console.log(`[event] ${event}`, payload);
  next();
});
```

This is the seam for cross-cutting concerns — logging, analytics, validation — without every plugin that cares having to instrument the same call sites individually.

## Store vs. events: which one do I want?

- **Reach for `store`** when you need to *read current state* or *re-render UI when specific fields change* — zoom level, selection, undo/redo availability.
- **Reach for `events`** when you need to *react to something happening* — an object was added, a selection changed — especially if you want middleware (logging, validation) around it, or you're writing a plugin that needs to hook canvas mutations without polling state.

They're not mutually exclusive: `CanvasEngine`'s own internal sync methods (`syncObjects()`, `syncSelection()`) update `store` **and** emit on `events` from the same canvas listener, for exactly this reason — some consumers want the reactive snapshot, others want the notification.
