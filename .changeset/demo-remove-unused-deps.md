---
"@rifrocket/fdt-demo": patch
---

Remove 4 unused direct dependencies (`@rifrocket/fdt-plugin-export-pdf`, `-image`, `-effects`,
`-shapes-basic`) — each reaches the demo transitively via `preset="default"`'s own bundling;
nothing in `apps/demo/src` imported any of them directly.
