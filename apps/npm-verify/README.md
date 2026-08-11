# npm-verify

A registry integration test for every published `@rifrocket/*` package (21 total: `fabricjs-design-tool`, `fdt-react`, `fdt-theme`, `fdt-properties`, and 17 `fdt-plugin-*` packages) — installed the way a real external consumer would (`npm install` against the public npm registry) and exercised end to end in a browser.

## Why this exists, separately from `apps/demo`

[`apps/demo`](../demo) declares every `@rifrocket/*` dependency as `"workspace:*"`, so pnpm resolves it by symlinking straight to that package's local `packages/*` source. That's the right choice for a reference implementation, but it means `apps/demo` has never actually installed or exercised the *tarballs* that get published to npm — a packaging bug (a file missing from a package's `"files"` field, a wrong `"exports"`/`"main"` path, CSS not shipped, a peer dependency that doesn't resolve) would be completely invisible there.

`apps/npm-verify` exists to catch exactly that class of bug:

- **`apps/demo` proves the API design works** via workspace source.
- **`apps/npm-verify` proves the published artifacts work** via the real registry.

It's deliberately excluded from the pnpm workspace (see the `!apps/npm-verify` line in the root [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml)) and installed with plain `npm`, not `pnpm` — so pnpm can never silently symlink it back to local source. `package.json` pins every `@rifrocket/*` dependency to an exact version (no `^` range) for the same reason: this app's whole job is to prove *that specific* published version works.

## Running it

```bash
cd apps/npm-verify
npm install          # real registry install — do NOT run this via pnpm
npm run typecheck
npm run build         # tsc --noEmit && vite build
npm run dev            # http://localhost:5173 by default
```

Open the dev server and work through the coverage checklist on the right: click every button in the tool rail, sidebar, toolbar, and pages section, and confirm each row turns green. Sections auto-report a row "pass" when their wired action runs without throwing (proves the export exists and executes) — every row also has manual ✓/✗ buttons in the checklist so you can confirm what actually rendered on screen, since a successful function call isn't the same as "it looks right."

## Re-verifying after a new release

1. For each `@rifrocket/*` package, get the latest version: `npm view <package> version`.
2. Update every corresponding entry in `apps/npm-verify/package.json` to the new exact version.
3. `npm run verify:install` — removes `node_modules`/`package-lock.json` and reinstalls clean, so nothing stale from a previous version lingers.
4. `npm run build` — catches packaging regressions (missing dist files, wrong `exports` paths, un-shipped CSS) before you even open a browser.
5. `npm run dev` and re-exercise the checklist as above.

## What each row proves

See [`src/checklist/coverage.ts`](src/checklist/coverage.ts) for the full list — each package is paired with one concrete, clickable action (e.g. "add a real QR code object", "apply the shadow effect and confirm the stack grows", "add a second page and confirm it gets its own engine"), not just "it imported without crashing."

## Undocumented Tailwind dependency (found 2026-08-11)

Several of the framework's ready-made components ship real CSS via Tailwind utility classes (`bg-fdt-bg`, `border-fdt-border`, ...) that only resolve if the *consuming app* has Tailwind v4 configured with a token bridge mapping `--color-fdt-*` to `@rifrocket/fdt-theme`'s `--fdt-*` custom properties — exactly the setup `apps/demo` has in `src/styles/tailwind.css`, and that this app now mirrors in [`src/styles/tailwind.css`](src/styles/tailwind.css). Without it, those components still *function* (real `onClick`s wired to the real engine) but render with no visible spacing, borders, or hit-target separation — which is exactly what made `@rifrocket/fdt-plugin-pages`' page-tab-switching look broken during the first pass of this app (before Tailwind was added here): the tab thumbnails were real, clickable, and correctly wired the whole time, just visually collapsed into unstyled overlapping text.

None of the affected packages document this as a peer requirement. Confirmed by checking each published package's compiled `dist/*.js` directly for `className` usage:

- **Ships real Tailwind-dependent styling** (needs the token bridge): `@rifrocket/fdt-plugin-pages` (`PageTabsBar`, `PagesCanvas`), `@rifrocket/fdt-plugin-effects-panel` (`EffectsPanel` and friends), `@rifrocket/fdt-react`'s `PropertiesPanel`.
- **Genuinely bare, zero classNames, by explicit design** ("matching the convention `@rifrocket/fdt-react`'s own shipped components already follow" — `plugin-snapping`'s own source comment): `ShapePicker` (`plugin-shapes-basic-panel`), `AlignmentControls` (`plugin-alignment`), `SnappingToggle` (`plugin-snapping`), `LayersPanel` (`fdt-react`), and all three `plugin-devtools` panels. `apps/demo` handles these by building its own fully custom replacements (`AlignmentToolbar`, `ShapeGallery`, ...); this app instead styles the *real* bare components via Tailwind descendant selectors (see [`src/theme/classNames.ts`](src/theme/classNames.ts)), since a full custom rebuild isn't proportionate for a verification app.

Worth raising upstream: either document the Tailwind + token-bridge requirement in each affected package's README, or note explicitly (as `plugin-snapping` already does for its own bare components) which components are bare by design so a consumer doesn't spend time debugging what looks like broken interactivity.

Plain page-switching (pages created via **Add page**) was never actually broken — confirmed with a Playwright pass that adds visibly distinct shapes to two different pages, switches tabs, and checks the rendered canvas content (not just the "active page" label): each page correctly keeps its own independent content, and clicking a tab correctly swaps which page's `CanvasEngine` is on screen. What made it *look* broken pre-Tailwind: the tab's actual click target is a small 64×44 thumbnail `<button>` inside `PageTab`, not the page's name label next to it — indistinguishable from the rest of the unstyled tab strip without the token bridge. Separately, the Pages section originally had no way to add content to a page at all, so even a successful switch showed nothing changing (both pages were always blank) — fixed by adding an **"Add rectangle to active page"** button (via `usePagesContext().activeEngine`, which `<PagesProvider>` keeps pointed at whichever page is currently active) so switching has something visible to prove.

## `duplicatePage()` throws unless `plugin-import-json` is installed — undocumented (found 2026-08-11)

The most significant finding from this app: clicking a page's **Duplicate** button (`PageTabsBar`'s own icon, calling `PagesManager.duplicatePage()`) then activating the new page threw `PAGEERROR: No importer registered for "json"` and silently left the duplicate blank — reproduced by a user testing the live app, then confirmed and root-caused with a targeted Playwright pass before and after the fix.

**Root cause:** `PagesManager.duplicatePage()` (and `copyPage()`, `duplicatePagePair()`, and loading persisted pages via `hydrate()`) carries a source page's content onto the new page by calling core's `restoreSnapshot(engine, snapshot)` once the new page's engine is created (`packages/plugin-pages/src/PagesManager.ts`, `getOrCreateEngine`'s `pendingSnapshots` handling). `restoreSnapshot()` itself is implemented as:

```ts
// packages/core/src/document/snapshot.ts
export async function restoreSnapshot(engine, snapshot) {
  engine.setBackgroundColor(snapshot.backgroundColor);
  await engine.importFile("json", snapshot.json); // throws if "json" importer isn't registered
}
```

`engine.importFile("json", ...)` needs the `"json"` importer, which is registered **only** by `@rifrocket/fdt-plugin-import-json`'s `install()`. But:

- `plugin-import-json` isn't bundled in `<DesignEditor>`'s `"default"`/`"minimal"` presets (by design — it peer-depends on `@rifrocket/fdt-react`, documented elsewhere as the reason several panel plugins are excluded).
- `PagesManager`'s own `"default"`/`"minimal"` presets are the *same* `fdt-react` presets (see `resolvePagesPresetOption` in `packages/plugin-pages/src/react/usePages.ts`), so they don't include it either.
- Nothing in `plugin-pages`' README, `PagesManagerOptions` doc comments, or `restoreSnapshot`'s own doc comment mentions that duplicating/copying/hydrating pages requires this specific plugin to be installed on the pages' engines.

**Net effect:** any consumer who follows `plugin-pages`' own Quick Start (`new PagesManager({ maxPages, plugins: sharedPlugins })` or `<PagesProvider options={{ maxPages }}>`, neither example including `import-json`) gets a hard runtime crash the *first time* they duplicate a page, copy a page, duplicate a page pair, or reload pages from storage — a core, prominently-documented feature of the package (`PageTabsBar` ships a Duplicate button by default) — with an error message that gives no hint the fix is "install `@rifrocket/fdt-plugin-import-json`."

**Fixed here** by adding `importJsonPlugin` to this app's `<PagesProvider options={{ plugins: [importJsonPlugin] }}>` (see [`src/sections/PagesSection.tsx`](src/sections/PagesSection.tsx)) — confirmed the crash disappears and the duplicated page correctly shows the source page's content. Left unfixed upstream (not patched in `packages/`) so it stays visible: worth either bundling `import-json` into `plugin-pages`' own dependency chain (it already depends on `@rifrocket/fabricjs-design-tool`; installing `import-json`'s plugin automatically wherever `restoreSnapshot` is used internally would close this for good), or at minimum documenting the requirement prominently in `plugin-pages`' README and `PagesManagerOptions.plugins`' doc comment.

## Known finding from the first verification pass (2026-08-11)

Clicking **Duplicate selection** (`cloneFabricObject` from `@rifrocket/fdt-plugin-clipboard`) on an object already on the same canvas produces a React "two children with the same key" warning from `LayersPanel`. Root cause, traced during this verification: `cloneFabricObject` clones via Fabric's `object.clone(getSerializedProperties())`, which includes core's `fdtId` property (`packages/core/src/engine/objectId.ts`) among the cloned properties — so the clone carries the *same* `fdtId` as the original. Core's `getObjectId()` deliberately *adopts* a pre-existing `fdtId` rather than overwriting it (by design, so an id survives a JSON reload or a copy onto another canvas), which means a same-canvas duplicate ends up with two live objects sharing one id. This is a real cross-package interaction bug between `plugin-clipboard` and core's id-adoption model, left as-is here (not worked around in this app) so it stays visible for whoever picks it up in `packages/plugin-clipboard` or `packages/core`.
