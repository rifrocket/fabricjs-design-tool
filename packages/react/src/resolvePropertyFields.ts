import type { ObjectTypeRegistry, PropertyFieldDefinition } from "@rifrocket/fdt-core";

export function resolvePropertyFields(registry: ObjectTypeRegistry, typeId: string): PropertyFieldDefinition[] {
  return registry.get(typeId)?.propertyFields ?? [];
}
