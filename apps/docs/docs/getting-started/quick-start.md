---
sidebar_position: 2
title: Quick Start
---

# Quick Start

The example below is not hand-copied into this page — it's pulled directly, at build time, from [`packages/react/src/quickstart.example.tsx`](https://github.com/rifrocket/fabricjs-design-tool/blob/main/packages/react/src/quickstart.example.tsx) in the repository. That file is typechecked on every CI run (`packages-ci.yml`'s "Typecheck packages" step), so this page can never silently drift from a working example the way a copy-pasted snippet could.

```tsx file=<rootDir>/packages/react/src/quickstart.example.tsx
```

A few things worth noticing:

- **`plugins` is construction-time only.** `<Editor plugins={[examplePlugin]}>` reads its `plugins` array exactly once, when the engine is constructed — changing the array on a live, already-mounted `<Editor>` does nothing. There's no safe general story for hot-swapping an installed plugin set (uninstall ordering, plugin-held state), so this is deliberate, not a bug. To swap plugins, remount with a different `key` (e.g. `key={documentId}`). The same rule applies to `<DesignEditor preset="...">` and its `plugins` override prop — see [Installing Plugins](/docs/plugins/installing-plugins) for the full explanation.
- **`onReady` fires once, synchronously**, right after the engine is constructed — it's the place to run first-time setup like `engine.setZoom(1)` above, or to restore a previously-saved document.
- **`useEditor()`** (used by `AddRectangleButton` above) gives any descendant component access to the live `CanvasEngine` instance, as long as it's rendered somewhere inside `<Editor>` — no prop drilling required.

## Batteries-included: `<DesignEditor>`

The example above uses `<Editor>` with a single, hand-written example plugin — useful for understanding the underlying contract, but not how most apps start. For a general-purpose editor, `<DesignEditor preset="default">` bundles a curated, dependency-light set of plugins (shapes, clipboard, SVG import, images, effects, PDF export, QR codes) with zero configuration:

```tsx
import { DesignEditor } from "@rifrocket/fdt-react";

function App() {
  return <DesignEditor preset="default" theme="system" width={800} height={600} />;
}
```

See [Choosing your entry point](/docs/getting-started/choosing-your-entry-point) for how to decide between `<DesignEditor>`, `<Editor>`, and the framework-agnostic `createEngine()`.

## Next steps

- **[Choosing your entry point](/docs/getting-started/choosing-your-entry-point)** — decision guide.
- **[Architecture overview](/docs/architecture/overview)** — what `CanvasEngine` actually composes under the hood.
- **[Plugins overview](/docs/plugins/overview)** — the full plugin list, and an important distinction between two plugin shapes you should know before installing one.
