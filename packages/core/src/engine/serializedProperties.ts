import { ID_PROPERTY } from "./objectId";

// Shared registry of extra property names every canvas.toObject() call (JSON export, document
// snapshot, clone) must carry beyond Fabric's own defaults — replaces the two independent
// hardcoded arrays that used to live in canvasExporter.ts and snapshot.ts, which meant a new
// custom property (e.g. an effect stack) had to be added in two places to actually round-trip.
const serializedProperties = new Set<string>([ID_PROPERTY]);

export function registerSerializedProperty(name: string): void {
  serializedProperties.add(name);
}

export function getSerializedProperties(): string[] {
  return Array.from(serializedProperties);
}
