import type { FabricObject } from "fabric";
import type { SceneNode } from "../scene/sceneNode";

export interface PropertyFieldOption {
  label: string;
  value: unknown;
}

// Common slider/number/select field metadata, kept minimal — anything beyond this goes through
// the field component's own props instead of widening this shared shape per-plugin.
export interface PropertyFieldConfig {
  min?: number;
  max?: number;
  step?: number;
  options?: PropertyFieldOption[];
}

export interface PropertyFieldDefinition {
  key: string;
  label?: string;
  component?: unknown;
  config?: PropertyFieldConfig;
  // Both optional; `section` groups consecutive fields under one heading, `span: "half"` pairs
  // two fields in the same section into a 2-column row (see buildPropertyFieldRows.ts).
  section?: string;
  span?: "half" | "full";
}

// Lives in core, not packages/react, so @rifrocket/fdt-properties's field components can type
// against it without a cyclic dependency (react depends on properties-backed plugins transitively).
export interface PropertyFieldProps {
  object: FabricObject;
  field: PropertyFieldDefinition;
  onChange: (value: unknown) => void;
}

// TNode defaults to FabricObject so every existing registration (ObjectTypeDefinition<TConfig>,
// no second type argument) means exactly what it means today — this widening is the whole point
// of FUTURE_IMPLEMENTATION.md's Chunk 1.2, not a change any existing plugin needs to make.
export interface ObjectTypeDefinition<TConfig = unknown, TNode extends SceneNode = FabricObject> {
  // Async because real object types need it (QR codes, image uploads, SVG import all
  // decode/generate asynchronously) — create() is always awaited by the registry.
  create(config: TConfig): TNode | Promise<TNode>;
  propertyFields?: PropertyFieldDefinition[];
  // Optional per-object-type serialization hooks — unused by any shipped plugin until
  // FUTURE_IMPLEMENTATION.md Stage 5/6 wires them into the serialization pipeline. Declared now
  // so those stages don't need another registry-touching change.
  serialize?(node: TNode): Record<string, unknown>;
  deserialize?(data: Record<string, unknown>, ctx: { object: TNode }): void | Promise<void>;
}

// Open interface (module-augmentation pattern) a plugin can extend to get typo-checked
// autocomplete for its own object type ids everywhere a typeId is passed — without core (or
// any other plugin) needing to know about the plugin's types ahead of time. E.g.
// plugin-shapes-basic does:
//
//   declare module "@rifrocket/fabricjs-design-tool" {
//     interface ObjectTypeMap { rect: ShapeConfig; circle: ShapeConfig; ... }
//   }
//
// Left empty by default; each plugin augments it for its own type ids once installed.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ObjectTypeMap {}

// `keyof ObjectTypeMap` gives autocomplete/typo-checking for ids augmented via ObjectTypeMap;
// `(string & {})` keeps any other string assignable (dynamic/third-party ids, or before any
// plugin has augmented the map) without widening the literal union away in editor tooltips.
export type ObjectTypeId = keyof ObjectTypeMap | (string & {});

// Replaces v1's closed ShapeFactory static class: any plugin can register a new
// object type (create/serialize/property-fields) without editing this package's source.
//
// Generic over TNode (default FabricObject) so a non-Fabric renderer's node type can be
// registered against too — see FUTURE_IMPLEMENTATION.md Chunk 1.2. Every existing call site
// (`registry.register<ShapeConfig>("rect", {...})` in plugin-shapes-basic/plugin-image) omits
// the type argument, so the default keeps meaning exactly what it means today.
export class ObjectTypeRegistry<TNode extends SceneNode = FabricObject> {
  private readonly types = new Map<string, ObjectTypeDefinition<unknown, TNode>>();

  register<TConfig>(typeId: ObjectTypeId, definition: ObjectTypeDefinition<TConfig, TNode>): void {
    if (this.types.has(typeId)) {
      throw new Error(`Object type "${typeId}" is already registered`);
    }
    this.types.set(typeId, definition as ObjectTypeDefinition<unknown, TNode>);
  }

  unregister(typeId: ObjectTypeId): void {
    this.types.delete(typeId);
  }

  // Atomic unregister+register, avoiding a transient gap where typeId resolves to nothing.
  replace<TConfig>(typeId: ObjectTypeId, definition: ObjectTypeDefinition<TConfig, TNode>): void {
    this.types.set(typeId, definition as ObjectTypeDefinition<unknown, TNode>);
  }

  get(typeId: ObjectTypeId): ObjectTypeDefinition<unknown, TNode> | undefined {
    return this.types.get(typeId);
  }

  has(typeId: ObjectTypeId): boolean {
    return this.types.has(typeId);
  }

  list(): string[] {
    return Array.from(this.types.keys());
  }

  async create(typeId: ObjectTypeId, config: unknown): Promise<TNode> {
    const definition = this.types.get(typeId);
    if (!definition) {
      throw new Error(`No object type registered for "${typeId}"`);
    }
    return definition.create(config);
  }

  registerPropertyFields(typeId: ObjectTypeId, fields: PropertyFieldDefinition[]): void {
    const definition = this.types.get(typeId);
    if (!definition) {
      throw new Error(`No object type registered for "${typeId}"`);
    }
    definition.propertyFields = [...(definition.propertyFields ?? []), ...fields];
  }
}
