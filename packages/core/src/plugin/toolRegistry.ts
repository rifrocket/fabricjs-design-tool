import { Registry } from "./registry";

export interface ToolActivationContext {
  toolId: string;
}

export interface ToolDefinition {
  cursor?: string;
  icon?: unknown;
  // A keyboard combo (e.g. "v", "ctrl+z") the host can auto-bind to activate this tool,
  // so switching tools doesn't require pointing at a toolbar icon.
  shortcut?: string;
  onActivate?(context: ToolActivationContext): void;
  onDeactivate?(context: ToolActivationContext): void;
}

// Tool = interaction mode (select/pan/draw/crop/...), exactly one active at a time.
export class ToolRegistry extends Registry<ToolDefinition> {
  private activeToolId: string | null = null;

  activate(toolId: string): void {
    const definition = this.get(toolId);
    if (!definition) {
      throw new Error(`No tool registered for "${toolId}"`);
    }
    if (this.activeToolId === toolId) return;

    if (this.activeToolId) {
      const previous = this.get(this.activeToolId);
      previous?.onDeactivate?.({ toolId: this.activeToolId });
    }
    this.activeToolId = toolId;
    definition.onActivate?.({ toolId });
  }

  getActiveToolId(): string | null {
    return this.activeToolId;
  }

  unregister(toolId: string): void {
    super.unregister(toolId);
    if (this.activeToolId === toolId) this.activeToolId = null;
  }
}
