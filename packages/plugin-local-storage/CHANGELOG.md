# @rifrocket/fdt-plugin-local-storage

## 3.0.3

### Patch Changes

- 8822338: `saveDesignToStorage`/`loadDesignFromStorage`'s public API and `StoredDesign` type are unchanged,
  but what's actually written to `localStorage` internally is now a one-page `DesignDocument` (see
  `@rifrocket/fabricjs-design-tool`'s new shared type) instead of a flat `{ snapshot, meta }`
  object — the same shape `@rifrocket/fdt-plugin-pages`' own storage format is built on, so a
  single-document save and a multi-page save are byte-compatible JSON. A pre-existing entry saved
  under the old flat shape is treated as unusable (returns `null` from `loadDesignFromStorage`,
  same as any other unreadable data) rather than migrated.
- 8822338: release version 4
- Updated dependencies [8822338]
- Updated dependencies [8822338]
  - @rifrocket/fabricjs-design-tool@3.0.3

## 3.0.2

### Patch Changes

- 5d22168: release version 4
- Updated dependencies [5d22168]
  - @rifrocket/fabricjs-design-tool@3.0.2

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
