import type { CanvasEngine } from "../engine/canvasEngine";

export interface EditorPlugin {
  name: string;
  // Names of other plugins that must be installed first — e.g. a plugin registering property
  // fields for a type another plugin defines. Only consulted by CanvasEngine.useAll(); use()
  // installs immediately regardless, matching its existing simple, unordered semantics.
  // `@rifrocket/fdt-plugin-effects-panel` and `@rifrocket/fdt-plugin-shapes-basic-panel` declare
  // this (each depends on the sibling package registering the object types/effects their panel
  // renders) — still rare among built-in plugins; most have no genuine ordering requirement on
  // one another. Tested, intentional infrastructure, not dead code.
  dependsOn?: string[];
  install(engine: CanvasEngine): void;
  // 8 plugins implement this today (local-storage, alignment, snapping, devtools, clipboard,
  // effects, effects-panel, shapes-basic-panel) — not because registries can't be unwound (every
  // registry has a working unregister(), several returning the closure straight from register()
  // for this purpose), but because the remaining plugins' install() calls don't capture those
  // closures, typically because they register an object type/importer/exporter rather than a
  // panel or shortcut — what "uninstalling" a type with live objects of it still on canvas should
  // mean isn't a settled question. Until a plugin implements this, engine.unuse() leaves whatever
  // it registered installed for the engine's lifetime.
  uninstall?(engine: CanvasEngine): void;
}
