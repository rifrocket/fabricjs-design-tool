---
sidebar_position: 1
title: Installation
---

# Installation

:::info Coming from v1?
This is the v2+ rewrite of the previously-published `@rifrocket/fabricjs-design-tool` (v1), now split into `@rifrocket/fabricjs-design-tool` (core) plus the `@rifrocket/fdt-*` packages described below. See the [migration guide](/docs/migration/v1-to-v2) if you're upgrading.
:::

## Choose a starting point

| You want... | Install |
|---|---|
| A batteries-included React editor | `@rifrocket/fdt-react` (pulls in `@rifrocket/fabricjs-design-tool` and the plugins its `"default"` preset bundles) |
| The React adapter with your own hand-picked plugins | `@rifrocket/fabricjs-design-tool` + `@rifrocket/fdt-react` + whichever `@rifrocket/fdt-plugin-*` packages you need |
| Just the framework-agnostic canvas engine, no React | `@rifrocket/fabricjs-design-tool` + whichever plugins you need |
| Themed light/dark CSS variables | `@rifrocket/fdt-theme` (optional — plain CSS, no JS runtime) |

## React consumers

```bash
npm install @rifrocket/fabricjs-design-tool @rifrocket/fdt-react @rifrocket/fdt-theme
```

`fabric` is a **peer dependency** of `@rifrocket/fabricjs-design-tool`, and `react`/`react-dom` are peer dependencies of `@rifrocket/fdt-react` — install them yourself if your app doesn't already have them:

```bash
npm install fabric react react-dom
```

This gets you `<DesignEditor>`/`<Editor>` and every hook, but **no plugins are installed automatically** unless you use a named preset (`<DesignEditor preset="default">`) — see [Choosing your entry point](/docs/getting-started/choosing-your-entry-point). To add specific plugins yourself:

```bash
npm install @rifrocket/fdt-plugin-shapes-basic @rifrocket/fdt-plugin-qrcode
```

Each plugin declares its own peer dependencies (always `fabric`; plugins with UI panels also peer-depend on `react`/`react-dom`) — see the [plugin overview](/docs/plugins/overview) for the full list and which of the 17 plugin packages need React.

## Framework-agnostic (no React) consumers

```bash
npm install @rifrocket/fabricjs-design-tool fabric
```

`@rifrocket/fabricjs-design-tool` has zero React dependency — enforced in CI via a `dependency-cruiser` rule, not just convention — so this install works in a vanilla-JS, Vue, Svelte, or any other app. Reach for `createEngine()`:

```ts
import { createEngine } from "@rifrocket/fabricjs-design-tool";

const engine = createEngine(document.querySelector("canvas"), { width: 800, height: 600 });
```

## Theme

`@rifrocket/fdt-theme` ships plain CSS custom properties, no JavaScript runtime:

```bash
npm install @rifrocket/fdt-theme
```

```ts
import "@rifrocket/fdt-theme/tokens.css";
```

`<Editor theme="light" | "dark" | "system">` sets `data-fdt-theme` on its root element for you automatically if you're using the React adapter. Framework-agnostic consumers set `data-fdt-theme="light"` (or `"dark"`) on whichever element wraps their canvas — see [Custom Theme](/docs/guides/custom-theme) for the full token list and override pattern.

## Package export subpaths

`@rifrocket/fabricjs-design-tool` ships three subpath exports alongside its main barrel, so bundlers can tree-shake code you don't use (e.g. the PDF/history/effects machinery) out of your bundle:

```ts
import { HistoryManager } from "@rifrocket/fabricjs-design-tool/history";
import { getEffectStack } from "@rifrocket/fabricjs-design-tool/effects";
import { CanvasExporter } from "@rifrocket/fabricjs-design-tool/export";
```

Importing the same symbols from the main `@rifrocket/fabricjs-design-tool` entry point works too — the subpaths exist for bundle-size control, not because anything is exclusive to them.

## Next steps

Continue to the [Quick Start](/docs/getting-started/quick-start) for a working example, or read [Choosing your entry point](/docs/getting-started/choosing-your-entry-point) if you're not sure whether `<DesignEditor>`, `<Editor>`, or `createEngine()` is the right fit.
