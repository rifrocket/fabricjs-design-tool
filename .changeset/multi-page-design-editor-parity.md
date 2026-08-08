---
"@rifrocket/fdt-plugin-pages": minor
---

`<MultiPageDesignEditor>` gains `propertyFields` and `autosave` props, for parity with
`<DesignEditor propertyFields>`/`<DesignEditor autosave>`. `propertyFields` is applied once per
page's engine (guarded so a revisit to an already-open page doesn't duplicate fields).
`autosave` is a real new capability — `PagesManagerOptions` gains `onContentChange`, reusing the
same per-page listener wiring that already drives thumbnail tracking, and restores a prior save
on mount, taking priority over `initialDocument`.
