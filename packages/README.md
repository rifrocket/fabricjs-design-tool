<div align="center">
  <img src="../apps/docs/static/img/logo-large.svg" alt="Fabric Design Tool" width="220"/>
</div>

# packages/

The [Fabric Design Tool](../README.md) engine, split into small, independently installable npm packages instead of one monolithic library. Each package below is published under the `alpha` npm dist-tag via [Changesets](../.changeset/README.md) — see the root README's [Architecture](../README.md#architecture) table for the one-line version of this list.

## Core packages

| Package | Purpose | `engine.use()`-able? |
|---|---|---|
| [`core`](./core) | Framework-agnostic canvas engine (`CanvasEngine`, registries, store, `createEditor()`) | — |
| [`react`](./react) | React adapter (`<Editor>`, `<DesignEditor>`, hooks) | — |
| [`theme`](./theme) | CSS design tokens, light/dark theming | — |
| [`properties`](./properties) | Shared property-field components (slider, number, color, toggle, select, text) | — |

## Plugins

| Package | Purpose | `engine.use()`-able? |
|---|---|---|
| [`plugin-shapes-basic`](./plugin-shapes-basic) | Default shape object types (text, rect, circle, line, ellipse, polygons) | Yes |
| [`plugin-qrcode`](./plugin-qrcode) | QR code object type (generation, validation, styling) | Yes |
| [`plugin-svg-import`](./plugin-svg-import) | SVG import | Yes |
| [`plugin-image`](./plugin-image) | Image object type | Yes |
| [`plugin-clipboard`](./plugin-clipboard) | Copy/paste/duplicate/group/select-all/nudge shortcuts | Yes |
| [`plugin-export-pdf`](./plugin-export-pdf) | PDF export (isolated so `jspdf` is only paid for by consumers who install this) | Yes |
| [`plugin-import-json`](./plugin-import-json) | JSON import (engine plugin + a bare trigger button) | Yes |
| [`plugin-effects`](./plugin-effects) | Object effects system (shadow, glow, blur, glitch, duotone, ...) | Yes |
| [`plugin-local-storage`](./plugin-local-storage) | Debounced `localStorage` autosave, built on core's document snapshot | Yes |
| [`plugin-alignment`](./plugin-alignment) | Align/distribute panel, wired to `AlignmentManager` | Yes (panel-slot wrapper) |
| [`plugin-snapping`](./plugin-snapping) | Smart-guide snapping on/off toggle panel | Yes (panel-slot wrapper) |
| [`plugin-devtools`](./plugin-devtools) | Dev-tools panels (event log, canvas state, history, hierarchy, perf stats) | Yes (panel-slot wrapper) |
| [`plugin-pan-zoom`](./plugin-pan-zoom) | Wheel-zoom + spacebar-drag-pan hooks for a fixed-size viewport | No — plain hooks/functions, deliberately not a panel (see its `index.ts` header comment) |

"Yes (panel-slot wrapper)" means the package's `install()` just registers an existing component into a panel slot (`registry.registerPanel()`) rather than adding engine-level behavior. These four packages need that wrapper because their UI (align/distribute, snapping toggle, dev-tools panels) has nothing to attach to without one — unlike `plugin-pan-zoom`, which is plain hooks/functions with no panel of its own, the deliberate holdout. None of the four `Yes (panel-slot wrapper)` packages are bundled into `<DesignEditor>`'s built-in presets (they'd create a circular dependency on `@rifrocket/fdt-react` — see `packages/react/src/preset/builtinPresets.ts`); add them via `plugins.add` instead.

## Working in this workspace

```bash
pnpm install            # install all workspace packages
pnpm packages:build     # turbo run build, scoped to packages/*
pnpm packages:test      # turbo run test, scoped to packages/*
pnpm packages:lint      # turbo run lint, scoped to packages/*
pnpm packages:dev       # turbo run dev (watch mode), scoped to packages/*
```

Versioning/publishing goes through [Changesets](../.changeset/README.md): add a changeset (`pnpm changeset`) describing your change, and merging it triggers the automated version-PR → npm publish flow described in the [root README](../README.md#contributing).

See [`../apps/demo`](../apps/demo) for a working consumer that wires these packages together through the public `<Editor>` API.
