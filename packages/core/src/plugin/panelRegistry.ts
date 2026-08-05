export interface PanelDefinition {
  component: unknown;
  order?: number;
}

// Named UI slots (e.g. "sidebar-right", "toolbar-start") a plugin can render into,
// without forking the host application's layout components. Unlike the other registries,
// a slot legitimately holds many entries at once (every plugin panel sharing "sidebar-right"),
// so "duplicate" here means the same `component` registered into the same slot twice — a
// double-install, not two different plugins coexisting.
export class PanelRegistry {
  private readonly slots = new Map<string, PanelDefinition[]>();

  register(slot: string, definition: PanelDefinition): () => void {
    const panels = this.slots.get(slot) ?? [];
    if (panels.some((panel) => panel.component === definition.component)) {
      throw new Error(`A panel for this component is already registered in slot "${slot}"`);
    }
    this.insert(slot, panels, definition);
    return () => this.unregister(slot, definition);
  }

  // Atomic unregister+register, mirroring Registry<T>.replace() — the intentional
  // "install or overwrite" escape hatch for a component re-registering into the same slot.
  replace(slot: string, definition: PanelDefinition): () => void {
    const panels = (this.slots.get(slot) ?? []).filter((panel) => panel.component !== definition.component);
    this.insert(slot, panels, definition);
    return () => this.unregister(slot, definition);
  }

  private insert(slot: string, panels: PanelDefinition[], definition: PanelDefinition): void {
    panels.push(definition);
    panels.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.slots.set(slot, panels);
  }

  unregister(slot: string, definition: PanelDefinition): void {
    const panels = this.slots.get(slot);
    if (!panels) return;
    const index = panels.indexOf(definition);
    if (index !== -1) panels.splice(index, 1);
  }

  getSlot(slot: string): PanelDefinition[] {
    return this.slots.get(slot) ?? [];
  }

  listSlots(): string[] {
    return Array.from(this.slots.keys());
  }
}
