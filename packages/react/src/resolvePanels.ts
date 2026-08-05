import type { PanelRegistry } from "@rifrocket/fabricjs-design-tool";
import type { ComponentType } from "react";

// A host-provided override replaces whatever plugins registered for that slot.
export function resolvePanelComponents(
  registry: PanelRegistry,
  slot: string,
  override?: ComponentType,
): ComponentType[] {
  if (override) return [override];
  return registry.getSlot(slot).map((panel) => panel.component as ComponentType);
}
