<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo.svg" alt="Fabric Design Tool" width="220"/>

  # Fabric Design Tool — Demo

  **The reference implementation and feature showcase for [`@rifrocket/fdt-react`](../../packages/react) + the plugin ecosystem.**
</div>

This app is a full editor shell — toolbar, sidebars, panels, templates, dev tools — built entirely against the **public** `@rifrocket/fdt-react` API. Nothing here reaches into package internals; it's meant to double as a best-practice reference for anyone evaluating or integrating the library, and every plugin package is exercised somewhere in this app.

## What it demonstrates

- **App shell** ([`src/shell`](src/shell)) — header, left tool rail, right property sidebar, floating panels, status bar, and a context menu, all wired to a single `CanvasEngine` instance ([`src/engine/EngineHost.tsx`](src/engine/EngineHost.tsx))
- **Starter templates** ([`src/templates`](src/templates)) — 8 pre-built documents (blank, business card, flyer, poster, social post, product label, certificate, logo) selectable from a `TemplatePicker`
- **Every plugin package installed**: `plugin-clipboard`, `plugin-effects`, `plugin-export-pdf`, `plugin-image`, `plugin-import-json`, `plugin-devtools`, `plugin-local-storage`, `plugin-pan-zoom`, `plugin-qrcode`, `plugin-shapes-basic`, `plugin-svg-import`, plus `theme` for light/dark theming
- **A custom plugin from scratch** ([`src/plugins/stampToolPlugin.ts`](src/plugins/stampToolPlugin.ts)) — proof that the extension points work outside the monorepo's own plugin packages, not just inside them
- **Dev tools** ([`src/dev-tools`](src/dev-tools)) — event log, object hierarchy panel, and a debug-mode toggle, all built from `plugin-devtools`'s public surface
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

## Tech stack

React 19, Vite, Tailwind CSS v4, [Fabric.js](http://fabricjs.com/) (via `@rifrocket/fabricjs-design-tool`), [Lucide](https://lucide.dev/) icons — TypeScript throughout, strict mode.

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
