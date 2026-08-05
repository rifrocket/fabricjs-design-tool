---
sidebar_position: 6
title: Event Middleware
---

# Event Middleware

`engine.events` (an `EventBus`) is generic string-keyed pub-sub with middleware support — the seam for cross-cutting concerns like logging, analytics, or validation without every plugin that cares having to instrument the same call sites individually.

## Subscribing

```ts
const unsubscribe = engine.events.on("objects:changed", (objectIds: string[]) => {
  console.log("canvas now has", objectIds.length, "objects");
});

engine.events.on("selection:changed", (selectedIds: string[]) => { ... });
```

`CanvasEngine` emits `"objects:changed"` and `"selection:changed"` internally today, mirroring the underlying Fabric canvas's own `object:added`/`object:removed`/`selection:*` events. A plugin can also `emit()` its own custom events — `@rifrocket/fdt-plugin-local-storage`'s `REQUEST_SAVE_EVENT` is a real example, used as an escape hatch for save-triggering changes its other listeners (`engine.store`, Fabric's `object:modified`) don't observe on their own.

## Middleware

```ts
engine.events.use((event, payload, next) => {
  console.log(`[event] ${event}`, payload);
  next(); // must call next() to let the event continue to its handlers
});
```

Middleware runs in registration order, before any handler sees the event. Not calling `next()` short-circuits the event entirely — no handler is invoked. This is the mechanism for validation ("reject this mutation") or centralized logging without wrapping every individual `emit()` call site by hand.

```ts
// Example: block a custom "object:beforeDelete" event past a certain object count.
engine.events.use((event, payload, next) => {
  if (event === "object:beforeDelete" && tooManyObjectsAlready()) return; // short-circuit
  next();
});
```

## Registering your own events from a plugin

Nothing about `EventBus` is exclusive to `core` — any plugin can `emit()` its own event names and document them as part of its public surface, the same way `plugin-local-storage` exports `REQUEST_SAVE_EVENT` as a named constant rather than a bare string other code has to guess:

```ts
export const MY_CUSTOM_EVENT = "my-plugin:something-happened";

const myPlugin: EditorPlugin = {
  name: "my-plugin",
  install(engine) {
    engine.events.emit(MY_CUSTOM_EVENT, { detail: "..." });
  },
};
```
