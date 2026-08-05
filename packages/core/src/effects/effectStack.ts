import type { FabricObject } from "fabric";
import { EFFECTS_PROPERTY } from "./types";
import type { EffectDefinition, EffectInstance, EffectStack } from "./types";

let counter = 0;
function newInstanceId(effectId: string): string {
  counter += 1;
  return `${effectId}_${counter}`;
}

// Reads the current stack off a FabricObject — never undefined, so callers don't need to
// null-check before passing the result into the mutators below.
export function getEffectStack(object: FabricObject): EffectStack {
  const value = object.get(EFFECTS_PROPERTY) as EffectStack | undefined;
  return Array.isArray(value) ? value : [];
}

// Every mutator below is pure: it takes a stack and returns a new one. Callers commit the result
// via engine.setObjectProperty(object, EFFECTS_PROPERTY, next) to get undo/redo and live preview
// through the existing SetPropertyCommand path — none of these touch a FabricObject or the engine.

export function addEffect(stack: EffectStack, definition: EffectDefinition): EffectStack {
  const instance: EffectInstance = {
    instanceId: newInstanceId(definition.id),
    effectId: definition.id,
    enabled: true,
    props: { ...definition.defaults },
  };
  return [...stack, instance];
}

export function removeEffect(stack: EffectStack, instanceId: string): EffectStack {
  return stack.filter((instance) => instance.instanceId !== instanceId);
}

export function toggleEffect(stack: EffectStack, instanceId: string): EffectStack {
  return stack.map((instance) =>
    instance.instanceId === instanceId ? { ...instance, enabled: !instance.enabled } : instance,
  );
}

export function duplicateEffect(stack: EffectStack, instanceId: string): EffectStack {
  const index = stack.findIndex((instance) => instance.instanceId === instanceId);
  if (index === -1) return stack;
  const source = stack[index];
  const copy: EffectInstance = { ...source, instanceId: newInstanceId(source.effectId), props: { ...source.props } };
  const next = [...stack];
  next.splice(index + 1, 0, copy);
  return next;
}

export function reorderEffect(stack: EffectStack, fromIndex: number, toIndex: number): EffectStack {
  if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= stack.length) return stack;
  const clampedTo = Math.max(0, Math.min(toIndex, stack.length - 1));
  const next = [...stack];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(clampedTo, 0, moved);
  return next;
}

export function updateEffectProps(
  stack: EffectStack,
  instanceId: string,
  propsPatch: Record<string, unknown>,
): EffectStack {
  return stack.map((instance) =>
    instance.instanceId === instanceId ? { ...instance, props: { ...instance.props, ...propsPatch } } : instance,
  );
}

export function resetEffect(stack: EffectStack, instanceId: string, definition: EffectDefinition): EffectStack {
  return stack.map((instance) =>
    instance.instanceId === instanceId ? { ...instance, props: { ...definition.defaults } } : instance,
  );
}

export function resetAllEffects(): EffectStack {
  return [];
}
