---
"@rifrocket/fdt-plugin-effects": minor
---

Fix `installRenderPatch()` closing over whichever `CanvasEngine`'s effects registry installed
first, silently wrong under multiple engines with different effect sets (e.g.
`@rifrocket/fdt-plugin-pages`' one-engine-per-page model). Registries are now keyed per-canvas in
a `WeakMap`, resolved from `this.canvas` at render time. Added a real `uninstall(engine)` that
removes only that engine's own canvas entry — the shared `FabricObject.prototype.render()` patch
itself is left in place, since other live engines may still depend on it.
