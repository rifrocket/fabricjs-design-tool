import type { CanvasEngine } from "../engine/canvasEngine";

// Generic over the context type a plugin's install()/uninstall() receive, defaulting to
// CanvasEngine so every existing `const plugin: EditorPlugin = { install(engine) {...} }` keeps
// inferring `engine: CanvasEngine` exactly as it did before EditorContext existed — bivariant
// method checking alone does NOT preserve this for plugins that omit an explicit parameter type
// annotation (the common style in this codebase): TypeScript contextually types an unannotated
// `install(engine)` parameter from the interface's OWN declared parameter type, so if that type
// were narrowed to EditorContext directly, `engine` would lose access to CanvasEngine-only
// members (.selection, .viewport, .getFabricCanvas(), ...) that most existing plugins use
// inside install() — a real break discovered while implementing FUTURE_IMPLEMENTATION.md Chunk
// 3.1, not merely a theoretical one (confirmed via a full monorepo typecheck run). Defaulting
// the type parameter, the same pattern already used for ObjectTypeRegistry<TNode> (Chunk 1.2),
// fixes this: existing plugins are unaffected, and a plugin author who explicitly wants the
// narrower, renderer-agnostic contract can opt in with `EditorPlugin<EditorContext>`.
export interface EditorPlugin<TContext = CanvasEngine> {
  name: string;
  // Names of other plugins that must be installed first — e.g. a plugin registering property
  // fields for a type another plugin defines. Only consulted by CanvasEngine.useAll(); use()
  // installs immediately regardless, matching its existing simple, unordered semantics.
  // `@rifrocket/fdt-plugin-effects-panel` and `@rifrocket/fdt-plugin-shapes-basic-panel` declare
  // this (each depends on the sibling package registering the object types/effects their panel
  // renders) — still rare among built-in plugins; most have no genuine ordering requirement on
  // one another. Tested, intentional infrastructure, not dead code.
  dependsOn?: string[];
  install(context: TContext): void;
  // 8 plugins implement this today (local-storage, alignment, snapping, devtools, clipboard,
  // effects, effects-panel, shapes-basic-panel) — not because registries can't be unwound (every
  // registry has a working unregister(), several returning the closure straight from register()
  // for this purpose), but because the remaining plugins' install() calls don't capture those
  // closures, typically because they register an object type/importer/exporter rather than a
  // panel or shortcut — what "uninstalling" a type with live objects of it still on canvas should
  // mean isn't a settled question. Until a plugin implements this, engine.unuse() leaves whatever
  // it registered installed for the engine's lifetime.
  uninstall?(context: TContext): void;
}
