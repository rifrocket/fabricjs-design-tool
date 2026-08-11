<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="220"/>

  # Fabric Design Tool — Demo

  **The reference implementation and feature showcase for [`@rifrocket/fdt-react`](../../packages/react) + the plugin ecosystem.**
</div>

This app is a full editor shell — toolbar, sidebars, panels, templates, dev tools — built entirely against the **public** `@rifrocket/fdt-react` API. Nothing here reaches into package internals; it's meant to double as a best-practice reference for anyone evaluating or integrating the library, and every plugin package is exercised somewhere in this app.

## What it demonstrates

- **App shell** ([`src/shell`](src/shell)) — header, left tool rail, right property sidebar, floating panels, status bar, and a context menu, all shared by both the single-document editor and multi-page mode ([`src/engine/EngineHost.tsx`](src/engine/EngineHost.tsx))
- **One screen, two document modes** — a single-document `CanvasEngine`, and `@rifrocket/fdt-plugin-pages`' multi-page `PagesManager`, toggled in place from the header (not a separate screen/route). The runtimes stay genuinely different (one canvas vs. N), but the document moves between them through real, public, symmetric package APIs: `PagesManager.seedFromDocument()` going single→multi, and `PagesManager.exportPageAsDocument()` (the new reverse) going multi→single. Multi-page mode also demonstrates front/back page pairing (a business-card generator), copying an object between pages, and exporting a pair as one print-ready PDF.
- **Starter templates** ([`src/templates`](src/templates)) — 8 pre-built documents (blank, business card, flyer, poster, social post, product label, certificate, logo) selectable from a `TemplatePicker`
- **Every plugin package installed**: `plugin-alignment`, `plugin-clipboard`, `plugin-effects`, `plugin-effects-panel`, `plugin-export-pdf`, `plugin-image`, `plugin-import-json`, `plugin-devtools`, `plugin-local-storage`, `plugin-pages`, `plugin-pan-zoom`, `plugin-qrcode`, `plugin-shapes-basic`, `plugin-shapes-basic-panel`, `plugin-snapping`, `plugin-svg-import`, plus `theme` for light/dark theming
- **A custom plugin from scratch** ([`src/plugins/stampToolPlugin.ts`](src/plugins/stampToolPlugin.ts)) — proof that the extension points work outside the monorepo's own plugin packages, not just inside them
- **Dev tools** ([`src/dev-tools`](src/dev-tools)) — event log, object hierarchy panel, and a debug-mode toggle, all built from `plugin-devtools`'s public surface
- **First-time-user product tour** ([`src/tour`](src/tour)) — a [driver.js](https://driverjs.com/)-powered spotlight walkthrough: a 7-step core workspace tour that auto-plays once, and a 4-step multi-page mini-tour that auto-plays the first time multi-page mode is enabled. Replayable anytime via the header's help button; "seen" state is a demo-local `localStorage` flag, so it's demo UX, not a package feature
- **Feature modules** ([`src/features`](src/features)) — canvas, shapes, layers, selection, effects, export, viewport, persistence, and keyboard shortcuts, each demonstrating one slice of the engine API in isolation

## Running locally

From the repo root:

```bash
pnpm install
pnpm --filter @rifrocket/fdt-demo dev
# or, equivalently:
pnpm apps:dev
```

This starts Vite's dev server with the workspace's `packages/*` linked live — editing a package under `packages/` hot-reloads here without a separate build step.

```bash
pnpm --filter @rifrocket/fdt-demo build     # type-check + production build
pnpm --filter @rifrocket/fdt-demo preview   # preview the production build locally
pnpm --filter @rifrocket/fdt-demo lint
```

There's currently no hosted live demo — this app isn't deployed anywhere yet, only the [documentation site](https://rifrocket.github.io/fabricjs-design-tool/docs/) is. Run it locally to try it.

## A note on bundle size

This app statically imports every plugin package in the ecosystem at once — that's the point of a kitchen-sink reference implementation, not a reflection of what a real consumer app pays. The production build has one ~1.1MB (~350KB gzip) main chunk as a direct result: React, `fabric.js`, and ~13 plugin packages with no per-plugin code-splitting here. Every package in `packages/*` ships `sideEffects: false`, so a real app that installs only the 2–3 plugins it actually needs does **not** inherit this cost — that's a property of the packages themselves, verified independently of this demo. Treat this app's bundle size as a narrative/showcase cost, not a framework cost.

## Tech stack

React 19, Vite, Tailwind CSS v4, [Fabric.js](http://fabricjs.com/) (via `@rifrocket/fabricjs-design-tool`), [Lucide](https://lucide.dev/) icons — TypeScript throughout, strict mode.

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
