---
sidebar_position: 1
title: v1 to v2
---

# Migrating from v1

`@rifrocket/fabricjs-design-tool` v1 (published to npm as a single package) and v2 (`@rifrocket/fdt-*`, this monorepo) are **intentionally, extensively breaking** — v2 is a ground-up rewrite, not a migration-compatible refactor. There is no automated codemod; this page itemizes what changed and why, with a before/after for each breaking change, so a v1 → v2 port is a deliberate rewrite of your integration code, not a patch.

v1 remains published and functional under its own dist-tag indefinitely — upgrading is opt-in.

## Package structure

**v1**: one package, two subpaths (`.` for "core" hooks/utils, `./ui` for React components).

**v2**: a monorepo of small, independently-installable packages (`@rifrocket/fdt-core`, `@rifrocket/fdt-react`, `@rifrocket/fdt-theme`, `@rifrocket/fdt-properties`, 13 `@rifrocket/fdt-plugin-*` packages). See [Installation](/docs/getting-started/installation).

## Peer dependencies, not hard dependencies

**v1**: `react`, `react-dom`, and `fabric` were hard `dependencies` — any consumer app risked a second copy of React/Fabric bundled (a common cause of "invalid hook call" and duplicate-canvas bugs).

**v2**: `fabric` is a peer dependency of `@rifrocket/fdt-core`; `react`/`react-dom` are peer dependencies of `@rifrocket/fdt-react` only. Install them explicitly in your app.

## The component API

**v1**:
```tsx
<Header {...34 required props} />
<CanvasWrapper canvasRef={ref} zoom={zoom} {...more props} />
<RightSidebar selectedObject={obj} canvas={canvas} {...more props} />
```
Real integration meant copy-pasting most of v1's internal 344-line demo `App.tsx` — the documented 10-line quick-start didn't actually compile against the real prop contracts.

**v2**:
```tsx
<DesignEditor preset="default" theme="system" width={800} height={600} />
```
One composable component. See the [Quick Start](/docs/getting-started/quick-start) — the example there is pulled directly from a file that's typechecked on every CI run, so it can't drift the way v1's README did.

## Adding shapes

**v1**: `useShapeCreator()` returned 22 separate `addXxx()` functions — one per shape type. `Header` similarly had ~24 individual `onAddXxx` callback props.

**v2**: one generic call through the object-type registry:
```ts
engine.addObjectOfType("rect", { left: 10, top: 10 });
engine.addObjectOfType("star", {});
```
See [Custom Object Types](/docs/extension-points/custom-object-types).

## Extensibility

**v1**: no plugin system. Adding a shape, tool, or panel meant editing the library's own source (`ShapeFactory` was a closed static class).

**v2**: every extension point — object types, tools, panels, property fields, export/import formats — is a registry a plugin registers into via `install(engine)`. See [Plugins Overview](/docs/plugins/overview) and [Writing a Plugin](/docs/guides/writing-a-plugin).

## Undo/redo

**v1**: whole-canvas JSON snapshots on nearly every change, capped at 50 states — cost scaled with total document size on every single edit.

**v2**: command-pattern history — each undo step stores only the delta, not a full document snapshot. See [History & Commands](/docs/architecture/history-and-commands).

## Styling and theming

**v1**: hardcoded Tailwind utility classes shipped inside components, with no corresponding CSS file in the published package — styling was effectively broken for real consumers. Dark mode existed as dead, hardcoded-off state.

**v2**: `@rifrocket/fdt-theme` ships CSS custom properties (`--fdt-*`), consumed via `[data-fdt-theme="light"|"dark"]`. `<Editor theme="light" | "dark" | "system">` sets the attribute for you. See [Custom Theme](/docs/guides/custom-theme). No Tailwind, no CSS-in-JS, in any published package.

## Direct Fabric access

**v1**: `RightSidebar`, `CanvasWrapper`, and even the reference `App.tsx` all imported Fabric classes directly and mutated the canvas outside any abstraction — `selectedObject: any`/`canvas: any` throughout.

**v2**: the primary surface is `CanvasEngine`'s managers (`engine.selection`, `engine.layers`, etc.) and the object-type/property-field registries. `engine.getFabricCanvas()` remains as an explicit, documented-as-unstable escape hatch — reach for it deliberately, not as a first instinct, since mutations made directly on the raw canvas bypass history tracking and the reactive store.

## Removed outright (not ported, not replaced)

- `historyManager.ts` — dead code in v1, fully superseded by v1's own `fabricUndoRedo.ts`; neither survives into v2.
- The duplicate pan implementation in v1's `CanvasWrapper.tsx` (v1 had two independently-implemented, competing pan systems). v2 has one: `ViewportManager`.
- `utils/performance.ts` — an empty file that was still exported in v1.
- `@types/fabric` v5 — Fabric v6 ships its own types; the separate v5 types package was stale dead weight.
- The non-functional "Templates" button in v1's `Header.tsx` (no `onClick` handler — decorative).
- The `DesignCanvas`/`Toolbar` aliases for `CanvasWrapper`/`Header` — v2 uses one canonical name per component.

## What's the same

Some v1 functionality was good and got ported largely as-is, just relocated: the smart-guide/snapping engine (v1's `smoothAlignmentGuides.ts` → v2's `SnapEngine`) and the multi-format canvas exporter (v1's `CanvasExporter` → v2's `CanvasExporter` in `@rifrocket/fdt-core`, PDF split out into `@rifrocket/fdt-plugin-export-pdf`).

