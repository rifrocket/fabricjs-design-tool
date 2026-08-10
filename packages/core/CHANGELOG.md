# @rifrocket/fdt-core

## 3.0.3

### Patch Changes

- 8822338: Add `DesignDocument`/`DesignDocumentPage` — a shared document/page vocabulary
  (`{ meta, pages: [{ id, order, name?, width?, height?, backgroundColor?, snapshot? }] }`) that
  `@rifrocket/fdt-plugin-local-storage` and `@rifrocket/fdt-plugin-pages` now both build their
  on-disk storage format on, so a single-document save and a multi-page save are byte-compatible
  JSON — a single document is just a `DesignDocument` with one page. Purely additive; no existing
  export changes.
- 8822338: release version 4

## 3.0.2

### Patch Changes

- 5d22168: release version 4

## 3.0.1

### Patch Changes

- 6a408a4: update documentation

## 3.0.0

### Major Changes

- First stable release. Beta testing (2.0.0-beta.0/beta.1) is complete — this is the first release published under npm's `latest` tag with no prerelease suffix, published directly as 3.0.0 rather than 2.0.0 so the version number isn't tied to the beta cycle. No breaking API changes beyond what already shipped in the betas.

## 2.0.0

### Major Changes

- ebe6ca3: Initial public beta release of the v2 monorepo packages.

### Patch Changes

- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.

## 2.0.0-beta.1

### Patch Changes

- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.

## 2.0.0-beta.0

### Major Changes

- ebe6ca3: Initial public beta release of the v2 monorepo packages.
