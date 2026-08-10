# @rifrocket/fdt-plugin-pan-zoom

## 3.1.0

### Minor Changes

- a645689: Add `captureSnapshotExcludingBoundary(engine)` to `@rifrocket/fdt-plugin-pan-zoom` — captures a
  document snapshot the same way core's `captureSnapshot()` does, but excludes the page-boundary
  rect (`createPageBoundaryRect`/`usePannableDocument`) from the resulting JSON without affecting
  its real, visible PNG/SVG/PDF export appearance. Previously this required every consumer to
  reinvent the same `excludeFromExport`-toggle trick locally (as `apps/demo` did); the demo now
  consumes the package's own helper instead of its own copy, which has been deleted. The README's
  Quick Start also now leads with `usePannableDocument()`, the package's own most-bundled hook,
  which was previously undocumented.

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
