import type { CanvasEngine } from "@rifrocket/fdt-core";

// Registers sensible default shortcuts (undo/redo/delete/deselect) plus every installed
// tool's own `shortcut`, so keyboard-driven tool switching works without extra plugin code.
// `disable` (combo strings, case-insensitive) skips a binding entirely rather than registering
// then unregistering it, so it never briefly shadows a consumer's own `add` binding for the
// same combo — see EditorProps.shortcuts / PresetShortcutsConfig.
// Returns a cleanup function that unregisters everything it added.
export function setupDefaultShortcuts(engine: CanvasEngine, disable: string[] = []): () => void {
  const disabled = new Set(disable.map((combo) => combo.toLowerCase()));
  const register = (combo: string, handler: () => void, description?: string): (() => void) | undefined => {
    if (disabled.has(combo.toLowerCase())) return undefined;
    return engine.shortcuts.register(combo, handler, description);
  };

  const unregisterFns: Array<() => void> = [
    register("ctrl+z", () => engine.undo(), "Undo"),
    register("ctrl+shift+z", () => engine.redo(), "Redo"),
    register("ctrl+y", () => engine.redo(), "Redo"),
    register("delete", () => engine.deleteSelection(), "Delete selection"),
    register("escape", () => engine.selection.clear(), "Deselect"),
  ].filter((fn): fn is () => void => fn !== undefined);

  for (const toolId of engine.registry.tools.list()) {
    const definition = engine.registry.tools.get(toolId);
    if (definition?.shortcut) {
      const unregister = register(definition.shortcut, () => engine.registry.tools.activate(toolId));
      if (unregister) unregisterFns.push(unregister);
    }
  }

  return () => unregisterFns.forEach((unregister) => unregister());
}
