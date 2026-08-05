import type { EffectCategory, EffectDefinition } from "../effects/types";

// Map-backed, throw-on-duplicate registry — same idiom as ObjectTypeRegistry: any plugin can
// register a new effect (built-in or third-party) without editing this package's source.
export class EffectRegistry {
  private readonly effects = new Map<string, EffectDefinition>();

  // Generic so a call site passing a concretely-typed EffectDefinition<ShadowProps> (etc.)
  // infers TProps from that argument, matching ObjectTypeRegistry.register<TConfig>'s pattern —
  // without this, TypeScript checks the argument against the widened default TProps and rejects
  // it (a named interface doesn't structurally satisfy Record<string, unknown> as a parameter
  // type without an explicit index signature).
  register<TProps extends object>(definition: EffectDefinition<TProps>): void {
    if (this.effects.has(definition.id)) {
      throw new Error(`Effect "${definition.id}" is already registered`);
    }
    this.effects.set(definition.id, definition as unknown as EffectDefinition);
  }

  unregister(id: string): void {
    this.effects.delete(id);
  }

  // Atomic unregister+register, same idiom as Registry.replace().
  replace<TProps extends object>(definition: EffectDefinition<TProps>): void {
    this.effects.set(definition.id, definition as unknown as EffectDefinition);
  }

  get(id: string): EffectDefinition | undefined {
    return this.effects.get(id);
  }

  has(id: string): boolean {
    return this.effects.has(id);
  }

  list(): EffectDefinition[] {
    return Array.from(this.effects.values());
  }

  listByCategory(category: EffectCategory): EffectDefinition[] {
    return this.list().filter((definition) => definition.category === category);
  }
}
