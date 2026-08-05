import type { ObjectTypeRegistry, PropertyFieldDefinition } from "@rifrocket/fabricjs-design-tool";

export function resolvePropertyFields(registry: ObjectTypeRegistry, typeId: string): PropertyFieldDefinition[] {
  return registry.get(typeId)?.propertyFields ?? [];
}
