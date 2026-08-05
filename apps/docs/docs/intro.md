---
sidebar_position: 1
title: Introduction
slug: /
---

# Fabric Design Tool

**`@rifrocket/fdt-*`** is a Fabric.js-based design tool engine, split into small, independently installable packages: a framework-agnostic canvas core, a thin React adapter, a CSS theme, and a plugin ecosystem covering shapes, QR codes, SVG import, images, effects, PDF export, and more.

It's built for two different audiences at once:

- **Application developers** who want a batteries-included design editor (think: a Canva-style canvas) embedded in their product in a few lines of React.
- **Framework consumers** who want just the canvas engine — object model, undo/redo, viewport, plugin registries — with no UI opinions at all, to build a completely custom editor on top.

## Why a framework-agnostic core?

Most Fabric.js-based editors hard-wire the canvas, the UI, and the feature set together, which makes them impossible to extend without forking. `@rifrocket/fabricjs-design-tool` owns exactly one thing — a single Fabric.js `Canvas` instance — and exposes every other capability (object types, tools, panels, property fields, import/export formats) as a **registry** that plugins register into. The React package, and every one of the 13 official plugins, are built entirely on top of that same public registry API — nothing in this framework has special internal access that a third-party plugin doesn't also have.

## Two ways in

```tsx
import { DesignEditor } from "@rifrocket/fdt-react";

// Batteries-included: shapes, clipboard, SVG import, images, effects, PDF export, QR codes.
<DesignEditor preset="default" theme="system" width={800} height={600} />;
```

```ts
import { createEngine } from "@rifrocket/fabricjs-design-tool";

// Framework-agnostic: no React, no bundled plugins, just the engine.
const engine = createEngine(canvasElement, { width: 800, height: 600 });
engine.addObjectOfType("rect", { left: 10, top: 10, width: 100, height: 60 });
```

Head to **[Getting Started](/docs/getting-started/installation)** to install the packages you need, or jump straight to the **[Quick Start](/docs/getting-started/quick-start)** for a verified-working example.

## Project status

Every `@rifrocket/fdt-*` package is currently `private: true` in the monorepo and not yet published to npm — this is the v2.0.0 rewrite of a previously-published `@rifrocket/fabricjs-design-tool` (v1). See the [migration guide](/docs/migration/v1-to-v2) if you're coming from v1, and the [GitHub repository](https://github.com/rifrocket/fabricjs-design-tool) for release status.

## Where to go next

- **[Choosing your entry point](/docs/getting-started/choosing-your-entry-point)** — `<DesignEditor>` vs `<Editor>` vs `createEngine()`, and which one fits your app.
- **[Architecture overview](/docs/architecture/overview)** — how the monorepo, the `CanvasEngine`, and the React adapter fit together.
- **[Plugins overview](/docs/plugins/overview)** — the 13 official plugins, and an important distinction between two different plugin shapes you'll want to know about before you install one.
- **[Writing a plugin](/docs/guides/writing-a-plugin)** — build your own extension end-to-end.
