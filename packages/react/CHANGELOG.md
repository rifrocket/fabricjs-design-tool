# @rifrocket/fdt-react

## 2.0.0-beta.1

### Patch Changes

- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.
- Updated dependencies [f096f8f]
  - @rifrocket/fabricjs-design-tool@2.0.0-beta.1
  - @rifrocket/fdt-plugin-clipboard@2.0.0-beta.1
  - @rifrocket/fdt-plugin-effects@2.0.0-beta.1
  - @rifrocket/fdt-plugin-export-pdf@2.0.0-beta.1
  - @rifrocket/fdt-plugin-image@2.0.0-beta.1
  - @rifrocket/fdt-plugin-local-storage@2.0.0-beta.1
  - @rifrocket/fdt-plugin-qrcode@2.0.0-beta.1
  - @rifrocket/fdt-plugin-shapes-basic@2.0.0-beta.1
  - @rifrocket/fdt-plugin-svg-import@2.0.0-beta.1

## 2.0.0-beta.0

### Major Changes

- ebe6ca3: Initial public beta release of the v2 monorepo packages.

### Patch Changes

- Updated dependencies [ebe6ca3]
  - @rifrocket/fdt-core@2.0.0-beta.0
  - @rifrocket/fdt-plugin-clipboard@2.0.0-beta.0
  - @rifrocket/fdt-plugin-effects@2.0.0-beta.0
  - @rifrocket/fdt-plugin-export-pdf@2.0.0-beta.0
  - @rifrocket/fdt-plugin-image@2.0.0-beta.0
  - @rifrocket/fdt-plugin-local-storage@2.0.0-beta.0
  - @rifrocket/fdt-plugin-qrcode@2.0.0-beta.0
  - @rifrocket/fdt-plugin-shapes-basic@2.0.0-beta.0
  - @rifrocket/fdt-plugin-svg-import@2.0.0-beta.0
