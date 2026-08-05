export interface ShortcutBinding {
  key: string;
  handler: () => void;
  description?: string;
}

export interface KeyCombo {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

// Normalizes a keyboard event into a matchable combo string like "ctrl+shift+z".
// ctrl and meta are treated as the same modifier so one binding works on Windows/Linux and macOS.
export function normalizeKeyEvent(event: KeyCombo): string {
  const parts: string[] = [];
  if (event.ctrlKey || event.metaKey) parts.push("ctrl");
  if (event.shiftKey) parts.push("shift");
  if (event.altKey) parts.push("alt");
  parts.push(event.key.toLowerCase());
  return parts.join("+");
}

// Rebuilds v1's registerShortcut idiom (the one part of its keyboard system the audit
// called out as sound) as a registry, consistent with the rest of the plugin system.
export class KeyboardShortcutManager {
  private readonly bindings = new Map<string, ShortcutBinding>();

  // Throws on a combo that's already bound, matching ObjectTypeRegistry/EffectRegistry/generic
  // Registry<T> — two independently-authored plugins silently stealing each other's shortcut is
  // a real bug class, not a legitimate use case. Use replace() for an intentional override.
  register(combo: string, handler: () => void, description?: string): () => void {
    const key = combo.toLowerCase();
    if (this.bindings.has(key)) {
      throw new Error(`Shortcut "${key}" is already registered`);
    }
    this.bindings.set(key, { key, handler, description });
    return () => this.bindings.delete(key);
  }

  // Atomic unregister+register, mirroring Registry<T>.replace() — the intentional
  // "install or overwrite" escape hatch for a combo that's already bound.
  replace(combo: string, handler: () => void, description?: string): () => void {
    const key = combo.toLowerCase();
    this.bindings.set(key, { key, handler, description });
    return () => this.bindings.delete(key);
  }

  unregister(combo: string): void {
    this.bindings.delete(combo.toLowerCase());
  }

  has(combo: string): boolean {
    return this.bindings.has(combo.toLowerCase());
  }

  list(): ShortcutBinding[] {
    return Array.from(this.bindings.values());
  }

  // Looks up and invokes the handler for a combo string; returns whether one was found.
  handle(combo: string): boolean {
    const binding = this.bindings.get(combo.toLowerCase());
    if (!binding) return false;
    binding.handler();
    return true;
  }
}
