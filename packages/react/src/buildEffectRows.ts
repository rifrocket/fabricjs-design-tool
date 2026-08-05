import type { EffectDefinition, EffectInstance, EffectRegistry, EffectStack } from "@rifrocket/fdt-core";

export interface EffectRow {
  instance: EffectInstance;
  definition: EffectDefinition;
}

// Pure view-model pairing each stack instance with its resolved definition, independent of any
// live canvas — an instance whose effect id is no longer registered is dropped rather than
// crashing a panel built on top of this.
export function buildEffectRows(stack: EffectStack, registry: EffectRegistry): EffectRow[] {
  return stack
    .map((instance) => {
      const definition = registry.get(instance.effectId);
      return definition ? { instance, definition } : undefined;
    })
    .filter((row): row is EffectRow => row !== undefined);
}
