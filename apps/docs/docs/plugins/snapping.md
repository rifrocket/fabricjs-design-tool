---
sidebar_position: 13
title: snapping
---

# `@rifrocket/fdt-plugin-snapping`

**Kind:** Engine plugin (panel-slot wrapper) · **Peer dependencies:** `fabric`, `react`, `react-dom`

A bare on/off toggle panel for smart-guide snapping, wired to `engine.snapping` (`SnapEngine` — see [The CanvasEngine](/docs/architecture/canvas-engine)). `install()` registers `SnappingToggle` into the `sidebar-right` panel slot.

```ts
import { snappingPlugin } from "@rifrocket/fdt-plugin-snapping";

engine.use(snappingPlugin);
```

Remember that snapping itself (the `SnapEngine` behavior) is **disabled by default** — this plugin only adds a UI toggle for it, it doesn't turn snapping on. Enable the engine-level default separately if you want it on by default with the toggle just letting users turn it off:

```ts
const engine = createEngine(canvasEl, { snapping: { enabled: true } });
```

`SnappingToggle` is also exported directly, for manual placement outside the panel-registry mechanism.

## Exports

- `snappingPlugin` — the `EditorPlugin`
- `SnappingToggle` — the underlying React component

Not bundled into either `<DesignEditor>` built-in preset (peer-depends on `@rifrocket/fdt-react`). Add via `plugins.add`.
