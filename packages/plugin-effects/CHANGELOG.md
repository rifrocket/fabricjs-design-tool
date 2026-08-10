# @rifrocket/fdt-plugin-effects

## 3.1.0

### Minor Changes

- a645689: Fix `installRenderPatch()` closing over whichever `CanvasEngine`'s effects registry installed
  first, silently wrong under multiple engines with different effect sets (e.g.
  `@rifrocket/fdt-plugin-pages`' one-engine-per-page model). Registries are now keyed per-canvas in
  a `WeakMap`, resolved from `this.canvas` at render time. Added a real `uninstall(engine)` that
  removes only that engine's own canvas entry — the shared `FabricObject.prototype.render()` patch
  itself is left in place, since other live engines may still depend on it.

## 3.0.1

### Patch Changes

- 6a408a4: update documentation
- Updated dependencies [6a408a4]
  - @rifrocket/fabricjs-design-tool@3.0.1

## 3.0.0

### Major Changes

- First stable release. Beta testing (2.0.0-beta.0/beta.1) is complete — this is the first release published under npm's `latest` tag with no prerelease suffix, published directly as 3.0.0 rather than 2.0.0 so the version number isn't tied to the beta cycle. No breaking API changes beyond what already shipped in the betas.

### Patch Changes

- Updated dependencies
  - @rifrocket/fabricjs-design-tool@3.0.0

## 2.0.0

### Major Changes

- ebe6ca3: Initial public beta release of the v2 monorepo packages.

### Patch Changes

- Fix raster-track effects (Blur, Noise, Glow, Pixelate, and every other image/creative effect) rendering blocky/pixelated whenever the affected object was scaled up via a resize handle, or the canvas was zoomed in. The raster bitmap is now supersampled to match the object's actual on-screen density (object scale × canvas zoom × device pixel ratio) before being composited back at its true size, instead of always rasterizing at a fixed 1:1 local-pixel resolution and stretching the result.
- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.
- Updated dependencies [ebe6ca3]
- Updated dependencies [f096f8f]
  - @rifrocket/fabricjs-design-tool@2.0.0

## 2.0.0-beta.1

### Patch Changes

- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.
- Updated dependencies [f096f8f]
  - @rifrocket/fabricjs-design-tool@2.0.0-beta.1

## 2.0.0-beta.0

### Major Changes

- ebe6ca3: Initial public beta release of the v2 monorepo packages.

### Patch Changes

- Updated dependencies [ebe6ca3]
  - @rifrocket/fdt-core@2.0.0-beta.0
