import type { ShapeConfig } from "./types";
import type { PolygonShapeType } from "./shapeCoordinates";

// Finite literal unions (like PolygonShapeType) can't be used as an index signature — TS
// requires the index key to be `string`/a `${string}` pattern, not an enumerated union — so
// this expands PolygonShapeType's members into concrete interface properties instead, via
// `extends`. Stays in sync with SHAPE_COORDINATES automatically since PolygonShapeType is
// derived from it (shapeCoordinates.ts), not hand-duplicated here.
type PolygonShapeTypeMap = Record<PolygonShapeType, ShapeConfig>;

// Module augmentation: gives every id this package registers via registerBasicShapes()
// typo-checked autocomplete wherever a typeId is passed (ObjectTypeRegistry.get/has/create/
// registerPropertyFields, CanvasEngine.addObjectOfType, ...) for any consumer that imports
// this package — no action needed beyond the import.
declare module "@rifrocket/fabricjs-design-tool" {
  interface ObjectTypeMap extends PolygonShapeTypeMap {
    text: ShapeConfig;
    rect: ShapeConfig;
    circle: ShapeConfig;
    line: ShapeConfig;
    ellipse: ShapeConfig;
    "rounded-rectangle": ShapeConfig;
  }
}
