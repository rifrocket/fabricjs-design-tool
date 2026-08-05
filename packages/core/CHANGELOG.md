# @rifrocket/fdt-core

## 2.0.0-beta.1

### Patch Changes

- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.

## 2.0.0-beta.0

### Major Changes

- ebe6ca3: Initial public beta release of the v2 monorepo packages.
