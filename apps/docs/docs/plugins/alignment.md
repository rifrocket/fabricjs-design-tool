---
sidebar_position: 12
title: alignment
---

# `@rifrocket/fdt-plugin-alignment`

**Kind:** Engine plugin (panel-slot wrapper) · **Peer dependencies:** `fabric`, `react`, `react-dom`

A ready-made align/distribute panel, wired to `engine.alignment` (`AlignmentManager` — see [The CanvasEngine](/docs/architecture/canvas-engine)). `install()` does exactly one thing: register `AlignmentControls` into the `sidebar-right` panel slot.

```ts
import { alignmentPlugin } from "@rifrocket/fdt-plugin-alignment";

engine.use(alignmentPlugin); // renders AlignmentControls into "sidebar-right"
```

```tsx
<Editor plugins={[shapesBasicPlugin, alignmentPlugin]} />
```

If you'd rather place the control manually (e.g. in a different slot, or inside a [custom shell](/docs/guides/custom-shell-with-editorcontext)) instead of using the plugin registration, `AlignmentControls` is exported directly and works anywhere under an `EditorContext.Provider`:

```tsx
import { AlignmentControls } from "@rifrocket/fdt-plugin-alignment";

<MyCustomSidebar>
  <AlignmentControls />
</MyCustomSidebar>;
```

## Exports

- `alignmentPlugin` — the `EditorPlugin`
- `AlignmentControls` — the underlying React component

Not bundled into either `<DesignEditor>` built-in preset (peer-depends on `@rifrocket/fdt-react` — see [Plugins Overview](/docs/plugins/overview)). Add via `plugins.add`.
