import { useEffect } from "react";
import type { KeyboardShortcutManager } from "@rifrocket/fdt-core";
import { normalizeKeyEvent } from "@rifrocket/fdt-core";

const EDITABLE_SELECTOR = "input, textarea, select, [contenteditable=\"true\"]";

// Translates real keydown events into combo strings and dispatches them through a
// KeyboardShortcutManager. Decoupled from CanvasEngine so it can bind to any manager.
//
// Keystrokes while an editable element has focus are never dispatched. This isn't optional:
// KeyboardShortcutManager.handle() calls its bound handler and returns true purely because a
// binding EXISTS for that combo, before the handler runs — so this hook would otherwise call
// preventDefault() on ordinary typing (a plain "s", Backspace, arrow keys, Ctrl+A/C/V, all
// commonly bound) with no way for an individual binding to opt back in after the fact. A
// consumer whose shortcut genuinely needs to fire while typing (rare) should attach its own
// listener directly to that field instead of relying on the global manager for it.
export function useKeyboardShortcuts(manager: KeyboardShortcutManager | null, target: EventTarget = window): void {
  useEffect(() => {
    if (!manager) return;

    const handleKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      const eventTarget = keyboardEvent.target;
      if (eventTarget instanceof Element && eventTarget.matches(EDITABLE_SELECTOR)) return;
      const handled = manager.handle(normalizeKeyEvent(keyboardEvent));
      if (handled) keyboardEvent.preventDefault();
    };

    target.addEventListener("keydown", handleKeyDown);
    return () => target.removeEventListener("keydown", handleKeyDown);
  }, [manager, target]);
}
