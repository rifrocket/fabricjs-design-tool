---
"@rifrocket/fdt-plugin-pan-zoom": minor
"@rifrocket/fdt-demo": patch
---

Add `captureSnapshotExcludingBoundary(engine)` to `@rifrocket/fdt-plugin-pan-zoom` — captures a
document snapshot the same way core's `captureSnapshot()` does, but excludes the page-boundary
rect (`createPageBoundaryRect`/`usePannableDocument`) from the resulting JSON without affecting
its real, visible PNG/SVG/PDF export appearance. Previously this required every consumer to
reinvent the same `excludeFromExport`-toggle trick locally (as `apps/demo` did); the demo now
consumes the package's own helper instead of its own copy, which has been deleted. The README's
Quick Start also now leads with `usePannableDocument()`, the package's own most-bundled hook,
which was previously undocumented.
