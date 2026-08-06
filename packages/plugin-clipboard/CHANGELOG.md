# @rifrocket/fdt-plugin-clipboard

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
