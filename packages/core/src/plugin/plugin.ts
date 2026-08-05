import type { CanvasEngine } from "../engine/canvasEngine";

export interface EditorPlugin {
  name: string;
  // Names of other plugins that must be installed first — e.g. a plugin registering property
  // fields for a type another plugin defines. Only consulted by CanvasEngine.useAll(); use()
  // installs immediately regardless, matching its existing simple, unordered semantics.
  // None of the built-in plugins declare this today — their install() calls have no genuine
  // ordering requirement on one another — so treat it as intentional, tested infrastructure for
  // the case where one arises, not dead code to remove.
  dependsOn?: string[];
  install(engine: CanvasEngine): void;
  // Only `@rifrocket/fdt-plugin-local-storage` implements this today. Registries generally have
  // no removal path (e.g. PanelRegistry has no unregister()), so for most plugins engine.unuse()
  // leaves whatever was registered — object types, panels, shortcuts — installed for the
  // engine's lifetime. Implement this only if your plugin's install() can genuinely be undone.
  uninstall?(engine: CanvasEngine): void;
}
