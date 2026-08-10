# @rifrocket/fdt-plugin-qrcode

## 3.0.4

### Patch Changes

- 8822338: Clears the P2 backlog from `design-docs/PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md` (items #16, #18,
  #19 — #17 verified as still not applicable, no code change):

  - New package `@rifrocket/fdt-plugin-media-fields`: the `MEDIA_FIELDS` property-field array
    (position, blend mode, opacity, rotation) previously duplicated byte-for-byte in
    `@rifrocket/fdt-plugin-image` and `@rifrocket/fdt-plugin-qrcode`, extracted to its own small
    data-only package (no `install()`) since neither existing package was a clean home for it. Both
    plugins now depend on it instead of carrying their own copy; no behavior change.
  - `@rifrocket/fdt-plugin-pages`: README's "Migrating from a single document" section now
    explicitly documents `<MultiPageDesignEditor onReady>`'s signature/firing-contract delta from
    `<DesignEditor onReady>` (`(engine, pageId)`, fires on every page switch, vs `(engine)` once).
  - `@rifrocket/fdt-demo`: README gained a note distinguishing this app's intentional kitchen-sink
    bundle size (every plugin statically imported at once) from real per-plugin consumer cost
    (`sideEffects: false` on every package means a real app installing 2–3 plugins doesn't inherit
    this).

- 8822338: release version 4
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
  - @rifrocket/fabricjs-design-tool@3.0.3
  - @rifrocket/fdt-plugin-media-fields@3.3.0

## 3.0.3

### Patch Changes

- 5d22168: Clears the P2 backlog from `design-docs/PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md` (items #16, #18,
  #19 — #17 verified as still not applicable, no code change):

  - New package `@rifrocket/fdt-plugin-media-fields`: the `MEDIA_FIELDS` property-field array
    (position, blend mode, opacity, rotation) previously duplicated byte-for-byte in
    `@rifrocket/fdt-plugin-image` and `@rifrocket/fdt-plugin-qrcode`, extracted to its own small
    data-only package (no `install()`) since neither existing package was a clean home for it. Both
    plugins now depend on it instead of carrying their own copy; no behavior change.
  - `@rifrocket/fdt-plugin-pages`: README's "Migrating from a single document" section now
    explicitly documents `<MultiPageDesignEditor onReady>`'s signature/firing-contract delta from
    `<DesignEditor onReady>` (`(engine, pageId)`, fires on every page switch, vs `(engine)` once).
  - `@rifrocket/fdt-demo`: README gained a note distinguishing this app's intentional kitchen-sink
    bundle size (every plugin statically imported at once) from real per-plugin consumer cost
    (`sideEffects: false` on every package means a real app installing 2–3 plugins doesn't inherit
    this).

- 5d22168: release version 4
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
  - @rifrocket/fdt-plugin-media-fields@3.2.0
  - @rifrocket/fabricjs-design-tool@3.0.2

## 3.0.2

### Patch Changes

- a645689: Clears the P2 backlog from `design-docs/PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md` (items #16, #18,
  #19 — #17 verified as still not applicable, no code change):

  - New package `@rifrocket/fdt-plugin-media-fields`: the `MEDIA_FIELDS` property-field array
    (position, blend mode, opacity, rotation) previously duplicated byte-for-byte in
    `@rifrocket/fdt-plugin-image` and `@rifrocket/fdt-plugin-qrcode`, extracted to its own small
    data-only package (no `install()`) since neither existing package was a clean home for it. Both
    plugins now depend on it instead of carrying their own copy; no behavior change.
  - `@rifrocket/fdt-plugin-pages`: README's "Migrating from a single document" section now
    explicitly documents `<MultiPageDesignEditor onReady>`'s signature/firing-contract delta from
    `<DesignEditor onReady>` (`(engine, pageId)`, fires on every page switch, vs `(engine)` once).
  - `@rifrocket/fdt-demo`: README gained a note distinguishing this app's intentional kitchen-sink
    bundle size (every plugin statically imported at once) from real per-plugin consumer cost
    (`sideEffects: false` on every package means a real app installing 2–3 plugins doesn't inherit
    this).

- Updated dependencies [a645689]
  - @rifrocket/fdt-plugin-media-fields@3.1.0

## 3.0.1

### Patch Changes

- 6a408a4: update documentation
- Updated dependencies [6a408a4]
  - @rifrocket/fdt-properties@3.0.1
  - @rifrocket/fabricjs-design-tool@3.0.1

## 3.0.0

### Major Changes

- First stable release. Beta testing (2.0.0-beta.0/beta.1) is complete — this is the first release published under npm's `latest` tag with no prerelease suffix, published directly as 3.0.0 rather than 2.0.0 so the version number isn't tied to the beta cycle. No breaking API changes beyond what already shipped in the betas.

### Patch Changes

- Updated dependencies
  - @rifrocket/fabricjs-design-tool@3.0.0
  - @rifrocket/fdt-properties@3.0.0

## 2.0.0

### Major Changes

- ebe6ca3: Initial public beta release of the v2 monorepo packages.

### Patch Changes

- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.
- Updated dependencies [ebe6ca3]
- Updated dependencies [f096f8f]
  - @rifrocket/fabricjs-design-tool@2.0.0
  - @rifrocket/fdt-properties@2.0.0

## 2.0.0-beta.1

### Patch Changes

- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.
- Updated dependencies [f096f8f]
  - @rifrocket/fabricjs-design-tool@2.0.0-beta.1
  - @rifrocket/fdt-properties@2.0.0-beta.1

## 2.0.0-beta.0

### Major Changes

- ebe6ca3: Initial public beta release of the v2 monorepo packages.

### Patch Changes

- Updated dependencies [ebe6ca3]
  - @rifrocket/fdt-core@2.0.0-beta.0
  - @rifrocket/fdt-properties@2.0.0-beta.0
