---
sidebar_position: 14
title: devtools
---

# `@rifrocket/fdt-plugin-devtools`

**Kind:** Engine plugin (panel-slot wrapper) · **Peer dependencies:** `fabric`, `react`, `react-dom`

Five diagnostic panels — event log, canvas state viewer, undo/redo history, object hierarchy, and performance stats — built entirely from the framework's public API (nothing here reads private engine internals). `install()` registers all five into the `sidebar-right` slot at once.

```ts
import { devtoolsPlugin } from "@rifrocket/fdt-plugin-devtools";

engine.use(devtoolsPlugin);
```

Most apps should only install this in development:

```tsx
<DesignEditor preset="default" plugins={{ add: [...(import.meta.env.DEV ? [devtoolsPlugin] : [])] }} />
```

## The five panels

| Component | Shows |
|---|---|
| `EventLogPanel` | A live feed of `engine.events` activity |
| `CanvasStateViewer` | The current `engine.store` state (zoom, pan, object/selection ids, `propertyVersion`) |
| `HistoryPanel` | `engine.history.list()` — the live undo stack, oldest first |
| `HierarchyPanel` | The current object tree |
| `PerformanceStats` | Render-loop performance stats |

Every panel is also exported directly, for placement in a custom shell instead of via the panel registry — see [Building a Custom Shell](/docs/guides/custom-shell-with-editorcontext).

```tsx
import { HistoryPanel, PerformanceStats } from "@rifrocket/fdt-plugin-devtools";
```

## Exports

- `devtoolsPlugin` — the `EditorPlugin`
- `EventLogPanel`, `CanvasStateViewer`, `HistoryPanel`, `HierarchyPanel`, `PerformanceStats`
- `usePerformanceStats` — the hook backing `PerformanceStats`, if you want the raw numbers without the panel UI
- Types: `PerformanceStatsProps`, `PerfStats`

Not bundled into either `<DesignEditor>` built-in preset (peer-depends on `@rifrocket/fdt-react`, and most consumers shouldn't ship it to production anyway). Add via `plugins.add`, gated to development builds.
