# @rifrocket/fdt-plugin-media-fields

## 3.2.0

### Minor Changes

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

### Patch Changes

- 5d22168: release version 4
- Updated dependencies [5d22168]
  - @rifrocket/fdt-properties@3.0.2
  - @rifrocket/fabricjs-design-tool@3.0.2

## 3.1.0

### Minor Changes

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
